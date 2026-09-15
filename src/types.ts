// Datenmodell gemäß Lastenheft Abschnitt 5.
// Enthält bereits in Ausbaustufe 1a alle Felder für Video und Phase-2-Freigabe,
// damit 1b und Phase 2 ohne Umbau ergänzt werden können (Lastenheft 2, "Wichtig für die Umsetzung").

export type Kategorie =
  | 'erwaermung'
  | 'aktivierung'
  | 'mobilisation'
  | 'potentiate'
  | 'kraft'
  | 'rumpf'
  | 'nacken'
  | 'huefte_gesaess'
  | 'beweglichkeit';

export const KATEGORIE_LABEL: Record<Kategorie, string> = {
  erwaermung: 'Erwärmung',
  aktivierung: 'Aktivierung',
  mobilisation: 'Mobilisation',
  potentiate: 'Potentiate',
  kraft: 'Kraft',
  rumpf: 'Rumpf',
  nacken: 'Nacken',
  huefte_gesaess: 'Hüfte/Gesäß',
  beweglichkeit: 'Beweglichkeit'
};

export type Bewegungsmuster =
  | 'kniedominant'
  | 'hueftdominant'
  | 'isometrisch'
  | 'sprung'
  | 'rumpf_sagittal'
  | 'rumpf_frontal'
  | 'nacken'
  | 'mobility'
  | 'keins';

export const BEWEGUNGSMUSTER_LABEL: Record<Bewegungsmuster, string> = {
  kniedominant: 'kniedominant',
  hueftdominant: 'hüftdominant',
  isometrisch: 'isometrisch',
  sprung: 'Sprung',
  rumpf_sagittal: 'Rumpf sagittal',
  rumpf_frontal: 'Rumpf frontal',
  nacken: 'Nacken',
  mobility: 'Mobility',
  keins: 'keins'
};

export type Uebungsart = 'halten' | 'intervall' | 'kraftsatz' | 'isometrie_serie';

export const UEBUNGSART_LABEL: Record<Uebungsart, string> = {
  halten: 'Halten',
  intervall: 'Intervall',
  kraftsatz: 'Kraftsatz',
  isometrie_serie: 'Isometrie-Serie'
};

// `sofa` ergänzt gegenüber der wörtlichen Liste in Lastenheft 5.2: der Fließtext dort
// nennt Sofa ausdrücklich als vorhandenen Alltagsgegenstand, die Aufzählung selbst
// vergisst ihn. Ohne diesen Wert wären HUE-05/HUE-06 (Nordic Curl, Fußfixierung am
// Sofa laut Anhang A.8) nicht abbildbar.
export type Equipment =
  | 'langhantel_20kg'
  | 'kurzhantel_5kg_paar'
  | 'kurzhantel_15kg'
  | 'widerstandsband'
  | 'wand'
  | 'tuerrahmen'
  | 'stuhl_bank'
  | 'treppenstufe'
  | 'sofa'
  | 'handtuch'
  | 'keins';

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  langhantel_20kg: 'Langhantel 20 kg',
  kurzhantel_5kg_paar: 'Kurzhantel 5 kg (Paar)',
  kurzhantel_15kg: 'Kurzhantel 15 kg',
  widerstandsband: 'Widerstandsband',
  wand: 'Wand',
  tuerrahmen: 'Türrahmen',
  stuhl_bank: 'Stuhl/Bank',
  treppenstufe: 'Treppenstufe',
  sofa: 'Sofa',
  handtuch: 'Handtuch',
  keins: 'kein Equipment'
};

export type Darstellungsart = 'figur' | 'video';

export type Sichtbarkeit = 'privat' | 'global';

/** Parameter je Übungsart, siehe Lastenheft 5.1. */
export interface HaltenParameter {
  art: 'halten';
  dauer_s: number;
  /** Für Formate wie "10 s × 6" (z. B. McGill Curl-up); Standard 1 = einfacher Hold. */
  wiederholungen: number;
  /** Pause zwischen den Wiederholungen, nur relevant wenn wiederholungen > 1. */
  pause_zwischen_wdh_s: number;
}

export interface IntervallParameter {
  art: 'intervall';
  arbeit_s: number;
  pause_s: number;
  anzahl: number;
}

export interface KraftsatzParameter {
  art: 'kraftsatz';
  satzdauer_s: number;
  satzanzahl: number;
  /** Ziel-Erholung pro Seite; die tatsächliche Pause wird daraus berechnet (7.4). */
  erholung_pro_seite_s: number;
  /** Nur Anzeigetext, keine Steuergröße (5.1). */
  wiederholungsvorgabe?: string;
}

export interface IsometrieSerieParameter {
  art: 'isometrie_serie';
  kontraktion_s: number;
  anzahl: number;
  pause_s: number;
}

export type ExerciseParameter =
  | HaltenParameter
  | IntervallParameter
  | KraftsatzParameter
  | IsometrieSerieParameter;

export interface DriveFileRef {
  fileId: string;
  name?: string;
}

