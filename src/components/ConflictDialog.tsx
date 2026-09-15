import { useAppDataApi, useAppDataState } from '../lib/AppDataContext';

export function ConflictDialog() {
  const { conflict } = useAppDataState();
  const api = useAppDataApi();
  if (!conflict) return null;

  return (
    <div className="modal-overlay" role="alertdialog" aria-modal="true">
      <div className="modal-panel">
        <h2>Unterschiedliche Änderungen erkannt</h2>
        <p>
          Auf einem anderen Gerät wurde zwischenzeitlich ebenfalls gespeichert. Beide Versionen können nicht automatisch zusammengeführt werden — welche soll gelten?
        </p>
        <div className="conflict-actions">
          <button className="btn-primary" onClick={api.resolveConflictKeepMine}>
            Meine Änderungen behalten (überschreiben)
          </button>
          <button className="btn-secondary" onClick={api.resolveConflictTakeRemote}>
            Andere Version übernehmen (meine verwerfen)
          </button>
        </div>
      </div>
    </div>
  );
}
