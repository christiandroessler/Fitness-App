import { useRef, useState } from 'react';
import { ALLE_EQUIPMENT, EQUIPMENT_LABEL, type Equipment } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { getClientId } from '../../lib/googleAuth';
import { Barbell, Chair, CloudCheck, CloudSlash, Couch, DoorOpen, Stairs, TShirt, WaveSine, Wall, type Icon } from '@phosphor-icons/react';

const EQUIPMENT_ICON: Record<Equipment, Icon> = {
  langhantel_20kg: Barbell,
  kurzhantel_5kg_paar: Barbell,
  kurzhantel_15kg: Barbell,
  widerstandsband: WaveSine,
  wand: Wall,
  tuerrahmen: DoorOpen,
  stuhl_bank: Chair,
  treppenstufe: Stairs,
  sofa: Couch,
  handtuch: TShirt,
  keins: Barbell
};

function formatSyncedAt(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const zeit = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const heute = d.toDateString() === now.toDateString();
  return heute ? `heute, ${zeit}` : `${d.toLocaleDateString('de-DE')}, ${zeit}`;
}

export function SettingsScreen() {
  const state = useAppDataState();
  const api = useAppDataApi();
  const [clientId, setClientId] = useState(getClientId() ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function toggleEquipment(eq: Equipment) {
    api.mutate((d) => {
      const has = d.settings.verfuegbaresEquipment.includes(eq);
      return { ...d, settings: { ...d.settings, verfuegbaresEquipment: has ? d.settings.verfuegbaresEquipment.filter((e) => e !== eq) : [...d.settings.verfuegbaresEquipment, eq] } };
    });
  }

  async function onImportFile(file: File) {
    setImportError(null);
    try {
      await api.importData(file);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import fehlgeschlagen.');
    }
  }

  const verbunden = state.mode === 'drive' && state.signedIn;

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Einstellungen</h2>
        <span className="screen-header-meta">Drive &amp; Equipment</span>
      </div>

      <div className="card settings-section">
        <p className="settings-status">
          {verbunden ? <CloudCheck size={18} className="status-icon-teal" /> : <CloudSlash size={18} />}
          <strong style={{ color: 'var(--text)' }}>{verbunden ? 'Google Drive verbunden' : state.mode === 'drive' ? 'Nicht verbunden' : 'Lokaler Modus'}</strong>
        </p>
        <p className="settings-hint">
          {verbunden
            ? `Zuletzt gesichert ${formatSyncedAt(state.lastSyncedAt)}${state.revision ? ` · Revision ${state.revision}` : ''}. Daten liegen nur in deinem Drive.`
            : 'Ohne Verbindung werden Daten nur lokal in diesem Browser gespeichert.'}
          {state.syncing && ' · synchronisiere…'}
        </p>

        <div className="settings-actions-row">
          <button className="btn-secondary" onClick={api.exportData}>
            Export
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onImportFile(file);
              e.target.value = '';
            }}
          />
        </div>
        {importError && <p className="error-text">{importError}</p>}

        <label>
          Google-OAuth-Client-ID
          <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="xxxxxxxx.apps.googleusercontent.com" />
        </label>
        <div className="settings-actions-row">
          <button className="btn-secondary" onClick={() => api.setGoogleClientId(clientId)}>
            Client-ID speichern
          </button>
          <button className="btn-primary" onClick={() => api.connectGoogle()} disabled={!state.hasClientId}>
            Mit Google verbinden
          </button>
          {state.mode === 'drive' && (
            <button className="btn-secondary" onClick={api.disconnectGoogle}>
              Trennen
            </button>
          )}
        </div>
        {!state.hasClientId && <p className="settings-hint">Ohne Client-ID läuft die App im lokalen Modus. Siehe README für die Einrichtung.</p>}
      </div>

      <div className="card settings-section">
        <h3>Verfügbares Equipment</h3>
        <p className="settings-hint">Der Generator wählt nur Übungen, deren Equipment hier aktiviert ist.</p>
        <div className="chip-row">
          {ALLE_EQUIPMENT.filter((e) => e !== 'keins').map((eq) => {
            const active = state.data.settings.verfuegbaresEquipment.includes(eq);
            const EqIcon = EQUIPMENT_ICON[eq];
            return (
              <button key={eq} type="button" className={`chip ${active ? 'active' : ''}`} onClick={() => toggleEquipment(eq)}>
                <EqIcon size={15} />
                {EQUIPMENT_LABEL[eq]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card settings-section">
        <h3>Generator</h3>
        <label>
          Letzte n Einheiten für Wiederholungsvermeidung
          <input
            type="number"
            min={0}
            max={10}
            value={state.data.settings.letzteNGenerator}
            onChange={(e) => api.mutate((d) => ({ ...d, settings: { ...d.settings, letzteNGenerator: Number(e.target.value) } }))}
          />
        </label>
      </div>
    </div>
  );
}
