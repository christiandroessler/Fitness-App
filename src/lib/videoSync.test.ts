import { describe, expect, it } from 'vitest';
import { buildeAblaufplan } from './ablaufplan';
import { videoPosition, satzVideoDauer } from './videoSync';
import type { KraftsatzParameter, SetExercise } from '../types';

function kraftUebung(einseitig: boolean, satzdauer_s = 40): SetExercise {
  const parameter: KraftsatzParameter = { art: 'kraftsatz', satzdauer_s, satzanzahl: 3, erholung_pro_seite_s: 120 };
  return {
    exerciseId: 'KNI-01',
    name: 'Split Squat',
    kategorie: 'kraft',
    bewegungsmuster: 'kniedominant',
    uebungsart: 'kraftsatz',
    einseitig,
    wechselzeit_s: 10,
    equipment: [],
    parameter,
    darstellungsart: 'video',
    videoPfad: 'videos/KNI-01.mp4',
    videoModus: 'satz'
  };
}

function plan(u: SetExercise) {
  return buildeAblaufplan({ id: 's', name: 's', uebungen: [u], ersteller: 'ich', sichtbarkeit: 'privat', erstelltAm: '', geaendertAm: '' });
}

describe('videoPosition — Satz-Video', () => {
  it('ordnet bei einseitigen Übungen jede Phase ihrem Abschnitt im Satz-Video zu', () => {
    const phasen = plan(kraftUebung(true));
    // Satz 1: links 0, Wechsel 1, rechts 2, Pause 3
    expect(videoPosition(phasen, 0, 12, 'satz', true)).toEqual({ zeit_s: 12, laeuft: true });
    expect(videoPosition(phasen, 1, 3, 'satz', true)).toEqual({ zeit_s: 43, laeuft: true });
    expect(videoPosition(phasen, 2, 5, 'satz', true)).toEqual({ zeit_s: 55, laeuft: true });
    expect(videoPosition(phasen, 3, 1, 'satz', true)).toEqual({ zeit_s: 91, laeuft: true });
  });

  it('startet das Video bei jedem weiteren Satz wieder am Anfang', () => {
    const phasen = plan(kraftUebung(true));
    expect(phasen[4]).toMatchObject({ art: 'arbeit', seite: 'L' });
    expect(videoPosition(phasen, 4, 2, 'satz', true)).toEqual({ zeit_s: 2, laeuft: true });
  });

  it('hält in der langen Satzpause das letzte Bild des Pausen-Abschlusses', () => {
    const phasen = plan(kraftUebung(true));
    const pos = videoPosition(phasen, 3, 30, 'satz', true);
    expect(pos.laeuft).toBe(false);
    expect(pos.zeit_s).toBeCloseTo(satzVideoDauer(true) - 0.05);
  });

  it('hält bei längerer Satzdauer das Abschnittsende, statt in den nächsten Abschnitt zu laufen', () => {
    const phasen = plan(kraftUebung(true, 45));
    const pos = videoPosition(phasen, 0, 43, 'satz', true);
    expect(pos.laeuft).toBe(false);
    expect(pos.zeit_s).toBeCloseTo(39.95);
  });

  it('springt bei kürzerer Satzdauer direkt zum Seitenwechsel-Abschnitt', () => {
    const phasen = plan(kraftUebung(true, 30));
    expect(videoPosition(phasen, 1, 0, 'satz', true)).toEqual({ zeit_s: 40, laeuft: true });
  });

  it('nutzt bei beidseitigen Übungen Arbeit 0–40 s und Pausen-Abschluss ab 40 s', () => {
    const phasen = plan(kraftUebung(false));
    expect(phasen.slice(0, 2).map((p) => p.art)).toEqual(['arbeit', 'pause']);
    expect(videoPosition(phasen, 0, 20, 'satz', false)).toEqual({ zeit_s: 20, laeuft: true });
    expect(videoPosition(phasen, 1, 2, 'satz', false)).toEqual({ zeit_s: 42, laeuft: true });
    expect(satzVideoDauer(false)).toBe(44);
  });
});

describe('videoPosition — Übungs-Video', () => {
  it('läuft durchgehend über alle Phasen der Übung', () => {
    const phasen = plan(kraftUebung(true));
    expect(videoPosition(phasen, 2, 5, 'uebung', true)).toEqual({ zeit_s: 40 + 10 + 5, laeuft: true });
  });
});
