import type { TrainingSet } from '../../types';
import { useAppDataState } from '../../lib/AppDataContext';

interface HistoryScreenProps {
  onStart: (set: TrainingSet) => void;
}

export function HistoryScreen({ onStart }: HistoryScreenProps) {
  const { data } = useAppDataState();

  return (
    <div className="screen">
      <h2>Verlauf</h2>
      <div className="history-list">
        {data.history.map((entry) => (
          <div key={entry.id} className={`history-item history-item-${entry.status}`}>
            <div className="history-item-header">
              <strong>{entry.einheitentyp}</strong>
              <span className={`status-badge status-${entry.status}`}>{entry.status === 'abgeschlossen' ? 'Abgeschlossen' : 'Abgebrochen'}</span>
            </div>
            <p className="history-item-date">
              {new Date(entry.datum).toLocaleDateString('de-DE')} · {entry.uhrzeit} Uhr
            </p>
            <ul className="history-item-exercises">
              {entry.absolvierteUebungen.map((u, i) => (
                <li key={i}>{u.name}</li>
              ))}
            </ul>
            <button className="btn-secondary" onClick={() => onStart(entry.set)}>
              Erneut starten
            </button>
          </div>
        ))}
        {data.history.length === 0 && <p className="empty-hint">Noch keine absolvierten Einheiten.</p>}
      </div>
    </div>
  );
}
