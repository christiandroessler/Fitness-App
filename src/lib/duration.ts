// Ablauf- und Dauerberechnung für alle Übungsarten (Lastenheft 7.4). Gemeinsam
// genutzt von Generator (Dauerbudget je Programmteil), manueller Zusammenstellung
// (laufende Gesamtdauer) und der Timer-Engine (tatsächliche Pausenlänge je Satz).
import type { ExerciseParameter, KraftsatzParameter } from '../types';

export interface KraftsatzAblauf {
  /** Tatsächliche Pause je Satz, aus der Ziel-Erholung pro Seite berechnet. */
  pausePerSet_s: number;
  /** Dauer eines vollständigen Satzes inklusive Wechselzeit und Pause danach. */
  perSetTotal_s: number;
  gesamt_s: number;
}

/** Beispiel (Lastenheft 9.1 Nr. 6): 40 s Satz, 10 s Wechsel, 120 s Ziel-Erholung/Seite
 * → Pause 70 s, ein Satz 2:40 min, drei Sätze 8:00 min. */
export function berechneKraftsatzAblauf(p: KraftsatzParameter, einseitig: boolean, wechselzeit_s: number): KraftsatzAblauf {
  const wechsel = einseitig ? wechselzeit_s : 0;
  const arbeitProSatz = einseitig ? p.satzdauer_s * 2 + wechsel : p.satzdauer_s;
  const pausePerSet_s = Math.max(0, p.erholung_pro_seite_s - p.satzdauer_s - wechsel);
  const perSetTotal_s = arbeitProSatz + pausePerSet_s;
  return { pausePerSet_s, perSetTotal_s, gesamt_s: perSetTotal_s * p.satzanzahl };
}

export interface DurationInput {
  uebungsart: ExerciseParameter['art'];
  parameter: ExerciseParameter;
  einseitig: boolean;
  wechselzeit_s: number;
}

/** Geschätzte Gesamtdauer einer Übung in Sekunden, inkl. beider Seiten bei einseitig. */
export function exerciseDurationSeconds(ex: DurationInput): number {
  const wechsel = ex.einseitig ? ex.wechselzeit_s : 0;
  switch (ex.parameter.art) {
    case 'halten': {
      const p = ex.parameter;
      const eineSeite = p.dauer_s * p.wiederholungen + p.pause_zwischen_wdh_s * Math.max(0, p.wiederholungen - 1);
      return ex.einseitig ? eineSeite * 2 + wechsel : eineSeite;
    }
    case 'intervall': {
      const p = ex.parameter;
      const eineSeite = (p.arbeit_s + p.pause_s) * p.anzahl;
      return ex.einseitig ? eineSeite * 2 + wechsel : eineSeite;
    }
    case 'isometrie_serie': {
      const p = ex.parameter;
      const eineSeite = (p.kontraktion_s + p.pause_s) * p.anzahl;
      return ex.einseitig ? eineSeite * 2 + wechsel : eineSeite;
    }
    case 'kraftsatz':
      return berechneKraftsatzAblauf(ex.parameter, ex.einseitig, ex.wechselzeit_s).gesamt_s;
  }
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')} min`;
}
