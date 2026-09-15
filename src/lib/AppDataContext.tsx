import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppData } from '../types';
import { emptyAppData } from '../types';
import { STARTBIBLIOTHEK } from '../data/exercises';
import { STARTVORLAGEN } from '../data/templates';
import * as authApi from './googleAuth';
import * as storage from './storage';
import { ConflictError } from './storage';

function buildSeedAppData(): AppData {
  return {
    ...emptyAppData(),
    exercises: STARTBIBLIOTHEK,
    templates: STARTVORLAGEN
  };
}

type Mode = 'drive' | 'local';
type Status = 'loading' | 'ready' | 'error';

interface ConflictState {
  remote: AppData;
  remoteRevision?: string;
  mine: AppData;
}

interface AppDataState {
  status: Status;
  mode: Mode;
  signedIn: boolean;
  hasClientId: boolean;
  data: AppData;
  error: string | null;
  conflict: ConflictState | null;
  syncing: boolean;
  revision?: string;
  lastSyncedAt?: string;
}

interface AppDataApi {
  mutate: (updater: (data: AppData) => AppData) => void;
  connectGoogle: () => Promise<void>;
  disconnectGoogle: () => void;
  setGoogleClientId: (id: string) => void;
  resolveConflictKeepMine: () => Promise<void>;
  resolveConflictTakeRemote: () => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  reload: () => Promise<void>;
  dismissError: () => void;
}

