// Startbibliothek gemäß Anhang A zum Lastenheft (Stand 12.09.2026).
//
// Hinweis zur Anzahl: Der Anhang nennt im Titel und in der Zusammenfassung (A.16)
// "71 Übungen", die dort aufsummierten Kategoriezahlen (6+8+8+6+7+7+3+7+7+7+6+5+9)
// ergeben jedoch 86 — und genau 86 Übungen sind in den Abschnitten A.3–A.15 einzeln
// aufgeführt. Diese Bibliothek bildet die tatsächlich aufgeführten Übungen vollständig
// ab; die Kopfzahl "71" im Anhang ist ein Rechenfehler der Vorlage.
import type {
  Exercise,
  ExerciseParameter,
  Kategorie,
  Bewegungsmuster,
  Equipment,
  IntervallParameter,
  KraftsatzParameter,
  HaltenParameter,
  IsometrieSerieParameter
} from '../types';

const iv = (arbeit_s: number, pause_s: number, anzahl: number): IntervallParameter => ({
  art: 'intervall',
  arbeit_s,
  pause_s,
  anzahl
});

const ks = (satzdauer_s: number, satzanzahl: number, erholung_pro_seite_s: number, wiederholungsvorgabe?: string): KraftsatzParameter => ({
  art: 'kraftsatz',
  satzdauer_s,
  satzanzahl,
  erholung_pro_seite_s,
  wiederholungsvorgabe
});

const halten = (dauer_s: number, wiederholungen = 1, pause_zwischen_wdh_s = 5): HaltenParameter => ({
  art: 'halten',
  dauer_s,
  wiederholungen,
  pause_zwischen_wdh_s
});

const iso = (kontraktion_s: number, anzahl: number, pause_s: number): IsometrieSerieParameter => ({
  art: 'isometrie_serie',
  kontraktion_s,
  anzahl,
  pause_s
});

interface ExerciseInput {
  id: string;
  name: string;
  kategorie: Kategorie;
  bewegungsmuster: Bewegungsmuster;
  parameter: ExerciseParameter;
  einseitig: boolean;
  equipment: Equipment[];
  figur_id: string;
  beschreibung: string;
  stufe_leichter?: string;
  stufe_schwerer?: string;
  beinfrei?: boolean;
}

function ex(o: ExerciseInput): Exercise {
  return {
    id: o.id,
    name: o.name,
    kategorie: o.kategorie,
    bewegungsmuster: o.bewegungsmuster,
    uebungsart: o.parameter.art,
    einseitig: o.einseitig,
    wechselzeit_s: o.einseitig ? 10 : 0,
    equipment: o.equipment,
    parameter: o.parameter,
    darstellungsart: 'figur',
    figur_id: o.figur_id,
    beschreibung: o.beschreibung,
    stufe_leichter: o.stufe_leichter,
    stufe_schwerer: o.stufe_schwerer,
    beinfrei: o.beinfrei,
    ersteller: 'system',
    sichtbarkeit: 'global'
  };
}

