import { describe, expect, it } from 'vitest';
import { buildeAblaufplan } from './ablaufplan';
import type { SetExercise, TrainingSet } from '../types';

function setExercise(overrides: Partial<SetExercise> & Pick<SetExercise, 'parameter'>): SetExercise {
  return {
    exerciseId: 'ex-test',
    name: 'Testübung',
    kategorie: 'kraft',
    bewegungsmuster: 'kniedominant',
    uebungsart: overrides.parameter.art,
    einseitig: false,
    wechselzeit_s: 10,
    equipment: [],
    darstellungsart: 'figur',
    ...overrides
  };
}

function set(uebungen: SetExercise[]): TrainingSet {
  return {
    id: 'set-test',
    name: 'Test-Set',
    uebungen,
    ersteller: 'ich',
    sichtbarkeit: 'privat',
    erstelltAm: '',
    geaendertAm: ''
  };
}

describe('buildeAblaufplan', () => {
  it('baut für ein Intervall Arbeit/Pause-Paare in der richtigen Anzahl', () => {
    const ex = setExercise({ parameter: { art: 'intervall', arbeit_s: 30, pause_s: 15, anzahl: 3 } });
    const phasen = buildeAblaufplan(set([ex]));
    expect(phasen.map((p) => p.art)).toEqual(['arbeit', 'pause', 'arbeit', 'pause', 'arbeit', 'pause']);
    expect(phasen.every((p) => p.uebungIndex === 0)).toBe(true);
  });

  it('baut für eine einseitige Kraftsatz-Übung Arbeit/Wechsel/Arbeit/Pause je Satz', () => {
    const ex = setExercise({
      einseitig: true,
      parameter: { art: 'kraftsatz', satzdauer_s: 40, satzanzahl: 2, erholung_pro_seite_s: 120 }
    });
    const phasen = buildeAblaufplan(set([ex]));
    expect(phasen.map((p) => p.art)).toEqual(['arbeit', 'wechsel', 'arbeit', 'pause', 'arbeit', 'wechsel', 'arbeit', 'pause']);
    expect(phasen.filter((p) => p.art === 'arbeit').map((p) => p.seite)).toEqual(['L', 'R', 'L', 'R']);
  });

  it('lässt Nullpausen weg (z. B. Halten ohne Pause zwischen den Wiederholungen)', () => {
    const ex = setExercise({ parameter: { art: 'halten', dauer_s: 20, wiederholungen: 2, pause_zwischen_wdh_s: 0 } });
    const phasen = buildeAblaufplan(set([ex]));
    expect(phasen.map((p) => p.art)).toEqual(['arbeit', 'arbeit']);
  });

  it('reiht mehrere Übungen anhand ihres uebungIndex aneinander', () => {
    const a = setExercise({ parameter: { art: 'halten', dauer_s: 10, wiederholungen: 1, pause_zwischen_wdh_s: 0 } });
    const b = setExercise({ parameter: { art: 'halten', dauer_s: 20, wiederholungen: 1, pause_zwischen_wdh_s: 0 } });
    const phasen = buildeAblaufplan(set([a, b]));
    expect(phasen.map((p) => p.uebungIndex)).toEqual([0, 1]);
  });
});
