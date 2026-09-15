import { useMemo, useState } from 'react';
import type { Bewegungsmuster, Equipment, Exercise, ExerciseParameter, Kategorie } from '../../types';
import { BEWEGUNGSMUSTER_LABEL, EQUIPMENT_LABEL, KATEGORIE_LABEL } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { ExerciseForm } from './ExerciseForm';
import { StickFigure } from '../StickFigure';
import { getPoseFrames } from '../figures/poses';
import { CaretRight, MagnifyingGlass, Plus } from '@phosphor-icons/react';

const KATEGORIEN = Object.keys(KATEGORIE_LABEL) as Kategorie[];

function paramSummary(p: ExerciseParameter): string {
  switch (p.art) {
    case 'halten':
      return p.wiederholungen > 1 ? `${p.dauer_s} s × ${p.wiederholungen}` : `${p.dauer_s} s`;
    case 'intervall':
      return `${p.arbeit_s}/${p.pause_s} s × ${p.anzahl}`;
    case 'kraftsatz':
      return `${p.satzanzahl} × ${p.satzdauer_s} s`;
    case 'isometrie_serie':
      return `${p.kontraktion_s} s × ${p.anzahl}`;
  }
}

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="screen-header-meta">
            {gefiltert.length} von {data.exercises.length}
          </span>
          <button className="btn-icon" onClick={() => setEditing('new')} aria-label="Neue Übung">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="search-field">
        <MagnifyingGlass size={18} />
        <input type="search" placeholder="Übung suchen…" value={suche} onChange={(e) => setSuche(e.target.value)} />
      </div>

      <div className="filter-pills">
        <button className={`filter-pill ${kategorie === '' ? 'active' : ''}`} onClick={() => setKategorie('')}>
          Alle
        </button>
        {KATEGORIEN.map((k) => (
          <button key={k} className={`filter-pill ${kategorie === k ? 'active' : ''}`} onClick={() => setKategorie(kategorie === k ? '' : k)}>
            {KATEGORIE_LABEL[k]}
          </button>
        ))}
      </div>

      <div className="form-row">
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

      <p className="screen-header-meta">{gefiltert.length} Übungen</p>

      <div className="list">
        {gefiltert.map((ex) => {
          const frames = getPoseFrames(ex.figur_id);
          return (
            <button key={ex.id} className="list-row" onClick={() => setEditing(ex)}>
              <div className="list-row-figure">{frames ? <StickFigure frames={frames} active={false} /> : <div className="figure-placeholder">🏋</div>}</div>
              <div className="list-row-info">
                <strong>{ex.name}</strong>
                <span className="list-row-meta">
                  {KATEGORIE_LABEL[ex.kategorie]} · {BEWEGUNGSMUSTER_LABEL[ex.bewegungsmuster]}
                  {ex.einseitig ? ' · einseitig' : ''}
                </span>
                <span className="list-row-meta">
                  {ex.equipment.length ? ex.equipment.map((e) => EQUIPMENT_LABEL[e]).join(', ') : 'kein Equipment'} · {paramSummary(ex.parameter)}
                </span>
              </div>
              <CaretRight size={16} className="list-row-chevron" />
            </button>
          );
        })}
        {gefiltert.length === 0 && <p className="empty-hint">Keine Übungen gefunden.</p>}
      </div>
    </div>
  );
}
