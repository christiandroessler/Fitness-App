// Belohnungssystem: bezieht sich ausschließlich auf Konsistenz (absolvierte Einheiten
// pro Woche), nie auf Leistungsdaten — die erfasst die App laut Lastenheft 1.3
// bewusst nicht.
import type { SessionLogEntry } from '../types';

/** ISO-8601-Kalenderwoche als Schlüssel, z. B. "2026-W37" (Woche beginnt Montag). */
export function getIsoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Montag = 0 ... Sonntag = 6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // Donnerstag derselben Woche (ISO-Referenztag)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  const weekNum = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function abgeschlosseneWochen(history: SessionLogEntry[]): Set<string> {
  return new Set(history.filter((h) => h.status === 'abgeschlossen').map((h) => getIsoWeekKey(new Date(h.datum))));
}

/** Anzahl abgeschlossener Einheiten in der laufenden Kalenderwoche. */
export function wochenFortschritt(history: SessionLogEntry[]): number {
  const aktuelleWoche = getIsoWeekKey(new Date());
  return history.filter((h) => h.status === 'abgeschlossen' && getIsoWeekKey(new Date(h.datum)) === aktuelleWoche).length;
}

export interface StreakInfo {
  /** Anzahl konsekutiver Wochen mit mindestens einer abgeschlossenen Einheit. */
  wochen: number;
  /** Ob die laufende Woche bereits mitzählt. */
  aktivDieseWoche: boolean;
}

/** Streak in Wochen statt Tagen: bei 2–3 Einheiten/Woche ist ein Tages-Streak zu
 * strafend (ein freier Tag bricht ihn sofort), eine trainierte Woche ist das
 * sinnvollere Konsistenzmaß. Läuft eine Woche noch ohne Einheit, bleibt der Streak
 * bis Wochenende bestehen (kein sofortiger Reset). */
export function berechneStreak(history: SessionLogEntry[]): StreakInfo {
  const wochenMitEinheit = abgeschlosseneWochen(history);
  const jetzt = new Date();
  const aktuelleWoche = getIsoWeekKey(jetzt);
  const aktivDieseWoche = wochenMitEinheit.has(aktuelleWoche);

  const cursor = new Date(jetzt);
  if (!aktivDieseWoche) cursor.setUTCDate(cursor.getUTCDate() - 7);

  let wochen = 0;
  while (wochenMitEinheit.has(getIsoWeekKey(cursor))) {
    wochen++;
    cursor.setUTCDate(cursor.getUTCDate() - 7);
  }
  return { wochen, aktivDieseWoche };
}
