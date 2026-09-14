// Zufallsgenerator, Lastenheft 7.2.
import type { AuswahlRegel, Bewegungsmuster, Equipment, Exercise, KraftsatzParameter, Kategorie, Programmteil, SetExercise, Template, TrainingSet } from '../types';
import { exerciseDurationSeconds } from './duration';
import { newId } from './id';

const WARMUP_KATEGORIEN: Kategorie[] = ['erwaermung', 'aktivierung', 'mobilisation'];

function matchesRegel(ex: Exercise, regel: AuswahlRegel): boolean {
  const kOk = !regel.kategorien || regel.kategorien.includes(ex.kategorie);
  const bOk = !regel.bewegungsmuster || regel.bewegungsmuster.includes(ex.bewegungsmuster);
  return kOk && bOk;
}

function equipmentVerfuegbar(ex: Exercise, verfuegbar: ReadonlySet<Equipment>): boolean {
  return ex.equipment.every((e) => e === 'keins' || verfuegbar.has(e));
}

function statischeDauerSekunden(ex: Exercise): number {
  if (ex.uebungsart !== 'halten' || ex.parameter.art !== 'halten') return 0;
  return ex.parameter.dauer_s * ex.parameter.wiederholungen;
}

interface WahlOptionen {
  staticCapTracker?: Map<Bewegungsmuster, number>;
  bevorzugtesEquipment?: Equipment[];
}

/** Wählt zufällig aus Kandidaten, bevorzugt dabei nicht zuletzt verwendete Übungen und
 * hält im Aufwärmteil die 60-Sekunden-Grenze für statisches Dehnen pro Bewegungsmuster
 * ein (Anhang A.5/A.15) — beides nur "soweit genügend Alternativen vorhanden sind" (7.2). */
