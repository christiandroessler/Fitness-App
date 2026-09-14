import { useState } from 'react';
import type { TrainingSet } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { SetBuilder, buildLeeresSet } from '../builder/SetBuilder';
import { formatDuration, exerciseDurationSeconds } from '../../lib/duration';

interface SetsScreenProps {
  onStart: (set: TrainingSet) => void;
}

export function SetsScreen({ onStart }: SetsScreenProps) {
  const { data } = useAppDataState();
  const api = useAppDataApi();
  const [editing, setEditing] = useState<TrainingSet | 'new' | null>(null);

  function saveSet(set: TrainingSet) {
    api.mutate((d) => ({ ...d, sets: d.sets.some((s) => s.id === set.id) ? d.sets.map((s) => (s.id === set.id ? set : s)) : [...d.sets, set] }));
    setEditing(null);
  }
  function deleteSet(id: string) {
    api.mutate((d) => ({ ...d, sets: d.sets.filter((s) => s.id !== id) }));
    setEditing(null);
  }

  if (editing) {
    const initial = editing === 'new' ? buildLeeresSet('Neue Einheit') : editing;
    return (
      <div className="screen">
        <h2>{editing === 'new' ? 'Neue Einheit' : 'Einheit bearbeiten'}</h2>
        <SetBuilder initialSet={initial} bibliothek={data.exercises} onSave={saveSet} onStart={onStart} onCancel={() => setEditing(null)} />
        {editing !== 'new' && (
          <button className="btn-link-danger" onClick={() => deleteSet(initial.id)}>
            Diese Einheit löschen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Meine Einheiten</h2>
        <button className="btn-primary" onClick={() => setEditing('new')}>
          + Neue Einheit
        </button>
      </div>
      <div className="library-list">
        {data.sets.map((set) => {
          const dauer = set.uebungen.reduce((s, u) => s + exerciseDurationSeconds(u), 0);
          return (
            <div key={set.id} className="set-list-item">
              <button className="library-item" onClick={() => setEditing(set)}>
                <div className="library-item-info">
                  <strong>{set.name}</strong>
                  <span>
                    {set.uebungen.length} Übungen · {formatDuration(dauer)}
                  </span>
                </div>
              </button>
              <button className="btn-primary" onClick={() => onStart(set)}>
                Starten
              </button>
            </div>
          );
        })}
        {data.sets.length === 0 && <p className="empty-hint">Noch keine gespeicherten Einheiten.</p>}
      </div>
    </div>
  );
}
