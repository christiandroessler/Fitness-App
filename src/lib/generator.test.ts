import { describe, expect, it } from 'vitest';
import { generateEinheit } from './generator';
import type { Exercise, Programmteil, Template } from '../types';
import { ALLE_EQUIPMENT } from '../types';

function exercise(overrides: Partial<Exercise> & Pick<Exercise, 'id' | 'kategorie' | 'parameter'>): Exercise {
  return {
    name: overrides.id,
    bewegungsmuster: 'keins',
    uebungsart: overrides.parameter.art,
    einseitig: false,
    wechselzeit_s: 10,
    equipment: [],
    darstellungsart: 'figur',
    ersteller: 'ich',
    sichtbarkeit: 'privat',
    ...overrides
  };
}

const ALLE = new Set(ALLE_EQUIPMENT);

describe('generateEinheit — Dauer-Band-Skalierung', () => {
  it('skaliert die Satzanzahl eines Kraftteils proportional zum Dauer-Band', () => {
    const kraftUebung = exercise({ id: 'kraft-1', kategorie: 'kraft', parameter: { art: 'kraftsatz', satzdauer_s: 40, satzanzahl: 3, erholung_pro_seite_s: 120 } });
    const teil: Programmteil = { id: 'teil-kraft', name: 'Kraft', dauer_min: 8, auswahlregel: { kategorien: ['kraft'] }, istKraftteil: true, satzanzahl: 3, satzdauer_s: 40, erholung_pro_seite_s: 120 };
    const template: Template = { id: 'tpl', name: 'Test', programmteile: [teil] };

    const mittel = generateEinheit(template, [kraftUebung], { verfuegbaresEquipment: ALLE, vermeideIds: new Set(), zielDauerBand: 'mittel' });
    const kurz = generateEinheit(template, [kraftUebung], { verfuegbaresEquipment: ALLE, vermeideIds: new Set(), zielDauerBand: 'kurz' });
    const lang = generateEinheit(template, [kraftUebung], { verfuegbaresEquipment: ALLE, vermeideIds: new Set(), zielDauerBand: 'lang' });

    expect(mittel.set.uebungen[0].parameter).toMatchObject({ satzanzahl: 3 });
    expect(kurz.set.uebungen[0].parameter).toMatchObject({ satzanzahl: 2 });
    expect(lang.set.uebungen[0].parameter).toMatchObject({ satzanzahl: 4 });
  });

  it('skaliert das Zeitbudget eines normalen Programmteils, sodass unterschiedlich viele Übungen gewählt werden', () => {
    const kandidaten = Array.from({ length: 5 }, (_, i) =>
      exercise({ id: `warmup-${i}`, kategorie: 'erwaermung', parameter: { art: 'halten', dauer_s: 150, wiederholungen: 1, pause_zwischen_wdh_s: 0 } })
    );
    const teil: Programmteil = { id: 'teil-warmup', name: 'Aufwärmen', dauer_min: 10, auswahlregel: { kategorien: ['erwaermung'] } };
    const template: Template = { id: 'tpl', name: 'Test', programmteile: [teil] };

    const mittel = generateEinheit(template, kandidaten, { verfuegbaresEquipment: ALLE, vermeideIds: new Set(), zielDauerBand: 'mittel' });
    const kurz = generateEinheit(template, kandidaten, { verfuegbaresEquipment: ALLE, vermeideIds: new Set(), zielDauerBand: 'kurz' });
    const lang = generateEinheit(template, kandidaten, { verfuegbaresEquipment: ALLE, vermeideIds: new Set(), zielDauerBand: 'lang' });

    expect(kurz.set.uebungen.length).toBe(3);
    expect(mittel.set.uebungen.length).toBe(4);
    expect(lang.set.uebungen.length).toBe(5);
  });

  it('meldet eine Warnung, wenn für einen Kraftteil kein Kandidat mit verfügbarem Equipment existiert', () => {
    const teil: Programmteil = { id: 'teil-kraft', name: 'Kraft', dauer_min: 8, auswahlregel: { kategorien: ['kraft'] }, istKraftteil: true, satzanzahl: 3, satzdauer_s: 40, erholung_pro_seite_s: 120 };
    const template: Template = { id: 'tpl', name: 'Test', programmteile: [teil] };
    const res = generateEinheit(template, [], { verfuegbaresEquipment: ALLE, vermeideIds: new Set() });
    expect(res.set.uebungen).toHaveLength(0);
    expect(res.warnungen).toHaveLength(1);
  });
});
