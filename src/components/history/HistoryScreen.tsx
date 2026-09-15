import type { TrainingSet } from '../../types';
import { useAppDataState } from '../../lib/AppDataContext';

interface HistoryScreenProps {
  onStart: (set: TrainingSet) => void;
}

export function HistoryScreen({ onStart }: HistoryScreenProps) {
  const { data } = useAppDataState();

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Verlauf</h2>
        <span className="screen-header-meta">{data.history.length} Einheiten</span>
      </div>
      <div className="history-list">
        {data.history.map((entry) => (
          <button
            key={entry.id}
            className={`accent-card ${entry.status === 'abgeschlossen' ? 'accent-teal' : 'accent-red'}`}
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => onStart(entry.set)}
          >
            <div className="history-item-header">
              <strong>{entry.einheitentyp}</strong>
              <span className={`pill ${entry.status === 'abgeschlossen' ? 'pill-teal' : 'pill-danger'}`}>
                {entry.status === 'abgeschlossen' ? 'Abgeschlossen' : 'Abgebrochen'}
              </span>
            </div>
            <p className="history-item-date">
              {new Date(entry.datum).toLocaleDateString('de-DE')} · {entry.uhrzeit} Uhr
            </p>
            <p className="history-item-exercises">{entry.absolvierteUebungen.map((u) => u.name).join(', ') || '—'}</p>
          </button>
        ))}
        {data.history.length === 0 && <p className="empty-hint">Noch keine absolvierten Einheiten.</p>}
      </div>
    </div>
  );
}