function waehleKandidat(kandidaten: Exercise[], vermeideIds: ReadonlySet<string>, opts: WahlOptionen = {}): Exercise | undefined {
  if (kandidaten.length === 0) return undefined;

  const passtInCap = (ex: Exercise) => {
    if (!opts.staticCapTracker || ex.uebungsart !== 'halten') return true;
    const bisher = opts.staticCapTracker.get(ex.bewegungsmuster) ?? 0;
    return bisher + statischeDauerSekunden(ex) <= 60;
  };

  const ersteWahl = kandidaten.filter((ex) => !vermeideIds.has(ex.id) && passtInCap(ex));
  const zweiteWahl = kandidaten.filter((ex) => passtInCap(ex));
  let pool = ersteWahl.length ? ersteWahl : zweiteWahl.length ? zweiteWahl : kandidaten;

  if (opts.bevorzugtesEquipment?.length) {
    const mitPraeferenz = pool.filter((ex) => ex.equipment.some((e) => opts.bevorzugtesEquipment!.includes(e)));
    if (mitPraeferenz.length) pool = mitPraeferenz;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function merkeStatischeDauer(tracker: Map<Bewegungsmuster, number>, ex: Exercise) {
  const dauer = statischeDauerSekunden(ex);
  if (dauer > 0) tracker.set(ex.bewegungsmuster, (tracker.get(ex.bewegungsmuster) ?? 0) + dauer);
}

function toSetExercise(ex: Exercise, parameterOverride?: Exercise['parameter'], fuellUebung?: SetExercise): SetExercise {
  return {
    exerciseId: ex.id,
    name: ex.name,
    kategorie: ex.kategorie,
    bewegungsmuster: ex.bewegungsmuster,
    uebungsart: (parameterOverride ?? ex.parameter).art,
    einseitig: ex.einseitig,
    wechselzeit_s: ex.wechselzeit_s,
    equipment: ex.equipment,
    parameter: parameterOverride ?? ex.parameter,
    darstellungsart: ex.darstellungsart,
    figur_id: ex.figur_id,
    video_datei: ex.video_datei,
    video_start_s: ex.video_start_s,
    video_ende_s: ex.video_ende_s,
    beschreibung: ex.beschreibung,
    fuellUebung
  };
}

/** Kraftteil: garantiert genau eine Übung des vorgegebenen Bewegungsmusters, als
 * Kraftsatz mit den Parametern der Vorlage (nicht den Bibliotheks-Defaults) — plus
 * optional eine beinfreie Füllübung für die Satzpausen (6.1). */
function baueKraftteil(
  teil: Programmteil,
  bibliothek: Exercise[],
  verfuegbar: ReadonlySet<Equipment>,
  vermeideIds: ReadonlySet<string>,
  usedThisRun: Set<string>
): SetExercise | undefined {
  const kandidaten = bibliothek.filter((ex) => matchesRegel(ex, teil.auswahlregel) && equipmentVerfuegbar(ex, verfuegbar) && !usedThisRun.has(ex.id));
  const gewaehlt = waehleKandidat(kandidaten, vermeideIds);
  if (!gewaehlt) return undefined;
  usedThisRun.add(gewaehlt.id);

  const basis = gewaehlt.parameter.art === 'kraftsatz' ? gewaehlt.parameter : undefined;
  const parameter: KraftsatzParameter = {
    art: 'kraftsatz',
    satzdauer_s: teil.satzdauer_s ?? basis?.satzdauer_s ?? 40,
    satzanzahl: teil.satzanzahl ?? basis?.satzanzahl ?? 3,
    erholung_pro_seite_s: teil.erholung_pro_seite_s ?? basis?.erholung_pro_seite_s ?? 120,
    wiederholungsvorgabe: basis?.wiederholungsvorgabe
  };

  let fuellUebung: SetExercise | undefined;
  if (teil.fuellUebungAuswahlregel) {
    const fuellKandidaten = bibliothek.filter(
      (ex) => matchesRegel(ex, teil.fuellUebungAuswahlregel!) && ex.beinfrei === true && equipmentVerfuegbar(ex, verfuegbar) && !usedThisRun.has(ex.id)
    );
    const fuellGewaehlt = waehleKandidat(fuellKandidaten, vermeideIds);
    if (fuellGewaehlt) {
      usedThisRun.add(fuellGewaehlt.id);
      fuellUebung = toSetExercise(fuellGewaehlt);
    }
  }

  return toSetExercise(gewaehlt, parameter, fuellUebung);
}

/** Alle anderen Programmteile: füllt den Zeitbudget-Teil mit einer oder mehreren
 * Übungen, deckt dabei jeden in der Regel genannten Wert (Bewegungsmuster oder
 * Kategorie) mindestens einmal ab, bevor frei aus dem Gesamtpool aufgefüllt wird. */
function fuelleTeil(
  teil: Programmteil,
  bibliothek: Exercise[],
  verfuegbar: ReadonlySet<Equipment>,
  vermeideIds: ReadonlySet<string>,
  usedThisRun: Set<string>,
  staticCapTracker: Map<Bewegungsmuster, number>,
  isWarmup: boolean
): SetExercise[] {
  const zielSekunden = teil.dauer_min * 60;
  const ergebnisse: SetExercise[] = [];
  let summe = 0;

  const capOpts: WahlOptionen = { staticCapTracker: isWarmup ? staticCapTracker : undefined, bevorzugtesEquipment: teil.bevorzugtesEquipment };

  const poolFuer = (einschraenkung?: { feld: 'bewegungsmuster' | 'kategorie'; wert: string }) =>
    bibliothek.filter((ex) => {
      if (!matchesRegel(ex, teil.auswahlregel)) return false;
      if (!equipmentVerfuegbar(ex, verfuegbar)) return false;
      if (usedThisRun.has(ex.id)) return false;
      if (einschraenkung?.feld === 'bewegungsmuster') return ex.bewegungsmuster === einschraenkung.wert;
      if (einschraenkung?.feld === 'kategorie') return ex.kategorie === einschraenkung.wert;
      return true;
    });

  const nimm = (kandidat: Exercise) => {
    ergebnisse.push(toSetExercise(kandidat));
    usedThisRun.add(kandidat.id);
    summe += exerciseDurationSeconds(kandidat);
    if (isWarmup) merkeStatischeDauer(staticCapTracker, kandidat);
  };

  const pflichtwerte: { feld: 'bewegungsmuster' | 'kategorie'; wert: string }[] = teil.auswahlregel.bewegungsmuster
    ? teil.auswahlregel.bewegungsmuster.map((wert) => ({ feld: 'bewegungsmuster' as const, wert }))
    : (teil.auswahlregel.kategorien ?? []).map((wert) => ({ feld: 'kategorie' as const, wert }));

  for (const pflicht of pflichtwerte) {
    if (summe >= zielSekunden) break;
    const kandidat = waehleKandidat(poolFuer(pflicht), vermeideIds, capOpts);
    if (kandidat) nimm(kandidat);
  }

  let sicherung = 0;
  while (summe < zielSekunden * 0.85 && sicherung < 25) {
    sicherung++;
    const kandidat = waehleKandidat(poolFuer(), vermeideIds, capOpts);
    if (!kandidat) break;
    nimm(kandidat);
  }

  return ergebnisse;
}

export interface GeneratorOptions {
  verfuegbaresEquipment: ReadonlySet<Equipment>;
  /** Übungs-IDs aus den letzten n Einheiten (5.5) plus zuletzt generierten Vorschlägen —
   * werden vermieden, solange genug Alternativen bestehen. */
  vermeideIds: ReadonlySet<string>;
  /** Optionale Programmteile (Abschluss, 6.1) auslassen. */
  nurPflichtteile?: boolean;
}

export interface GeneratorErgebnis {
  set: TrainingSet;
  warnungen: string[];
}

export function generateEinheit(template: Template, bibliothek: Exercise[], options: GeneratorOptions): GeneratorErgebnis {
  const teile = template.programmteile.filter((t) => !(options.nurPflichtteile && t.optional));
  const uebungen: SetExercise[] = [];
  const warnungen: string[] = [];
  const usedThisRun = new Set<string>();
  const staticCapTracker = new Map<Bewegungsmuster, number>();

  for (const teil of teile) {
    if (teil.istKraftteil) {
      const se = baueKraftteil(teil, bibliothek, options.verfuegbaresEquipment, options.vermeideIds, usedThisRun);
      if (se) {
        uebungen.push(se);
      } else {
        warnungen.push(`Für "${teil.name}" ist keine passende Übung mit verfügbarem Equipment vorhanden.`);
      }
      continue;
    }
    const isWarmup = (teil.auswahlregel.kategorien ?? []).some((k) => WARMUP_KATEGORIEN.includes(k));
    const gefuellt = fuelleTeil(teil, bibliothek, options.verfuegbaresEquipment, options.vermeideIds, usedThisRun, staticCapTracker, isWarmup);
    if (gefuellt.length === 0) {
      warnungen.push(`Für "${teil.name}" ist keine passende Übung mit verfügbarem Equipment vorhanden.`);
    }
    uebungen.push(...gefuellt);
  }

  const now = new Date().toISOString();
  const set: TrainingSet = {
    id: newId('set'),
    name: `${template.name} (generiert)`,
    uebungen,
    vorlageId: template.id,
    ersteller: 'ich',
    sichtbarkeit: 'privat',
    erstelltAm: now,
    geaendertAm: now
  };
  return { set, warnungen };
}

/** Übungs-IDs der letzten n Verlaufseinträge desselben Vorlagen-/Set-Namens, zur
 * Wiederholungsvermeidung im Generator (7.2, 5.5). */
export function letzteVerwendeteUebungsIds(historyUebungsIdListen: string[][], n: number): Set<string> {
  const relevante = historyUebungsIdListen.slice(0, Math.max(0, n));
  return new Set(relevante.flat());
}
