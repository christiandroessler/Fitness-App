import type { SetExercise } from '../../types';
import { exerciseDurationSeconds, formatDuration } from '../../lib/duration';
import { StickFigure } from '../StickFigure';
import { getPoseFrames } from '../figures/poses';
import { ArrowUp, ArrowDown, Trash } from '@phosphor-icons/react';

interface SetExerciseRowProps {
  uebung: SetExercise;
  index: number;
  count: number;
  onChange: (u: SetExercise) => void;
  onRemove: () => void;
  onMove: (delta: -1 | 1) => void;
}

export function SetExerciseRow({ uebung, index, count, onChange, onRemove, onMove }: SetExerciseRowProps) {
  const frames = uebung.darstellungsart === 'figur' ? getPoseFrames(uebung.figur_id) : undefined;
  const dauer = exerciseDurationSeconds(uebung);

  function updateParam<T extends SetExercise['parameter']>(patch: Partial<T>) {
    onChange({ ...uebung, parameter: { ...uebung.parameter, ...patch } as SetExercise['parameter'] });
  }

  return (
    <div className="set-exercise-row">
      <div className="set-exercise-figure">{frames ? <StickFigure frames={frames} active={false} /> : <div className="figure-placeholder">🏋</div>}</div>
      <div className="set-exercise-main">
        <div className="set-exercise-title">
          <strong>{uebung.name}</strong>
          <span className="set-exercise-duration">{formatDuration(dauer)}</span>
        </div>
        <div className="set-exercise-params">
          {uebung.parameter.art === 'halten' && (
            <>
              <label>
                Dauer (s)
                <input type="number" min={1} value={uebung.parameter.dauer_s} onChange={(e) => updateParam({ dauer_s: Number(e.target.value) })} />
              </label>
              <label>
                Wiederholungen
                <input type="number" min={1} value={uebung.parameter.wiederholungen} onChange={(e) => updateParam({ wiederholungen: Number(e.target.value) })} />
              </label>
            </>
          )}
          {uebung.parameter.art === 'intervall' && (
            <>
              <label>
                Arbeit (s)
                <input type="number" min={1} value={uebung.parameter.arbeit_s} onChange={(e) => updateParam({ arbeit_s: Number(e.target.value) })} />
              </label>
              <label>
                Pause (s)
                <input type="number" min={0} value={uebung.parameter.pause_s} onChange={(e) => updateParam({ pause_s: Number(e.target.value) })} />
              </label>
              <label>
                Anzahl
                <input type="number" min={1} value={uebung.parameter.anzahl} onChange={(e) => updateParam({ anzahl: Number(e.target.value) })} />
              </label>
            </>
          )}
          {uebung.parameter.art === 'isometrie_serie' && (
            <>
              <label>
                Kontraktion (s)
                <input type="number" min={1} value={uebung.parameter.kontraktion_s} onChange={(e) => updateParam({ kontraktion_s: Number(e.target.value) })} />
              </label>
              <label>
                Anzahl
                <input type="number" min={1} value={uebung.parameter.anzahl} onChange={(e) => updateParam({ anzahl: Number(e.target.value) })} />
              </label>
              <label>
                Pause (s)
                <input type="number" min={0} value={uebung.parameter.pause_s} onChange={(e) => updateParam({ pause_s: Number(e.target.value) })} />
              </label>
            </>
          )}
          {uebung.parameter.art === 'kraftsatz' && (
            <>
              <label>
                Satzdauer (s)
                <input type="number" min={1} value={uebung.parameter.satzdauer_s} onChange={(e) => updateParam({ satzdauer_s: Number(e.target.value) })} />
              </label>
              <label>
                Sätze
                <input type="number" min={1} value={uebung.parameter.satzanzahl} onChange={(e) => updateParam({ satzanzahl: Number(e.target.value) })} />
              </label>
              <label>
                Ziel-Erholung/Seite (s)
                <input type="number" min={0} value={uebung.parameter.erholung_pro_seite_s} onChange={(e) => updateParam({ erholung_pro_seite_s: Number(e.target.value) })} />
              </label>
            </>
          )}
          {uebung.einseitig && (
            <label>
              Wechselzeit (s)
              <input type="number" min={0} value={uebung.wechselzeit_s} onChange={(e) => onChange({ ...uebung, wechselzeit_s: Number(e.target.value) })} />
            </label>
          )}
        </div>
      </div>
      <div className="set-exercise-actions">
        <button className="btn-icon" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Nach oben">
          <ArrowUp size={15} />
        </button>
        <button className="btn-icon" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Nach unten">
          <ArrowDown size={15} />
        </button>
        <button className="btn-icon btn-icon-danger" onClick={onRemove} aria-label="Entfernen">
          <Trash size={15} />
        </button>
      </div>
    </div>
  );
}
