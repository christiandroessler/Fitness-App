import { useState } from 'react';
import type { Equipment, Exercise, ExerciseParameter, Uebungsart } from '../../types';
import { ALLE_EQUIPMENT, BEWEGUNGSMUSTER_LABEL, EQUIPMENT_LABEL, KATEGORIE_LABEL } from '../../types';
import { newId } from '../../lib/id';
import { StickFigure } from '../StickFigure';
import { POSES, getPoseFrames } from '../figures/poses';

const DEFAULT_PARAMS: Record<Uebungsart, ExerciseParameter> = {
  halten: { art: 'halten', dauer_s: 30, wiederholungen: 1, pause_zwischen_wdh_s: 5 },
  intervall: { art: 'intervall', arbeit_s: 30, pause_s: 15, anzahl: 2 },
  kraftsatz: { art: 'kraftsatz', satzdauer_s: 40, satzanzahl: 3, erholung_pro_seite_s: 120 },
  isometrie_serie: { art: 'isometrie_serie', kontraktion_s: 3, anzahl: 12, pause_s: 15 }
};

const FIGUR_IDS = Object.keys(POSES).sort();
const AUSWAEHLBARES_EQUIPMENT = ALLE_EQUIPMENT.filter((e) => e !== 'keins');

interface ExerciseFormProps {
  initial?: Exercise;
  onSave: (ex: Exercise) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ExerciseForm({ initial, onSave, onCancel, onDelete }: ExerciseFormProps) {
  const [ex, setEx] = useState<Exercise>(
    initial ?? {
      id: newId('ex'),
      name: '',
      kategorie: 'kraft',
      bewegungsmuster: 'keins',
      uebungsart: 'intervall',
      einseitig: false,
      wechselzeit_s: 10,
      equipment: [],
      parameter: DEFAULT_PARAMS.intervall,
      darstellungsart: 'figur',
      figur_id: undefined,
      beschreibung: '',
      beinfrei: false,
      ersteller: 'ich',
      sichtbarkeit: 'privat'
    }
  );

  function set<K extends keyof Exercise>(key: K, value: Exercise[K]) {
    setEx((e) => ({ ...e, [key]: value }));
  }

  function changeUebungsart(art: Uebungsart) {
    setEx((e) => ({ ...e, uebungsart: art, parameter: DEFAULT_PARAMS[art] }));
  }

  function toggleEquipment(eq: Equipment) {
    setEx((e) => ({ ...e, equipment: e.equipment.includes(eq) ? e.equipment.filter((x) => x !== eq) : [...e.equipment, eq] }));
  }

  const previewFrames = getPoseFrames(ex.figur_id);

  return (
    <div className="exercise-form">
      <label>
        Name
        <input value={ex.name} onChange={(e) => set('name', e.target.value)} placeholder="z. B. Split Squat" />
      </label>

      <div className="form-row">
        <label>
          Kategorie
          <select value={ex.kategorie} onChange={(e) => set('kategorie', e.target.value as Exercise['kategorie'])}>
            {Object.entries(KATEGORIE_LABEL).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Bewegungsmuster
          <select value={ex.bewegungsmuster} onChange={(e) => set('bewegungsmuster', e.target.value as Exercise['bewegungsmuster'])}>
            {Object.entries(BEWEGUNGSMUSTER_LABEL).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Übungsart
        <select value={ex.uebungsart} onChange={(e) => changeUebungsart(e.target.value as Uebungsart)}>
          <option value="halten">Halten</option>
          <option value="intervall">Intervall</option>
          <option value="kraftsatz">Kraftsatz</option>
          <option value="isometrie_serie">Isometrie-Serie</option>
        </select>
      </label>

      <div className="form-row">
        {ex.parameter.art === 'halten' && (
          <>
            <label>
              Dauer (s)
              <input type="number" min={1} value={ex.parameter.dauer_s} onChange={(e) => set('parameter', { ...ex.parameter, dauer_s: Number(e.target.value) } as ExerciseParameter)} />
            </label>
            <label>
              Wiederholungen
              <input
                type="number"
                min={1}
                value={ex.parameter.wiederholungen}
                onChange={(e) => set('parameter', { ...ex.parameter, wiederholungen: Number(e.target.value) } as ExerciseParameter)}
              />
            </label>
          </>
        )}
        {ex.parameter.art === 'intervall' && (
          <>
            <label>
              Arbeit (s)
              <input type="number" min={1} value={ex.parameter.arbeit_s} onChange={(e) => set('parameter', { ...ex.parameter, arbeit_s: Number(e.target.value) } as ExerciseParameter)} />
            </label>
            <label>
              Pause (s)
              <input type="number" min={0} value={ex.parameter.pause_s} onChange={(e) => set('parameter', { ...ex.parameter, pause_s: Number(e.target.value) } as ExerciseParameter)} />
            </label>
            <label>
              Anzahl
              <input type="number" min={1} value={ex.parameter.anzahl} onChange={(e) => set('parameter', { ...ex.parameter, anzahl: Number(e.target.value) } as ExerciseParameter)} />
            </label>
          </>
        )}
        {ex.parameter.art === 'kraftsatz' && (
          <>
            <label>
              Satzdauer (s)
              <input type="number" min={1} value={ex.parameter.satzdauer_s} onChange={(e) => set('parameter', { ...ex.parameter, satzdauer_s: Number(e.target.value) } as ExerciseParameter)} />
            </label>
            <label>
              Sätze
              <input type="number" min={1} value={ex.parameter.satzanzahl} onChange={(e) => set('parameter', { ...ex.parameter, satzanzahl: Number(e.target.value) } as ExerciseParameter)} />
            </label>
            <label>
              Ziel-Erholung/Seite (s)
              <input
                type="number"
                min={0}
                value={ex.parameter.erholung_pro_seite_s}
                onChange={(e) => set('parameter', { ...ex.parameter, erholung_pro_seite_s: Number(e.target.value) } as ExerciseParameter)}
              />
            </label>
          </>
        )}
        {ex.parameter.art === 'isometrie_serie' && (
          <>
            <label>
              Kontraktion (s)
              <input type="number" min={1} value={ex.parameter.kontraktion_s} onChange={(e) => set('parameter', { ...ex.parameter, kontraktion_s: Number(e.target.value) } as ExerciseParameter)} />
            </label>
            <label>
              Anzahl
              <input type="number" min={1} value={ex.parameter.anzahl} onChange={(e) => set('parameter', { ...ex.parameter, anzahl: Number(e.target.value) } as ExerciseParameter)} />
            </label>
            <label>
              Pause (s)
              <input type="number" min={0} value={ex.parameter.pause_s} onChange={(e) => set('parameter', { ...ex.parameter, pause_s: Number(e.target.value) } as ExerciseParameter)} />
            </label>
          </>
        )}
      </div>

      <button type="button" className="toggle-row" onClick={() => set('einseitig', !ex.einseitig)}>
        <span>Einseitig (je Seite ausgeführt)</span>
        <span className={`toggle-track ${ex.einseitig ? 'on' : ''}`}>
          <span className="toggle-thumb" />
        </span>
      </button>
      {ex.einseitig && (
        <label>
          Wechselzeit zwischen den Seiten (s)
          <input type="number" min={0} value={ex.wechselzeit_s} onChange={(e) => set('wechselzeit_s', Number(e.target.value))} />
        </label>
      )}

      <button type="button" className="toggle-row" onClick={() => set('beinfrei', !ex.beinfrei)}>
        <span>Beinfrei (eignet sich als Füllübung in Kraft-Satzpausen)</span>
        <span className={`toggle-track ${ex.beinfrei ? 'on' : ''}`}>
          <span className="toggle-thumb" />
        </span>
      </button>

      <div>
        <span className="meta-label">Equipment</span>
        <div className="chip-row" style={{ marginTop: 6 }}>
          {AUSWAEHLBARES_EQUIPMENT.map((eq) => (
            <button key={eq} type="button" className={`chip ${ex.equipment.includes(eq) ? 'active' : ''}`} onClick={() => toggleEquipment(eq)}>
              {EQUIPMENT_LABEL[eq]}
            </button>
          ))}
        </div>
      </div>

      <label>
        Darstellung
        <select value={ex.figur_id ?? ''} onChange={(e) => set('figur_id', e.target.value || undefined)}>
          <option value="">Keine Darstellung (nur Name/Text)</option>
          {FIGUR_IDS.map((fid) => (
            <option key={fid} value={fid}>
              {fid}
            </option>
          ))}
        </select>
      </label>
      {previewFrames && (
        <div className="figure-preview">
          <StickFigure frames={previewFrames} />
        </div>
      )}

      <label>
        Beschreibung
        <textarea value={ex.beschreibung ?? ''} onChange={(e) => set('beschreibung', e.target.value)} rows={3} placeholder="Kurzer Technikhinweis" />
      </label>

      <label>
        Ausführungshinweise (ein Stichpunkt pro Zeile)
        <textarea
          value={(ex.hinweise ?? []).join('\n')}
          onChange={(e) => set('hinweise', e.target.value.split('\n'))}
          rows={3}
          placeholder={'Worauf sollte man achten?\nz. B. Rumpfhaltung, Atmung, häufige Fehler'}
        />
      </label>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>
          Abbrechen
        </button>
        {onDelete && (
          <button className="btn-danger" onClick={onDelete}>
            Löschen
          </button>
        )}
        <button
          className="btn-primary"
          onClick={() => onSave({ ...ex, hinweise: (ex.hinweise ?? []).map((h) => h.trim()).filter(Boolean) })}
          disabled={!ex.name.trim()}
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
