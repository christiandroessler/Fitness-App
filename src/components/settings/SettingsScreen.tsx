import { useRef, useState } from 'react';
import { ALLE_EQUIPMENT, EQUIPMENT_LABEL, type Equipment } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { getClientId } from '../../lib/googleAuth';

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

  return (
    <div className="screen">
      <h2>Einstellungen</h2>

      <section className="settings-section">
        <h3>Google Drive</h3>
        <p className="settings-status">
          Status: {state.mode === 'drive' ? (state.signedIn ? 'Verbunden mit Google Drive' : 'Nicht verbunden') : 'Lokal (nicht mit Google Drive gesichert)'}
          {state.syncing && ' · synchronisiere…'}
        </p>
        <label>
          Google-OAuth-Client-ID
          <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="xxxxxxxx.apps.googleusercontent.com" />
        </label>
        <button className="btn-secondary" onClick={() => api.setGoogleClientId(clientId)}>
          Client-ID speichern
        </button>
        <div className="settings-actions-row">
          <button className="btn-primary" onClick={() => api.connectGoogle()} disabled={!state.hasClientId}>
            Mit Google verbinden
          </button>
          {state.mode === 'drive' && (
            <button className="btn-secondary" onClick={api.disconnectGoogle}>
              Trennen
            </button>
          )}
        </div>
        {!state.hasClientId && <p className="settings-hint">Ohne Client-ID läuft die App im lokalen Modus (Daten nur in diesem Browser). Siehe README für die Einrichtung.</p>}
      </section>

      <section className="settings-section">
        <h3>Verfügbares Equipment</h3>
        <p className="settings-hint">Der Generator wählt nur Übungen, deren Equipment hier aktiviert ist.</p>
        <div className="checkbox-group-grid">
          {ALLE_EQUIPMENT.filter((e) => e !== 'keins').map((eq) => (
            <label key={eq} className="checkbox-label">
              <input type="checkbox" checked={state.data.settings.verfuegbaresEquipment.includes(eq)} onChange={() => toggleEquipment(eq)} />
              {EQUIPMENT_LABEL[eq]}
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section">
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
      </section>

      <section className="settings-section">
        <h3>Datensicherung</h3>
        <p className="settings-hint">Es gibt kein automatisches Backup — Export/Import als Datei ist die einzige Sicherung.</p>
        <div className="settings-actions-row">
          <button className="btn-secondary" onClick={api.exportData}>
            Daten exportieren
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            Daten importieren
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
      </section>
    </div>
  );
}
