// Baut aus einem Set die flache Abfolge von Timer-Abschnitten (7.4): pro Übung
// Arbeit/Pause/Wechsel, für Kraftsätze mit der aus der Ziel-Erholung berechneten Pause.
import type { SetExercise, TrainingSet } from '../types';
import { berechneKraftsatzAblauf } from './duration';

export type PhasenArt = 'arbeit' | 'pause' | 'wechsel';

export interface Phase {
  uebungIndex: number;
  art: PhasenArt;
  seite?: 'L' | 'R';
  dauer_s: number;
  label: string;
  fuellUebung?: SetExercise;
}

function phasenFuerUebung(u: SetExercise, uebungIndex: number): Phase[] {
  const phasen: Phase[] = [];
  const push = (p: Omit<Phase, 'uebungIndex'>) => {
    if (p.dauer_s > 0) phasen.push({ ...p, uebungIndex });
  };
  const seiten: ('L' | 'R' | undefined)[] = u.einseitig ? ['L', 'R'] : [undefined];

  switch (u.parameter.art) {
    case 'halten': {
      const p = u.parameter;
      seiten.forEach((seite, si) => {
        for (let i = 0; i < p.wiederholungen; i++) {
          push({ art: 'arbeit', seite, dauer_s: p.dauer_s, label: p.wiederholungen > 1 ? `Wiederholung ${i + 1}/${p.wiederholungen}` : 'Halten' });
          if (i < p.wiederholungen - 1) push({ art: 'pause', seite, dauer_s: p.pause_zwischen_wdh_s, label: 'Kurze Pause' });
        }
        if (si === 0 && seiten.length === 2) push({ art: 'wechsel', dauer_s: u.wechselzeit_s, label: 'Seitenwechsel' });
      });
      break;
    }
    case 'intervall': {
      const p = u.parameter;
      seiten.forEach((seite, si) => {
        for (let i = 0; i < p.anzahl; i++) {
          push({ art: 'arbeit', seite, dauer_s: p.arbeit_s, label: `Intervall ${i + 1}/${p.anzahl}` });
          push({ art: 'pause', seite, dauer_s: p.pause_s, label: 'Pause' });
        }
        if (si === 0 && seiten.length === 2) push({ art: 'wechsel', dauer_s: u.wechselzeit_s, label: 'Seitenwechsel' });
      });
      break;
    }
    case 'isometrie_serie': {
      const p = u.parameter;
      seiten.forEach((seite, si) => {
        for (let i = 0; i < p.anzahl; i++) {
          push({ art: 'arbeit', seite, dauer_s: p.kontraktion_s, label: `Kontraktion ${i + 1}/${p.anzahl}` });
          push({ art: 'pause', seite, dauer_s: p.pause_s, label: 'Pause' });
        }
        if (si === 0 && seiten.length === 2) push({ art: 'wechsel', dauer_s: u.wechselzeit_s, label: 'Seitenwechsel' });
      });
      break;
    }
    case 'kraftsatz': {
      const p = u.parameter;
      const ablauf = berechneKraftsatzAblauf(p, u.einseitig, u.wechselzeit_s);
      for (let satz = 0; satz < p.satzanzahl; satz++) {
        if (u.einseitig) {
          push({ art: 'arbeit', seite: 'L', dauer_s: p.satzdauer_s, label: `Satz ${satz + 1}/${p.satzanzahl} · links` });
          push({ art: 'wechsel', dauer_s: u.wechselzeit_s, label: 'Seitenwechsel' });
          push({ art: 'arbeit', seite: 'R', dauer_s: p.satzdauer_s, label: `Satz ${satz + 1}/${p.satzanzahl} · rechts` });
        } else {
          push({ art: 'arbeit', dauer_s: p.satzdauer_s, label: `Satz ${satz + 1}/${p.satzanzahl}` });
        }
        push({ art: 'pause', dauer_s: ablauf.pausePerSet_s, label: 'Satzpause', fuellUebung: u.fuellUebung });
      }
      break;
    }
  }
  return phasen;
}

export function buildeAblaufplan(set: TrainingSet): Phase[] {
  return set.uebungen.flatMap((u, idx) => phasenFuerUebung(u, idx));
}
