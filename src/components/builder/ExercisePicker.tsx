import { useMemo, useState } from 'react';
import type { Bewegungsmuster, Exercise, Kategorie } from '../../types';
import { KATEGORIE_LABEL, BEWEGUNGSMUSTER_LABEL } from '../../types';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

interface ExercisePickerProps {
  bibliothek: Exercise[];
  onPick: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePicker({ bibliothek, onPick, onClose }: ExercisePickerProps) {
  const [suche, setSuche] = useState('');
  const [kategorie, setKategorie] = useState<Kategorie | ''>('');
  const [bewegungsmuster, setBewegungsmuster] = useState<Bewegungsmuster | ''>('');

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLowerCase();
    return bibliothek
      .filter((ex) => (!kategorie || ex.kategorie === kategorie) && (!bewegungsmuster || ex.bewegungsmuster === bewegungsmuster) && (!s || ex.name.toLowerCase().includes(s)))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [bibliothek, suche, kategorie, bewegungsmuster]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-header">
          <h2>Übung auswählen</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Schließen">
            <X size={16} />
          </button>
        </div>
        <div className="picker-filters">
          <div className="search-field">
            <MagnifyingGlass size={18} />
            <input type="search" placeholder="Suchen…" value={suche} onChange={(e) => setSuche(e.target.value)} />
          </div>
          <div className="form-row">
            <select value={kategorie} onChange={(e) => setKategorie(e.target.value as Kategorie | '')}>
              <option value="">Alle Kategorien</option>
              {Object.entries(KATEGORIE_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <select value={bewegungsmuster} onChange={(e) => setBewegungsmuster(e.target.value as Bewegungsmuster | '')}>
              <option value="">Alle Bewegungsmuster</option>
              {Object.entries(BEWEGUNGSMUSTER_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="list">
          {gefiltert.map((ex) => (
            <button key={ex.id} className="list-row" onClick={() => onPick(ex)}>
              <div className="list-row-info">
                <strong>{ex.name}</strong>
                <span className="list-row-meta">
                  {KATEGORIE_LABEL[ex.kategorie]} · {BEWEGUNGSMUSTER_LABEL[ex.bewegungsmuster]}
                </span>
              </div>
            </button>
          ))}
          {gefiltert.length === 0 && <p className="empty-hint">Keine Übungen gefunden.</p>}
        </div>
      </div>
    </div>
  );
}