/** Übung (`exercise`), Lastenheft 5.1. */
export interface Exercise {
  id: string;
  name: string;
  kategorie: Kategorie;
  bewegungsmuster: Bewegungsmuster;
  uebungsart: Uebungsart;
  einseitig: boolean;
  /** Nur bei einseitig relevant, Standard 10 s. */
  wechselzeit_s: number;
  equipment: Equipment[];
  parameter: ExerciseParameter;
  darstellungsart: Darstellungsart;
  figur_id?: string;
  video_datei?: DriveFileRef;
  video_start_s?: number;
  video_ende_s?: number;
  beschreibung?: string;
  /** Progressionskette, optional. */
  stufe_leichter?: string;
  stufe_schwerer?: string;
  /** Eignung als Füllübung in Kraft-Satzpausen: "ohne Beinbelastung" (Lastenheft 6.1, Anhang A.13). */
  beinfrei?: boolean;
  /** Für Phase 2 vorbereitet, in 1a informativ. */
  ersteller: string;
  sichtbarkeit: Sichtbarkeit;
}

export interface AuswahlRegel {
  kategorien?: Kategorie[];
  bewegungsmuster?: Bewegungsmuster[];
}

/** Programmteil einer Vorlage, Lastenheft 5.3. */
export interface Programmteil {
  id: string;
  name: string;
  dauer_min: number;
  auswahlregel: AuswahlRegel;
  /** Kraftteil: garantiert genau eine Übung je Bewegungsmuster in der Regel, als Kraftsatz. */
  istKraftteil?: boolean;
  satzanzahl?: number;
  satzdauer_s?: number;
  erholung_pro_seite_s?: number;
  /** Für Füllübungen in den Satzpausen von Kraftteilen. */
  fuellUebungAuswahlregel?: AuswahlRegel;
  /** Abschlussteil ist optional (Lastenheft 6.1/4.3: Cool-down dient nur der Beweglichkeit). */
  optional?: boolean;
  /** Weiche Präferenz innerhalb der Auswahlregel (z. B. "Hüfte/Gesäß, mit Band", 6.2);
   * schränkt die Auswahl nicht hart ein, sondern wird nur bevorzugt, wenn verfügbar. */
  bevorzugtesEquipment?: Equipment[];
}

/** Vorlage (`template`), Lastenheft 5.3. */
export interface Template {
  id: string;
  name: string;
  /** Kurzbeschreibung für die Generator-Übersicht, optional. */
  beschreibung?: string;
  programmteile: Programmteil[];
}

/** Konkrete Übung innerhalb eines Sets/einer generierten Einheit — Schnappschuss der
 * Anzeigedaten und Parameter, damit ein Set auch nach späteren Bibliotheksänderungen
 * unverändert abspielbar bleibt. */
export interface SetExercise {
  exerciseId: string;
  name: string;
  kategorie: Kategorie;
  bewegungsmuster: Bewegungsmuster;
  uebungsart: Uebungsart;
  einseitig: boolean;
  wechselzeit_s: number;
  equipment: Equipment[];
  parameter: ExerciseParameter;
  darstellungsart: Darstellungsart;
  figur_id?: string;
  video_datei?: DriveFileRef;
  video_start_s?: number;
  video_ende_s?: number;
  beschreibung?: string;
  /** Füllübung, die in den Satzpausen dieser (Kraft-)Übung eingespielt wird. */
  fuellUebung?: SetExercise;
}

/** Set (`set`), Lastenheft 5.4. */
export interface TrainingSet {
  id: string;
  name: string;
  uebungen: SetExercise[];
  vorlageId?: string;
  ersteller: string;
  sichtbarkeit: Sichtbarkeit;
  erstelltAm: string;
  geaendertAm: string;
}

export type SessionStatus = 'abgeschlossen' | 'abgebrochen';

/** Verlaufseintrag (`session_log`), Lastenheft 5.5. Keine Leistungswerte. */
export interface SessionLogEntry {
  id: string;
  datum: string;
  uhrzeit: string;
  einheitentyp: string;
  setId?: string;
  set: TrainingSet;
  absolvierteUebungen: { exerciseId: string; name: string }[];
  status: SessionStatus;
}

export interface AppSettings {
  letzteNGenerator: number;
  toeneStumm: boolean;
  /** Equipment, das aktuell tatsächlich zur Verfügung steht (7.2: nur damit ausführbare
   * Übungen werden generiert). Standard: alles verfügbar. */
  verfuegbaresEquipment: Equipment[];
}

export const ALLE_EQUIPMENT: Equipment[] = [
  'langhantel_20kg',
  'kurzhantel_5kg_paar',
  'kurzhantel_15kg',
  'widerstandsband',
  'wand',
  'tuerrahmen',
  'stuhl_bank',
  'treppenstufe',
  'sofa',
  'handtuch',
  'keins'
];

/** Gesamter Datenbestand, wie er als JSON in Google Drive liegt (Export/Import 3.7). */
export interface AppData {
  version: 1;
  exercises: Exercise[];
  templates: Template[];
  sets: TrainingSet[];
  history: SessionLogEntry[];
  settings: AppSettings;
}

export function emptyAppData(): AppData {
  return {
    version: 1,
    exercises: [],
    templates: [],
    sets: [],
    history: [],
    settings: { letzteNGenerator: 2, toeneStumm: false, verfuegbaresEquipment: [...ALLE_EQUIPMENT] }
  };
}
