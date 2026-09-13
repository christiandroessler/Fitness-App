// Orchestriert das Laden/Speichern des Gesamtdatenbestands in Google Drive,
// erkennt Nebenläufigkeitskonflikte über die Datei-Revision (3.4) und stellt
// Export/Import als Datei bereit (3.7).
import type { AppData } from '../types';
import { emptyAppData } from '../types';
import * as drive from './drive';

const FILE_ID_KEY = 'kraftmob_drive_file_id';
const REVISION_KEY = 'kraftmob_drive_revision';
const LOCAL_FALLBACK_KEY = 'kraftmob_local_data';

export class ConflictError extends Error {
  remote: AppData;
  remoteRevision?: string;
  constructor(remote: AppData, remoteRevision?: string) {
    super('Es liegt eine neuere Version dieser Daten in Google Drive vor (vermutlich von einem anderen Gerät gespeichert).');
    this.remote = remote;
    this.remoteRevision = remoteRevision;
  }
}

function getCachedFileId(): string | null {
  return localStorage.getItem(FILE_ID_KEY);
}
function setCachedFileId(id: string) {
  localStorage.setItem(FILE_ID_KEY, id);
}
function setCachedRevision(rev: string | undefined) {
  if (rev) localStorage.setItem(REVISION_KEY, rev);
}
function getCachedRevision(): string | null {
  return localStorage.getItem(REVISION_KEY);
}

export interface LoadResult {
  data: AppData;
  fileId: string;
  revision?: string;
}

/** Lädt den Datenbestand aus Google Drive. Legt die Datei beim ersten Aufruf an. */
export async function loadFromDrive(seed: () => AppData): Promise<LoadResult> {
  let fileId = getCachedFileId();
  let meta: drive.DriveFileMeta | null = null;

  if (fileId) {
    try {
      meta = await drive.getFileMeta(fileId);
    } catch {
      fileId = null;
    }
  }
  if (!meta) {
    // Lokaler Cache verloren (z. B. Browser-Speicher gelöscht) — Datei über den
    // drive.file-Scope erneut anhand des Namens finden (Abnahmekriterium 3).
    meta = await drive.findAppDataFile();
    if (meta) fileId = meta.id;
  }
  if (!meta || !fileId) {
    const initial = seed();
    const created = await drive.createJsonFile(drive.APP_DATA_FILENAME, initial);
    setCachedFileId(created.id);
    setCachedRevision(created.headRevisionId);
    return { data: initial, fileId: created.id, revision: created.headRevisionId };
  }

  setCachedFileId(fileId);
  const data = await drive.downloadFile<AppData>(fileId);
  setCachedRevision(meta.headRevisionId);
  return { data, fileId, revision: meta.headRevisionId };
}

/** Speichert nach Google Drive; wirft ConflictError, wenn sich die Revision seit dem
 * letzten Laden geändert hat (paralleler Speichervorgang auf einem anderen Gerät). */
export async function saveToDrive(fileId: string, knownRevision: string | undefined, data: AppData): Promise<{ revision?: string }> {
  const currentMeta = await drive.getFileMeta(fileId);
  if (knownRevision && currentMeta.headRevisionId && currentMeta.headRevisionId !== knownRevision) {
    const remote = await drive.downloadFile<AppData>(fileId);
    throw new ConflictError(remote, currentMeta.headRevisionId);
  }
  const updated = await drive.updateJsonFile(fileId, data);
  setCachedRevision(updated.headRevisionId);
  return { revision: updated.headRevisionId };
}

/** Überschreibt die Drive-Datei unabhängig von der Revision (Nutzerentscheidung im
 * Konfliktdialog: "meine Version behalten"). */
export async function forceSaveToDrive(fileId: string, data: AppData): Promise<{ revision?: string }> {
  const updated = await drive.updateJsonFile(fileId, data);
  setCachedRevision(updated.headRevisionId);
  return { revision: updated.headRevisionId };
}

export function acceptRemoteRevision(revision: string | undefined) {
  setCachedRevision(revision);
}

// ---- Lokaler Fallback, solange keine Google-Anmeldung besteht ----
// Die Architektur ist Drive-first (Lastenheft 3.3); dieser Fallback erlaubt es,
// die App bereits vor Einrichtung eines eigenen Google-OAuth-Clients auszuprobieren.

export function loadLocalFallback(seed: () => AppData): AppData {
  const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    const initial = seed();
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(initial));
    return initial;
  }
}

export function saveLocalFallback(data: AppData) {
  localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(data));
}

// ---- Export / Import (3.7, Pflicht-Datensicherung) ----

export function exportToFile(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `kraft-mobility-export-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importFromFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.exercises)) {
          throw new Error('Unbekanntes oder beschädigtes Dateiformat.');
        }
        resolve(parsed as AppData);
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Datei konnte nicht gelesen werden.'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsText(file, 'utf-8');
  });
}

export function defaultSeed(): AppData {
  return emptyAppData();
}