const AppDataStateContext = createContext<AppDataState | null>(null);
const AppDataApiContext = createContext<AppDataApi | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppDataState>({
    status: 'loading',
    mode: 'local',
    signedIn: false,
    hasClientId: !!authApi.getClientId(),
    data: buildSeedAppData(),
    error: null,
    conflict: null,
    syncing: false
  });

  const fileRef = useRef<{ fileId: string; revision?: string } | null>(null);
  // Verhindert, dass ein frisch geladener (nicht vom Nutzer geänderter) Datenstand
  // sofort wieder zurückgeschrieben wird (siehe Persistenz-Effekt weiter unten).
  const skipNextPersist = useRef(true);
  const dataRef = useRef(state.data);

  const loadLocal = useCallback(() => {
    const data = storage.loadLocalFallback(buildSeedAppData);
    skipNextPersist.current = true;
    setState((s) => ({ ...s, status: 'ready', mode: 'local', data, error: null }));
  }, []);

  const loadDrive = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const local = storage.loadLocalFallback(buildSeedAppData);
      const result = await storage.loadFromDrive(() => local);
      fileRef.current = { fileId: result.fileId, revision: result.revision };
      skipNextPersist.current = true;
      setState((s) => ({ ...s, status: 'ready', mode: 'drive', data: result.data, error: null, signedIn: true, revision: result.revision, lastSyncedAt: new Date().toISOString() }));
    } catch (e) {
      setState((s) => ({ ...s, status: 'error', error: e instanceof Error ? e.message : String(e) }));
    }
  }, []);

  useEffect(() => {
    if (authApi.hasSignedInBefore() && authApi.getClientId()) {
      authApi
        .getAccessToken()
        .then(() => loadDrive())
        .catch(() => loadLocal());
    } else {
      loadLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    async (data: AppData) => {
      if (state.mode === 'local') {
        storage.saveLocalFallback(data);
        return;
      }
      const file = fileRef.current;
      if (!file) return;
      setState((s) => ({ ...s, syncing: true }));
      try {
        const res = await storage.saveToDrive(file.fileId, file.revision, data);
        fileRef.current = { fileId: file.fileId, revision: res.revision };
        setState((s) => ({ ...s, syncing: false, revision: res.revision, lastSyncedAt: new Date().toISOString() }));
      } catch (e) {
        setState((s) => ({ ...s, syncing: false }));
        if (e instanceof ConflictError) {
          setState((s) => ({ ...s, conflict: { remote: e.remote, remoteRevision: e.remoteRevision, mine: data } }));
        } else {
          setState((s) => ({ ...s, error: e instanceof Error ? e.message : String(e) }));
        }
      }
    },
    [state.mode]
  );

  const mutate = useCallback((updater: (data: AppData) => AppData) => {
    setState((s) => ({ ...s, data: updater(s.data) }));
  }, []);

  // Persistiert jede Datenänderung, getrennt vom (rein lokalen) State-Update oben —
  // vermeidet Seiteneffekte innerhalb der setState-Updater-Funktion.
  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      dataRef.current = state.data;
      return;
    }
    if (state.data !== dataRef.current) {
      dataRef.current = state.data;
      void persist(state.data);
    }
  }, [state.data, persist]);

  const connectGoogle = useCallback(async () => {
    try {
      await authApi.signIn();
      await loadDrive();
    } catch (e) {
      setState((s) => ({ ...s, error: e instanceof Error ? e.message : String(e) }));
    }
  }, [loadDrive]);

  const disconnectGoogle = useCallback(() => {
    authApi.signOut();
    fileRef.current = null;
    loadLocal();
  }, [loadLocal]);

  const setGoogleClientId = useCallback((id: string) => {
    authApi.setClientId(id);
    setState((s) => ({ ...s, hasClientId: !!id.trim() }));
  }, []);

  const resolveConflictKeepMine = useCallback(async () => {
    const conflict = state.conflict;
    const file = fileRef.current;
    if (!conflict || !file) return;
    setState((s) => ({ ...s, syncing: true }));
    try {
      const res = await storage.forceSaveToDrive(file.fileId, conflict.mine);
      fileRef.current = { fileId: file.fileId, revision: res.revision };
      setState((s) => ({ ...s, syncing: false, conflict: null, revision: res.revision, lastSyncedAt: new Date().toISOString() }));
    } catch (e) {
      setState((s) => ({ ...s, syncing: false, error: e instanceof Error ? e.message : String(e) }));
    }
  }, [state.conflict]);

  const resolveConflictTakeRemote = useCallback(() => {
    const conflict = state.conflict;
    if (!conflict) return;
    storage.acceptRemoteRevision(conflict.remoteRevision);
    fileRef.current = fileRef.current ? { ...fileRef.current, revision: conflict.remoteRevision } : null;
    skipNextPersist.current = true;
    setState((s) => ({ ...s, data: conflict.remote, conflict: null, revision: conflict.remoteRevision, lastSyncedAt: new Date().toISOString() }));
  }, [state.conflict]);

  const exportData = useCallback(() => {
    storage.exportToFile(state.data);
  }, [state.data]);

  const importData = useCallback(
    async (file: File) => {
      const imported = await storage.importFromFile(file);
      mutate(() => imported);
    },
    [mutate]
  );

  const reload = useCallback(async () => {
    if (state.mode === 'drive') await loadDrive();
    else loadLocal();
  }, [state.mode, loadDrive, loadLocal]);

  const dismissError = useCallback(() => setState((s) => ({ ...s, error: null })), []);

  const api = useMemo<AppDataApi>(
    () => ({
      mutate,
      connectGoogle,
      disconnectGoogle,
      setGoogleClientId,
      resolveConflictKeepMine,
      resolveConflictTakeRemote,
      exportData,
      importData,
      reload,
      dismissError
    }),
    [mutate, connectGoogle, disconnectGoogle, setGoogleClientId, resolveConflictKeepMine, resolveConflictTakeRemote, exportData, importData, reload, dismissError]
  );

  return (
    <AppDataStateContext.Provider value={state}>
      <AppDataApiContext.Provider value={api}>{children}</AppDataApiContext.Provider>
    </AppDataStateContext.Provider>
  );
}

export function useAppDataState(): AppDataState {
  const ctx = useContext(AppDataStateContext);
  if (!ctx) throw new Error('useAppDataState muss innerhalb von AppDataProvider verwendet werden.');
  return ctx;
}

export function useAppDataApi(): AppDataApi {
  const ctx = useContext(AppDataApiContext);
  if (!ctx) throw new Error('useAppDataApi muss innerhalb von AppDataProvider verwendet werden.');
  return ctx;
}
