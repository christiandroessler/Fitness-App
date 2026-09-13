// Startvorlagen gemäß Lastenheft Abschnitt 6.
import type { Programmteil, Template } from '../types';

function teil(o: Partial<Programmteil> & Pick<Programmteil, 'id' | 'name' | 'dauer_min' | 'auswahlregel'>): Programmteil {
  return { ...o };
}

export const VORLAGE_KRAFT: Template = {
  id: 'vorlage-kraft',
  name: 'Kraft',
  programmteile: [
    // "Raise, Activate, Mobilise" (6.1) wird als drei einzelne 2-Minuten-Teile abgebildet,
    // damit tatsächlich je 2 Minuten aus jeder RAMP-Phase ausgewählt werden (statt frei
    // aus dem Gesamtpool der drei Kategorien).
    teil({ id: 'kraft-raise', name: 'Raise', dauer_min: 2, auswahlregel: { kategorien: ['erwaermung'] } }),
    teil({ id: 'kraft-activate', name: 'Activate', dauer_min: 2, auswahlregel: { kategorien: ['aktivierung'] } }),
    teil({ id: 'kraft-mobilise', name: 'Mobilise', dauer_min: 2, auswahlregel: { kategorien: ['mobilisation'] } }),
    teil({ id: 'kraft-potentiate', name: 'Potentiate', dauer_min: 2, auswahlregel: { bewegungsmuster: ['sprung'] } }),
    teil({
      id: 'kraft-knie',
      name: 'Hauptübung kniedominant',
      dauer_min: 8,
      auswahlregel: { kategorien: ['kraft'], bewegungsmuster: ['kniedominant'] },
      istKraftteil: true,
      satzanzahl: 3,
      satzdauer_s: 40,
      erholung_pro_seite_s: 120,
      fuellUebungAuswahlregel: { bewegungsmuster: ['nacken', 'rumpf_sagittal', 'rumpf_frontal'] }
    }),
    teil({
      id: 'kraft-huefte',
      name: 'Hauptübung hüftdominant',
      dauer_min: 8,
      auswahlregel: { kategorien: ['kraft'], bewegungsmuster: ['hueftdominant'] },
      istKraftteil: true,
      satzanzahl: 3,
      satzdauer_s: 40,
      erholung_pro_seite_s: 120,
      fuellUebungAuswahlregel: { bewegungsmuster: ['nacken', 'rumpf_sagittal', 'rumpf_frontal'] }
    }),
    teil({ id: 'kraft-isometrie', name: 'Isometrie-Serie', dauer_min: 4, auswahlregel: { kategorien: ['kraft'], bewegungsmuster: ['isometrisch'] } }),
    teil({ id: 'kraft-abschluss', name: 'Abschluss', dauer_min: 2, auswahlregel: { kategorien: ['beweglichkeit'] }, optional: true })
  ]
};

export const VORLAGE_STABILITAET: Template = {
  id: 'vorlage-stabilitaet',
  name: 'Stabilität & Mobility',
  programmteile: [
    teil({ id: 'stab-aufwaermen', name: 'Aufwärmen', dauer_min: 5, auswahlregel: { kategorien: ['erwaermung', 'aktivierung', 'mobilisation'] } }),
    teil({ id: 'stab-rumpf', name: 'Rumpf', dauer_min: 10, auswahlregel: { bewegungsmuster: ['rumpf_sagittal', 'rumpf_frontal'] } }),
    teil({
      id: 'stab-huefte',
      name: 'Hüfte/Gesäß',
      dauer_min: 5,
      auswahlregel: { kategorien: ['huefte_gesaess'] },
      bevorzugtesEquipment: ['widerstandsband']
    }),
    teil({ id: 'stab-nacken', name: 'Nacken', dauer_min: 4, auswahlregel: { bewegungsmuster: ['nacken'] } }),
    teil({ id: 'stab-beweglichkeit', name: 'Beweglichkeit', dauer_min: 6, auswahlregel: { kategorien: ['beweglichkeit'] } })
  ]
};

export const STARTVORLAGEN: Template[] = [VORLAGE_KRAFT, VORLAGE_STABILITAET];