export const STARTBIBLIOTHEK: Exercise[] = [
  // A.3 Erwärmung (Raise)
  ex({ id: 'ERW-01', name: 'Hampelmann', kategorie: 'erwaermung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-jumping-jack', beschreibung: 'Locker und rhythmisch, Arme und Beine gleichzeitig öffnen und schließen.' }),
  ex({ id: 'ERW-02', name: 'Laufen auf der Stelle', kategorie: 'erwaermung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-run-in-place', beschreibung: 'Lockeres Traben auf der Stelle, Arme leicht mitschwingen lassen.' }),
  ex({ id: 'ERW-03', name: 'Knieheben im Gehen', kategorie: 'erwaermung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-high-knee-march', beschreibung: 'Knie abwechselnd bis zur Hüfte anheben, aufrechte Haltung.' }),
  ex({ id: 'ERW-04', name: 'Fersenanfersen locker', kategorie: 'erwaermung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-heel-flick', beschreibung: 'Fersen locker Richtung Gesäß führen, kleine schnelle Schritte.' }),
  ex({ id: 'ERW-05', name: 'Armkreisen vorwärts/rückwärts', kategorie: 'erwaermung', bewegungsmuster: 'keins', parameter: iv(20, 10, 2), einseitig: false, equipment: [], figur_id: 'fig-arm-circle', beschreibung: 'Große, kontrollierte Kreise, erste 10 s vorwärts, dann rückwärts.' }),
  ex({ id: 'ERW-06', name: 'Seitliches Überkreuzlaufen', kategorie: 'erwaermung', bewegungsmuster: 'keins', parameter: iv(20, 10, 2), einseitig: false, equipment: [], figur_id: 'fig-carioca', beschreibung: 'Seitlich mit Überkreuzschritten bewegen, Hüfte bleibt locker.' }),

  // A.4 Aktivierung (Activate)
  ex({ id: 'AKT-01', name: 'Glute Bridge beidbeinig', kategorie: 'aktivierung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-glute-bridge', beschreibung: 'Becken anheben, am oberen Punkt Gesäß bewusst anspannen.', stufe_schwerer: 'AKT-02' }),
  ex({ id: 'AKT-02', name: 'Glute Bridge einbeinig', kategorie: 'aktivierung', bewegungsmuster: 'keins', parameter: iv(20, 10, 2), einseitig: true, equipment: [], figur_id: 'fig-glute-bridge-sl', beschreibung: 'Ein Bein angewinkelt aufgestellt, das andere gestreckt anheben.', stufe_leichter: 'AKT-01' }),
  ex({ id: 'AKT-03', name: 'Monster Walk seitlich mit Band', kategorie: 'aktivierung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: ['widerstandsband'], figur_id: 'fig-monster-walk', beschreibung: 'Band um die Knöchel, in leichter Kniebeuge seitlich gegen den Widerstand gehen.' }),
  ex({ id: 'AKT-04', name: 'Clamshell mit Band', kategorie: 'aktivierung', bewegungsmuster: 'keins', parameter: iv(20, 10, 2), einseitig: true, equipment: ['widerstandsband'], figur_id: 'fig-clamshell', beschreibung: 'Seitlage, Band über den Knien, oberes Knie gegen den Widerstand öffnen.' }),
  ex({ id: 'AKT-05', name: 'Standwaage ohne Last', kategorie: 'aktivierung', bewegungsmuster: 'keins', parameter: iv(20, 10, 2), einseitig: true, equipment: [], figur_id: 'fig-single-leg-stance', beschreibung: 'Oberkörper und Schwungbein zur Waage absenken, Becken bleibt gerade.', stufe_schwerer: 'HFT-02' }),
  ex({ id: 'AKT-06', name: 'Dead Bug langsam', kategorie: 'aktivierung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-dead-bug', beschreibung: 'Rücken flach auf den Boden pressen, Arm und Gegenbein langsam absenken.' }),
  ex({ id: 'AKT-07', name: 'Bandzug Schulterblatt (Rudern)', kategorie: 'aktivierung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: ['widerstandsband', 'tuerrahmen'], figur_id: 'fig-band-row', beschreibung: 'Band am Türrahmen befestigt, Schulterblätter zusammenziehen und ziehen.' }),
  ex({ id: 'AKT-08', name: 'Wadenwippen beidbeinig', kategorie: 'aktivierung', bewegungsmuster: 'keins', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-calf-bounce', beschreibung: 'Zügig auf die Zehenspitzen wippen, Boden nur leicht berühren.' }),

  // A.5 Mobilisation (Mobilise)
  ex({ id: 'MOB-01', name: '90/90 Hüftwechsel', kategorie: 'mobilisation', bewegungsmuster: 'mobility', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-9090-switch', beschreibung: 'Aus dem Sitz beide Knie kontrolliert von einer 90/90-Position zur anderen wechseln.' }),
  ex({ id: 'MOB-02', name: 'Adduktoren-Rockback', kategorie: 'mobilisation', bewegungsmuster: 'mobility', parameter: iv(30, 15, 2), einseitig: true, equipment: [], figur_id: 'fig-adductor-rockback', beschreibung: 'Breiter Stand im Vierfüßlerstand, Gewicht seitlich zum gestreckten Bein verlagern.' }),
  ex({ id: 'MOB-03', name: 'Beinpendel vorwärts/rückwärts', kategorie: 'mobilisation', bewegungsmuster: 'mobility', parameter: iv(20, 10, 2), einseitig: true, equipment: ['wand'], figur_id: 'fig-leg-swing-front', beschreibung: 'An der Wand abstützen, Bein locker und kontrolliert vor und zurück schwingen.' }),
  ex({ id: 'MOB-04', name: 'Beinpendel seitlich', kategorie: 'mobilisation', bewegungsmuster: 'mobility', parameter: iv(20, 10, 2), einseitig: true, equipment: ['wand'], figur_id: 'fig-leg-swing-side', beschreibung: 'An der Wand abstützen, Bein locker seitlich vor dem Standbein hin und her schwingen.' }),
  ex({ id: 'MOB-05', name: 'Katze-Kuh', kategorie: 'mobilisation', bewegungsmuster: 'mobility', parameter: iv(30, 15, 2), einseitig: false, equipment: [], figur_id: 'fig-cat-cow', beschreibung: 'Vierfüßlerstand, Wirbelsäule abwechselnd rund machen und durchhängen lassen.' }),
  ex({ id: 'MOB-06', name: 'Open Book (BWS-Rotation seitlich)', kategorie: 'mobilisation', bewegungsmuster: 'mobility', parameter: iv(30, 15, 2), einseitig: true, equipment: [], figur_id: 'fig-open-book', beschreibung: 'Seitlage, Knie angewinkelt, oberen Arm wie ein Buch aufklappen und Blick folgen lassen.' }),
  ex({ id: 'MOB-07', name: 'Thread the Needle', kategorie: 'mobilisation', bewegungsmuster: 'mobility', parameter: iv(20, 10, 2), einseitig: true, equipment: [], figur_id: 'fig-thread-needle', beschreibung: 'Vierfüßlerstand, einen Arm unter dem Körper hindurchfädeln, Schulter sinkt zum Boden.' }),
  ex({ id: 'MOB-08', name: 'Weltbester Dehner (Spiderman mit Rotation)', kategorie: 'mobilisation', bewegungsmuster: 'mobility', parameter: iv(30, 15, 2), einseitig: true, equipment: [], figur_id: 'fig-worlds-greatest', beschreibung: 'Tiefer Ausfallschritt, innere Hand am Boden, Rotation zur Decke öffnen.' }),

  // A.6 Potentiate (Sprünge)
  ex({ id: 'POT-01', name: 'Counter-Movement-Sprung', kategorie: 'potentiate', bewegungsmuster: 'sprung', parameter: iv(20, 20, 3), einseitig: false, equipment: [], figur_id: 'fig-cmj', beschreibung: 'Kurz in die Hocke, dann explosiv hochspringen und weich landen.' }),
  ex({ id: 'POT-02', name: 'Beidbeiniges Hüpfen am Ort', kategorie: 'potentiate', bewegungsmuster: 'sprung', parameter: iv(20, 20, 3), einseitig: false, equipment: [], figur_id: 'fig-pogo', beschreibung: 'Kleine, schnelle Sprünge mit steifen Knöcheln, kurzer Bodenkontakt.' }),
  ex({ id: 'POT-03', name: 'Seitliche Sprünge (Skater)', kategorie: 'potentiate', bewegungsmuster: 'sprung', parameter: iv(20, 20, 3), einseitig: false, equipment: [], figur_id: 'fig-skater-hop', beschreibung: 'Seitlich von Bein zu Bein springen, sicher auf dem Standbein abfangen.' }),
  ex({ id: 'POT-04', name: 'Einbeiniges Hüpfen', kategorie: 'potentiate', bewegungsmuster: 'sprung', parameter: iv(15, 20, 2), einseitig: true, equipment: [], figur_id: 'fig-hop-sl', beschreibung: 'Kleine Hüpfer auf einem Bein, Knie und Fußgelenk federn ab.' }),
  ex({ id: 'POT-05', name: 'Absprung von der Stufe mit Rücksprung', kategorie: 'potentiate', bewegungsmuster: 'sprung', parameter: iv(20, 20, 3), einseitig: false, equipment: ['treppenstufe'], figur_id: 'fig-drop-jump', beschreibung: 'Von der Stufe absteigen, bei der Landung sofort in einen Sprung nach oben abdrücken.' }),
  ex({ id: 'POT-06', name: 'Standweitsprung mit kontrollierter Landung', kategorie: 'potentiate', bewegungsmuster: 'sprung', parameter: iv(20, 20, 3), einseitig: false, equipment: [], figur_id: 'fig-broad-jump', beschreibung: 'Aus dem Stand so weit wie kontrolliert möglich springen und die Landung halten.' }),

  // A.7 Kraft, kniedominant — Rumpfwinkel bewusst konstant halten (Lastenheft A.7 Technikhinweis).
  ex({ id: 'KNI-01', name: 'Split Squat, beide Füße am Boden', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['kurzhantel_5kg_paar'], figur_id: 'fig-split-squat', beschreibung: 'Schrittstellung, Oberkörperwinkel konstant halten, vorderes Knie beugt und streckt.', stufe_schwerer: 'KNI-02' }),
  ex({ id: 'KNI-02', name: 'Bulgarian Split Squat, Körpergewicht', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['stuhl_bank'], figur_id: 'fig-bss', beschreibung: 'Hinterer Fuß erhöht auf der Bank, Rumpfwinkel während der ganzen Progression gleich halten.', stufe_leichter: 'KNI-01', stufe_schwerer: 'KNI-03' }),
  ex({ id: 'KNI-03', name: 'Bulgarian Split Squat mit Kurzhanteln', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['kurzhantel_5kg_paar', 'stuhl_bank'], figur_id: 'fig-bss-db', beschreibung: 'Wie Bulgarian Split Squat, zusätzlich Kurzhanteln in beiden Händen halten.', stufe_leichter: 'KNI-02', stufe_schwerer: 'KNI-04' }),
  ex({ id: 'KNI-04', name: 'Bulgarian Split Squat mit 15-kg-Hantel', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['kurzhantel_15kg', 'stuhl_bank'], figur_id: 'fig-bss-db', beschreibung: 'Wie Bulgarian Split Squat, die 15-kg-Hantel beidhändig vor der Brust oder seitlich halten.', stufe_leichter: 'KNI-03', stufe_schwerer: 'KNI-05' }),
  ex({ id: 'KNI-05', name: 'Bulgarian Split Squat mit Pause unten (3 s)', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(45, 3, 120, 'ca. 6–8 Wdh. inkl. 3 s Pause unten'), einseitig: true, equipment: ['kurzhantel_15kg', 'stuhl_bank'], figur_id: 'fig-bss-pause', beschreibung: 'Am tiefsten Punkt 3 Sekunden ohne Ablegen der Spannung halten, dann aufdrücken.', stufe_leichter: 'KNI-04' }),
  ex({ id: 'KNI-06', name: 'Step-up auf Stuhl, kontrolliertes Absenken', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['kurzhantel_15kg', 'stuhl_bank'], figur_id: 'fig-step-up', beschreibung: 'Auf den Stuhl steigen, das Absenken zurück besonders langsam ausführen.' }),
  ex({ id: 'KNI-07', name: 'Einbeinige Kniebeuge zum Stuhl', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['stuhl_bank'], figur_id: 'fig-pistol-to-box', beschreibung: 'Auf einem Bein kontrolliert zum Stuhl absetzen, Gegenbein bleibt vorn in der Luft.' }),

  // A.8 Kraft, hüftdominant
  ex({ id: 'HUE-01', name: 'Glute Bridge einbeinig, Fuß erhöht', kategorie: 'kraft', bewegungsmuster: 'hueftdominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['stuhl_bank'], figur_id: 'fig-hip-thrust-sl', beschreibung: 'Standfuß erhöht auf dem Stuhl, Becken einbeinig anheben und oben kurz anspannen.', stufe_schwerer: 'HUE-07' }),
  ex({ id: 'HUE-02', name: 'Rumänisches Kreuzheben einbeinig, Körpergewicht', kategorie: 'kraft', bewegungsmuster: 'hueftdominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: [], figur_id: 'fig-rdl-sl', beschreibung: 'Oberkörper und Schwungbein gemeinsam absenken, Rücken bleibt gerade, Hüfte als Scharnier.', stufe_schwerer: 'HUE-03' }),
  ex({ id: 'HUE-03', name: 'Rumänisches Kreuzheben einbeinig mit Kurzhantel', kategorie: 'kraft', bewegungsmuster: 'hueftdominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['kurzhantel_15kg'], figur_id: 'fig-rdl-sl-db', beschreibung: 'Wie einbeiniges Kreuzheben, Hantel in der dem Standbein gegenüberliegenden Hand.', stufe_leichter: 'HUE-02', stufe_schwerer: 'HUE-04' }),
  ex({ id: 'HUE-04', name: 'Rumänisches Kreuzheben einbeinig mit Langhantel', kategorie: 'kraft', bewegungsmuster: 'hueftdominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['langhantel_20kg'], figur_id: 'fig-rdl-sl-bb', beschreibung: 'Wie einbeiniges Kreuzheben, Langhantel dicht am Körper entlangführen.', stufe_leichter: 'HUE-03' }),
  ex({ id: 'HUE-05', name: 'Nordic Curl, assistiert mit Händen', kategorie: 'kraft', bewegungsmuster: 'hueftdominant', parameter: ks(40, 3, 120, 'wenige, sehr langsame Wdh.'), einseitig: false, equipment: ['sofa'], figur_id: 'fig-nordic-assisted', beschreibung: 'Füße unter dem Sofa fixiert, Oberkörper so langsam wie möglich absenken und mit den Händen abfangen.', stufe_schwerer: 'HUE-06' }),
  ex({ id: 'HUE-06', name: 'Nordic Curl, voller Bewegungsumfang', kategorie: 'kraft', bewegungsmuster: 'hueftdominant', parameter: ks(40, 3, 120, 'wenige, sehr langsame Wdh.'), einseitig: false, equipment: ['sofa'], figur_id: 'fig-nordic', beschreibung: 'Wie assistierter Nordic Curl, ohne Abstützen der Hände so lange wie möglich exzentrisch bremsen.', stufe_leichter: 'HUE-05' }),
  ex({ id: 'HUE-07', name: 'Beckenheben einbeinig mit Langhantel auf der Hüfte', kategorie: 'kraft', bewegungsmuster: 'hueftdominant', parameter: ks(40, 3, 120, 'ca. 8–12 Wdh.'), einseitig: true, equipment: ['langhantel_20kg', 'stuhl_bank'], figur_id: 'fig-hip-thrust-bb', beschreibung: 'Oberer Rücken auf der Bank, Langhantel mit einem Handtuch gepolstert auf der Hüfte.', stufe_leichter: 'HUE-01' }),

  // A.9 Kraft, Wade — dem Bewegungsmuster kniedominant zugeordnet, damit der Generator sie
  // auswählen kann (Anhang A.17, offener Punkt 3: ein eigenes Muster "Wade" wäre sauberer).
  ex({ id: 'WAD-01', name: 'Wadenheben einbeinig auf Stufe, Knie gestreckt', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 90, 'ca. 12–16 Wdh.'), einseitig: true, equipment: ['treppenstufe'], figur_id: 'fig-calf-raise-sl', beschreibung: 'Ferse tief unter die Stufenkante absenken, dann hoch auf den Ballen drücken.', stufe_schwerer: 'WAD-02' }),
  ex({ id: 'WAD-02', name: 'Wadenheben einbeinig auf Stufe mit Kurzhantel', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 90, 'ca. 12–16 Wdh.'), einseitig: true, equipment: ['kurzhantel_15kg', 'treppenstufe'], figur_id: 'fig-calf-raise-sl-db', beschreibung: 'Wie einbeiniges Wadenheben, zusätzlich die Hantel in der freien Hand halten.', stufe_leichter: 'WAD-01' }),
  ex({ id: 'WAD-03', name: 'Wadenheben sitzend mit Langhantel auf dem Knie (Soleus)', kategorie: 'kraft', bewegungsmuster: 'kniedominant', parameter: ks(40, 3, 90, 'ca. 12–16 Wdh.'), einseitig: true, equipment: ['langhantel_20kg', 'stuhl_bank'], figur_id: 'fig-calf-raise-seated', beschreibung: 'Sitzend, Hantel gepolstert auf dem Knie, bei gebeugtem Knie den Soleus gezielt ansprechen.' }),

  // A.10 Isometrie — kategorie kraft, Bewegungsmuster isometrisch (Vorlagenregel 6.1).
  ex({ id: 'ISO-01', name: 'Kniebeuge-Isometrie gegen Stange (Zug über Handtuch)', kategorie: 'kraft', bewegungsmuster: 'isometrisch', parameter: iso(3, 12, 15), einseitig: false, equipment: ['langhantel_20kg', 'handtuch'], figur_id: 'fig-iso-squat-pull', beschreibung: 'Handtuch unter den Füßen um die Stange führen, in der Kniebeuge so hart wie möglich nach oben ziehen.' }),
  ex({ id: 'ISO-02', name: 'Hüftstreck-Isometrie gegen Türrahmen', kategorie: 'kraft', bewegungsmuster: 'isometrisch', parameter: iso(3, 12, 15), einseitig: true, equipment: ['tuerrahmen'], figur_id: 'fig-iso-hip-ext', beschreibung: 'Ferse gegen den Türrahmen drücken, als würde das Bein nach hinten gestreckt.' }),
  ex({ id: 'ISO-03', name: 'Beinstreck-Isometrie gegen Wand, 90 Grad', kategorie: 'kraft', bewegungsmuster: 'isometrisch', parameter: iso(3, 12, 15), einseitig: true, equipment: ['wand'], figur_id: 'fig-iso-knee-ext', beschreibung: 'Im 90-Grad-Winkel sitzend gegen die Wand drücken, als würde das Knie gestreckt.' }),
  ex({ id: 'ISO-04', name: 'Wadendruck-Isometrie gegen Wand', kategorie: 'kraft', bewegungsmuster: 'isometrisch', parameter: iso(3, 12, 15), einseitig: true, equipment: ['wand'], figur_id: 'fig-iso-calf', beschreibung: 'Ballen gegen die Wand oder Stufenkante stemmen und so hart wie möglich drücken.' }),
  ex({ id: 'ISO-05', name: 'Wandsitz 90 Grad (yielding)', kategorie: 'kraft', bewegungsmuster: 'isometrisch', parameter: halten(45), einseitig: false, equipment: ['wand'], figur_id: 'fig-wall-sit', beschreibung: 'Rücken flach an der Wand, Oberschenkel waagerecht, Position ruhig halten.', stufe_schwerer: 'ISO-06' }),
  ex({ id: 'ISO-06', name: 'Wandsitz einbeinig (yielding)', kategorie: 'kraft', bewegungsmuster: 'isometrisch', parameter: halten(30), einseitig: true, equipment: ['wand'], figur_id: 'fig-wall-sit-sl', beschreibung: 'Aus dem Wandsitz ein Bein anheben und die Position auf dem Standbein halten.', stufe_leichter: 'ISO-05' }),
  ex({ id: 'ISO-07', name: 'Spanish Squat mit Band (yielding)', kategorie: 'kraft', bewegungsmuster: 'isometrisch', parameter: halten(45), einseitig: false, equipment: ['widerstandsband', 'tuerrahmen'], figur_id: 'fig-spanish-squat', beschreibung: 'Band um die Kniekehlen und den Türrahmen, im Sitz nach hinten gegen das Band lehnen.' }),

  // A.11 Rumpf, Sagittalebene — McGill Big Three als Kern.
  ex({ id: 'RSA-01', name: 'McGill Curl-up', kategorie: 'rumpf', bewegungsmuster: 'rumpf_sagittal', parameter: halten(10, 6, 8), einseitig: false, equipment: [], figur_id: 'fig-mcgill-curlup', beschreibung: 'Ein Bein gestreckt, Hände stützen den unteren Rücken, Kopf und Schultern leicht anheben, Rücken bleibt neutral.' , beinfrei: true }),
  ex({ id: 'RSA-02', name: 'Bird Dog', kategorie: 'rumpf', bewegungsmuster: 'rumpf_sagittal', parameter: halten(10, 6, 8), einseitig: true, equipment: [], figur_id: 'fig-bird-dog', beschreibung: 'Gegengleich Arm und Bein strecken, Becken bleibt ruhig und gerade.', stufe_schwerer: 'RSA-03' }),
  ex({ id: 'RSA-03', name: 'Bird Dog mit Quadraten (fortgeschritten)', kategorie: 'rumpf', bewegungsmuster: 'rumpf_sagittal', parameter: halten(10, 6, 8), einseitig: true, equipment: [], figur_id: 'fig-bird-dog-adv', beschreibung: 'Wie Bird Dog, zusätzlich mit dem gestreckten Arm kleine Quadrate in die Luft zeichnen.', stufe_leichter: 'RSA-02' }),
  ex({ id: 'RSA-04', name: 'Unterarmstütz', kategorie: 'rumpf', bewegungsmuster: 'rumpf_sagittal', parameter: halten(45), einseitig: false, equipment: [], figur_id: 'fig-plank', beschreibung: 'Gerade Linie von Kopf bis Ferse, Becken weder anheben noch durchhängen lassen.', stufe_schwerer: 'RSA-05' , beinfrei: true }),
  ex({ id: 'RSA-05', name: 'Unterarmstütz mit Beinheben', kategorie: 'rumpf', bewegungsmuster: 'rumpf_sagittal', parameter: halten(40), einseitig: true, equipment: [], figur_id: 'fig-plank-leg-lift', beschreibung: 'Aus dem Unterarmstütz ein Bein leicht anheben, Becken bleibt gerade.', stufe_leichter: 'RSA-04' }),
  ex({ id: 'RSA-06', name: 'Dead Bug mit gestrecktem Bein', kategorie: 'rumpf', bewegungsmuster: 'rumpf_sagittal', parameter: halten(40), einseitig: false, equipment: [], figur_id: 'fig-dead-bug-ext', beschreibung: 'Beide gestreckten Beine knapp über dem Boden halten, unterer Rücken bleibt am Boden.' , beinfrei: true }),
  ex({ id: 'RSA-07', name: 'Rückenstrecker-Halten am Boden (Superman)', kategorie: 'rumpf', bewegungsmuster: 'rumpf_sagittal', parameter: halten(30), einseitig: false, equipment: [], figur_id: 'fig-superman', beschreibung: 'Arme und Beine gleichzeitig leicht vom Boden abheben und die Spannung halten.' , beinfrei: true }),

  // A.12 Rumpf, Frontalebene
  ex({ id: 'RFR-01', name: 'Seitstütz auf Knien', kategorie: 'rumpf', bewegungsmuster: 'rumpf_frontal', parameter: halten(20), einseitig: true, equipment: [], figur_id: 'fig-side-plank-knee', beschreibung: 'Auf dem Unterarm und den angewinkelten Knien abstützen, Hüfte anheben und Linie halten.', stufe_schwerer: 'RFR-02' , beinfrei: true }),
  ex({ id: 'RFR-02', name: 'Seitstütz voll', kategorie: 'rumpf', bewegungsmuster: 'rumpf_frontal', parameter: halten(30), einseitig: true, equipment: [], figur_id: 'fig-side-plank', beschreibung: 'Gerade Linie von Kopf bis Fuß, Hüfte nicht absinken lassen.', stufe_leichter: 'RFR-01', stufe_schwerer: 'RFR-03' , beinfrei: true }),
  ex({ id: 'RFR-03', name: 'Seitstütz mit Beinheben', kategorie: 'rumpf', bewegungsmuster: 'rumpf_frontal', parameter: halten(25), einseitig: true, equipment: [], figur_id: 'fig-side-plank-abd', beschreibung: 'Aus dem vollen Seitstütz das obere Bein zusätzlich anheben.', stufe_leichter: 'RFR-02' , beinfrei: true }),
  ex({ id: 'RFR-04', name: 'Copenhagen-Plank kurzer Hebel (Knieauflage)', kategorie: 'rumpf', bewegungsmuster: 'rumpf_frontal', parameter: halten(20), einseitig: true, equipment: ['stuhl_bank'], figur_id: 'fig-copenhagen-short', beschreibung: 'Oberes Bein mit dem Knie auf der Bank abgelegt, Hüfte gerade anheben und halten.', stufe_schwerer: 'RFR-05' }),
  ex({ id: 'RFR-05', name: 'Copenhagen-Plank langer Hebel (Knöchelauflage)', kategorie: 'rumpf', bewegungsmuster: 'rumpf_frontal', parameter: halten(20), einseitig: true, equipment: ['stuhl_bank'], figur_id: 'fig-copenhagen-long', beschreibung: 'Wie kurzer Hebel, das obere Bein liegt gestreckt mit dem Knöchel auf der Bank.', stufe_leichter: 'RFR-04' }),
  ex({ id: 'RFR-06', name: 'Suitcase Carry am Ort (einseitige Last halten)', kategorie: 'rumpf', bewegungsmuster: 'rumpf_frontal', parameter: halten(30), einseitig: true, equipment: ['kurzhantel_15kg'], figur_id: 'fig-suitcase-hold', beschreibung: 'Hantel einseitig neben dem Körper halten, Rumpf gegen das seitliche Wegkippen stabilisieren.' }),
  ex({ id: 'RFR-07', name: 'Seitliches Beinheben liegend mit Band', kategorie: 'rumpf', bewegungsmuster: 'rumpf_frontal', parameter: halten(30), einseitig: true, equipment: ['widerstandsband'], figur_id: 'fig-side-leg-raise', beschreibung: 'Seitlage, Band um beide Knöchel, oberes Bein gegen den Widerstand angehoben halten.' }),

  // A.13 Nacken — dient auch als beinfreie Füllübung in Satzpausen (Lastenheft 6.1).
  ex({ id: 'NAC-01', name: 'Kinnnicken (tiefe Halsbeuger)', kategorie: 'nacken', bewegungsmuster: 'nacken', parameter: iso(10, 8, 5), einseitig: false, equipment: [], figur_id: 'fig-chin-tuck', beschreibung: 'Kinn einziehen, als würde ein Doppelkinn entstehen, Blick bleibt gerade nach vorn.' , beinfrei: true }),
  ex({ id: 'NAC-02', name: 'Isometrische Nackenbeugung gegen Hand', kategorie: 'nacken', bewegungsmuster: 'nacken', parameter: iso(10, 8, 5), einseitig: false, equipment: [], figur_id: 'fig-neck-iso-flex', beschreibung: 'Handfläche an die Stirn, Kopf gegen die Hand nach vorn drücken, Hand hält dagegen.' , beinfrei: true }),
  ex({ id: 'NAC-03', name: 'Isometrische Nackenstreckung gegen Hand', kategorie: 'nacken', bewegungsmuster: 'nacken', parameter: iso(10, 8, 5), einseitig: false, equipment: [], figur_id: 'fig-neck-iso-ext', beschreibung: 'Hand hinter den Kopf, Kopf gegen die Hand nach hinten drücken, Hand hält dagegen.' , beinfrei: true }),
  ex({ id: 'NAC-04', name: 'Isometrische Seitneigung gegen Hand', kategorie: 'nacken', bewegungsmuster: 'nacken', parameter: iso(10, 8, 5), einseitig: true, equipment: [], figur_id: 'fig-neck-iso-lat', beschreibung: 'Hand seitlich an den Kopf, Kopf gegen die Hand zur Seite drücken, Hand hält dagegen.' , beinfrei: true }),
  ex({ id: 'NAC-05', name: 'Kopfheben in Bauchlage (Aeroposition)', kategorie: 'nacken', bewegungsmuster: 'nacken', parameter: halten(20), einseitig: false, equipment: [], figur_id: 'fig-neck-prone-hold', beschreibung: 'Bauchlage, Kopf und oberen Rücken leicht anheben, Blick wie in der Aeroposition nach vorn.', stufe_schwerer: 'NAC-06' , beinfrei: true }),
  ex({ id: 'NAC-06', name: 'Nackenstreckung gegen Band', kategorie: 'nacken', bewegungsmuster: 'nacken', parameter: iso(10, 8, 5), einseitig: false, equipment: ['widerstandsband', 'tuerrahmen'], figur_id: 'fig-neck-band', beschreibung: 'Band um den Hinterkopf am Türrahmen befestigt, gegen den Zug nach vorn den Kopf strecken.', stufe_leichter: 'NAC-05' , beinfrei: true }),

  // A.14 Hüfte und Gesäß
  ex({ id: 'HFT-01', name: 'Seitliches Gehen mit Band (Crab Walk)', kategorie: 'huefte_gesaess', bewegungsmuster: 'keins', parameter: iv(30, 20, 3), einseitig: false, equipment: ['widerstandsband'], figur_id: 'fig-crab-walk', beschreibung: 'Band über den Knöcheln, in der Halbkniebeuge seitlich Schritt für Schritt gehen.' }),
  ex({ id: 'HFT-02', name: 'Standwaage mit Kurzhantel', kategorie: 'huefte_gesaess', bewegungsmuster: 'keins', parameter: halten(30), einseitig: true, equipment: ['kurzhantel_5kg_paar'], figur_id: 'fig-airplane-db', beschreibung: 'Hantel in der dem Standbein gegenüberliegenden Hand, Oberkörper zur Waage absenken.', stufe_leichter: 'AKT-05' }),
  ex({ id: 'HFT-03', name: 'Hüftabduktion im Stand gegen Band', kategorie: 'huefte_gesaess', bewegungsmuster: 'keins', parameter: iv(30, 20, 2), einseitig: true, equipment: ['widerstandsband', 'tuerrahmen'], figur_id: 'fig-hip-abd-band', beschreibung: 'Band am Türrahmen und Knöchel befestigt, Bein seitlich gegen den Widerstand anheben.' }),
  ex({ id: 'HFT-04', name: 'Gesäßbrücke mit Band über den Knien', kategorie: 'huefte_gesaess', bewegungsmuster: 'keins', parameter: halten(40), einseitig: false, equipment: ['widerstandsband'], figur_id: 'fig-bridge-band', beschreibung: 'Band über den Knien, Becken anheben und Knie zusätzlich leicht gegen das Band nach außen drücken.' }),
  ex({ id: 'HFT-05', name: 'Beckenabsenken im Stand auf Stufe', kategorie: 'huefte_gesaess', bewegungsmuster: 'keins', parameter: iv(30, 20, 2), einseitig: true, equipment: ['treppenstufe'], figur_id: 'fig-pelvic-drop', beschreibung: 'Auf der Stufe stehend das freie Becken kontrolliert absenken und wieder anheben.' }),

  // A.15 Beweglichkeit — optionaler Abschlussteil, im Aufwärmteil gilt die 60-s-Grenze (7.2).
  ex({ id: 'BEW-01', name: 'Hüftbeuger-Dehnung im Halbkniestand', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: true, equipment: [], figur_id: 'fig-kneeling-hipflexor', beschreibung: 'Becken leicht nach vorn kippen, Oberkörper aufrecht, hinteres Knie am Boden.' }),
  ex({ id: 'BEW-02', name: 'Couch Stretch (Schienbein an der Wand)', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: true, equipment: ['wand'], figur_id: 'fig-couch-stretch', beschreibung: 'Hinteres Schienbein an der Wand, Oberkörper aufrichten für eine tiefere Dehnung.' }),
  ex({ id: 'BEW-03', name: 'Taubensitz / Figur-4', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: true, equipment: [], figur_id: 'fig-pigeon', beschreibung: 'Vorderes Bein angewinkelt vor dem Körper, Oberkörper langsam über das Bein absenken.' }),
  ex({ id: 'BEW-04', name: 'Hamstring-Dehnung im Stand auf Stufe', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: true, equipment: ['treppenstufe'], figur_id: 'fig-hamstring-step', beschreibung: 'Ferse auf der Stufe, Bein gestreckt, Oberkörper mit geradem Rücken nach vorn neigen.' }),
  ex({ id: 'BEW-05', name: 'Adduktoren-Dehnung im Sitzen', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: false, equipment: [], figur_id: 'fig-adductor-seated', beschreibung: 'Fußsohlen zusammen, Knie mit den Ellbogen sanft Richtung Boden drücken.' }),
  ex({ id: 'BEW-06', name: 'BWS-Streckung über Stuhlkante', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: false, equipment: ['stuhl_bank'], figur_id: 'fig-tspine-ext-chair', beschreibung: 'Oberer Rücken über die Stuhlkante gelehnt, Brustkorb nach oben öffnen.' }),
  ex({ id: 'BEW-07', name: 'Brustdehnung im Türrahmen', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: true, equipment: ['tuerrahmen'], figur_id: 'fig-pec-doorway', beschreibung: 'Unterarm am Türrahmen, Oberkörper leicht nach vorn drehen, bis sich die Brust dehnt.' }),
  ex({ id: 'BEW-08', name: 'Wadendehnung an der Wand', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: true, equipment: ['wand'], figur_id: 'fig-calf-stretch', beschreibung: 'Hinteres Bein gestreckt, Ferse am Boden, Becken zur Wand schieben.' }),
  ex({ id: 'BEW-09', name: 'Kindhaltung mit seitlicher Verlagerung', kategorie: 'beweglichkeit', bewegungsmuster: 'mobility', parameter: halten(45), einseitig: true, equipment: [], figur_id: 'fig-childs-pose', beschreibung: 'Aus der Kindhaltung die Hände seitlich versetzen, um die Flanke mitzudehnen.' })
];

export function findExercise(id: string): Exercise | undefined {
  return STARTBIBLIOTHEK.find((e) => e.id === id);
}
