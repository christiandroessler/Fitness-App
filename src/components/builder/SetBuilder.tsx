import { useState } from 'react';
import type { Exercise, SetExercise, TrainingSet } from '../../types';
import { exerciseDurationSeconds, formatDuration } from '../../lib/duration';
import { newId } from '../../lib/id';
import { ExercisePicker } from './ExercisePicker';
import { SetExerciseRow } from './SetExerciseRow';

interface SetBuilderProps {
  initialSet: TrainingSet;
  bibliothek: Exercise[];
  onSave: (set: TrainingSet) => void;
  onStart: (set: TrainingSet) => void;
  onCancel: () => void;
}

function toSetExercise(ex: Exercise): SetExercise {
  return {
    exerciseId: ex.id,
    name: ex.name,
    kategorie: ex.kategorie,
    bewegungsmuster: ex.bewegungsmuster,
    uebungsart: ex.uebungsart,
    einseitig: ex.einseitig,
    wechselzeit_s: ex.wechselzeit_s,
    equipment: ex.equipment,
    parameter: ex.parameter,
    darstellungsart: ex.darstellungsart,
    figur_id: ex.figur_id,
    video_datei: ex.video_datei,
    video_start_s: ex.video_start_s,
    video_ende_s: ex.video_ende_s,
    beschreibung: ex.beschreibung,
    hinweise: ex.hinweise
  };
}

export function SetBuilder({ initialSet, bibliothek, onSave, onStart, onCancel }: SetBuilderProps) {
  const [name, setName] = useState(initialSet.name);
  const [uebungen, setUebungen] = useState<SetExercise[]>(initialSet.uebungen);
  const [pickerOpen, setPickerOpen] = useState(false);

  const gesamtSekunden = uebungen.reduce((s, u) => s + exerciseDurationSeconds(u), 0);

  function updateAt(index: number, updated: SetExercise) {
    setUebungen((list) => list.map((u, i) => (i === index ? updated : u)));
  }
  function removeAt(index: number) {
    setUebungen((list) => list.filter((_, i) => i !== index));
  }
  function moveAt(index: number, delta: -1 | 1) {
    setUebungen((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function currentSet(): TrainingSet {
    return { ...initialSet, name: name.trim() || 'Einheit ohne Namen', uebungen, geaendertAm: new Date().toISOString() };
  }

  return (
    <div className="set-builder">
      <label className="set-name-field">
        Name der Einheit
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Kraft Dienstag" />
      </label>

      <div className="set-builder-summary">
        <span>{uebungen.length} Übungen</span>
        <span>Gesamtdauer: {formatDuration(gesamtSekunden)}</span>
      </div>

      <div className="set-builder-list">
        {uebungen.map((u, i) => (
          <SetExerciseRow
            key={`${u.exerciseId}-${i}`}
            uebung={u}
            index={i}
            count={uebungen.length}
            onChange={(updated) => updateAt(i, updated)}
            onRemove={() => removeAt(i)}
            onMove={(delta) => moveAt(i, delta)}
          />
        ))}
        {uebungen.length === 0 && <p className="empty-hint">Noch keine Übungen. Füge welche aus der Bibliothek hinzu.</p>}
      </div>

      <button className="btn-secondary" onClick={() => setPickerOpen(true)}>
        + Übung hinzufügen
      </button>

      <div className="set-builder-actions">
        <button className="btn-secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button className="btn-secondary" onClick={() => onSave(currentSet())} disabled={uebungen.length === 0}>
          Als Set speichern
        </button>
        <button className="btn-primary" onClick={() => onStart(currentSet())} disabled={uebungen.length === 0}>
          Starten
        </button>
      </div>

      {pickerOpen && (
        <ExercisePicker
          bibliothek={bibliothek}
          onClose={() => setPickerOpen(false)}
          onPick={(ex) => {
            setUebungen((list) => [...list, toSetExercise(ex)]);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

export function buildLeeresSet(name: string): TrainingSet {
  const now = new Date().toISOString();
  return { id: newId('set'), name, uebungen: [], ersteller: 'ich', sichtbarkeit: 'privat', erstelltAm: now, geaendertAm: now };
}
