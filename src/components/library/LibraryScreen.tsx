import { useMemo, useState } from 'react';
import type { Bewegungsmuster, Equipment, Exercise, Kategorie } from '../../types';
import { BEWEGUNGSMUSTER_LABEL, EQUIPMENT_LABEL, KATEGORIE_LABEL } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { ExerciseForm } from './ExerciseForm';
import { StickFigure } from '../StickFigure';
import { getPoseFrames } from '../figures/poses';

export function LibraryScreen() {
  const { data } = useAppDataState();
  const api = useAppDataApi();
  const [suche, setSuche] = useState('');
  const [kategorie, setKategorie] = useState<Kategorie | ''>('');
  const [bewegungsmuster, setBewegungsmuster] = useState<Bewegungsmuster | ''>('');
  const [equipmentFilter, setEquipmentFilter] = useState<Equipment | ''>('');
  const [editing, setEditing] = useState<Exercise | 'new' | null>(null);

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLowerCase();
    return data.exercises
      .filter(
        (ex) =>
          (!kategorie || ex.kategorie === kategorie) &&
          (!bewegungsmuster || ex.bewegungsmuster === bewegungsmuster) &&
          (!equipmentFilter || ex.equipment.includes(equipmentFilter)) &&
          (!s || ex.name.toLowerCase().includes(s))
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [data.exercises, suche, kategorie, bewegungsmuster, equipmentFilter]);

  function saveExercise(ex: Exercise) {
    api.mutate((d) => {
      const exists = d.exercises.some((e) => e.id === ex.id);
      return { ...d, exercises: exists ? d.exercises.map((e) => (e.id === ex.id ? ex : e)) : [...d.exercises, ex] };
    });
    setEditing(null);
  }

  function deleteExercise(id: string) {
    api.mutate((d) => ({ ...d, exercises: d.exercises.filter((e) => e.id !== id) }));
    setEditing(null);
  }

  if (editing) {
    return (
      <div className="screen">
        <h2>{editing === 'new' ? 'Neue Übung' : 'Übung bearbeiten'}</h2>
        <ExerciseForm
          initial={editing === 'new' ? undefined : editing}
          onSave={saveExercise}
          onCancel={() => setEditing(null)}
          onDelete={editing === 'new' ? undefined : () => deleteExercise(editing.id)}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Übungsbibliothek</h2>
        <button className="btn-primary" onClick={() => setEditing('new')}>
          + Neue Übung
        </button>
      </div>

      <div className="library-filters">
        <input type="search" placeholder="Suchen…" value={suche} onChange={(e) => setSuche(e.target.value)} />
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
        <select value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value as Equipment | '')}>
          <option value="">Alle Equipment</option>
          {Object.entries(EQUIPMENT_LABEL).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <p className="library-count">{gefiltert.length} Übungen</p>

      <div className="library-list">
        {gefiltert.map((ex) => {
          const frames = getPoseFrames(ex.figur_id);
          return (
            <button key={ex.id} className="library-item" onClick={() => setEditing(ex)}>
              <div className="library-item-figure">{frames ? <StickFigure frames={frames} active={false} /> : <div className="figure-placeholder">🏋</div>}</div>
              <div className="library-item-info">
                <strong>{ex.name}</strong>
                <span>
                  {KATEGORIE_LABEL[ex.kategorie]} · {BEWEGUNGSMUSTER_LABEL[ex.bewegungsmuster]}
                  {ex.einseitig ? ' · einseitig' : ''}
                </span>
                <span className="library-item-equipment">{ex.equipment.length ? ex.equipment.map((e) => EQUIPMENT_LABEL[e]).join(', ') : 'kein Equipment'}</span>
              </div>
            </button>
          );
        })}
        {gefiltert.length === 0 && <p className="empty-hint">Keine Übungen gefunden.</p>}
      </div>
    </div>
  );
}
