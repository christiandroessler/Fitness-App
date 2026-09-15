import { describe, expect, it } from 'vitest';
import { berechneStreak, getIsoWeekKey, wochenFortschritt } from './streak';
import type { SessionLogEntry } from '../types';

function entry(daysAgo: number, status: SessionLogEntry['status'] = 'abgeschlossen'): SessionLogEntry {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `log-${daysAgo}-${status}`,
    datum: d.toISOString().slice(0, 10),
    uhrzeit: '10:00',
    einheitentyp: 'Test',
    set: { id: 'set', name: 'Test', uebungen: [], ersteller: 'ich', sichtbarkeit: 'privat', erstelltAm: '', geaendertAm: '' },
    absolvierteUebungen: [],
    status
  };
}

describe('getIsoWeekKey', () => {
  it('liefert für Montag und Sonntag derselben Woche denselben Schlüssel', () => {
    const montag = new Date(2026, 0, 12);
    const sonntag = new Date(2026, 0, 18);
    expect(getIsoWeekKey(montag)).toBe(getIsoWeekKey(sonntag));
  });

  it('liefert für die Folgewoche einen anderen Schlüssel', () => {
    const a = new Date(2026, 0, 12);
    const b = new Date(2026, 0, 19);
    expect(getIsoWeekKey(a)).not.toBe(getIsoWeekKey(b));
  });
});

describe('wochenFortschritt', () => {
  it('zählt nur abgeschlossene Einheiten der aktuellen Woche', () => {
    // Zwei Einträge von heute statt "vor 1/2 Tagen" — sonst wäre der Test nahe
    // einem Wochenwechsel (Sonntag/Montag) falsch-negativ.
    const history = [entry(0), { ...entry(0), id: 'log-0b' }, entry(0, 'abgebrochen'), entry(7)];
    expect(wochenFortschritt(history)).toBe(2);
  });

  it('ist 0 ohne Verlauf', () => {
    expect(wochenFortschritt([])).toBe(0);
  });
});

describe('berechneStreak', () => {
  it('zählt konsekutive Wochen mit mindestens einer Einheit, inkl. laufender Woche', () => {
    const history = [entry(0), entry(7), entry(14)];
    const { wochen, aktivDieseWoche } = berechneStreak(history);
    expect(aktivDieseWoche).toBe(true);
    expect(wochen).toBe(3);
  });

  it('bricht die Zählung bei einer ausgelassenen Woche ab, statt sie zu überspringen', () => {
    const history = [entry(0), entry(7), entry(21)]; // Woche -2 fehlt
    expect(berechneStreak(history).wochen).toBe(2);
  });

  it('bricht den Streak nicht sofort, solange die laufende Woche noch nicht vorbei ist', () => {
    const history = [entry(7), entry(14)]; // diese Woche noch keine Einheit
    const { wochen, aktivDieseWoche } = berechneStreak(history);
    expect(aktivDieseWoche).toBe(false);
    expect(wochen).toBe(2);
  });
});
