// Erzeugt docs/video-datenblaetter.md aus Übungsbibliothek, Vorlagen und Timer-Ablaufplan:
// npm run video-datenblaetter
import { STARTBIBLIOTHEK } from '../src/data/exercises';
import { STARTVORLAGEN } from '../src/data/templates';
import { buildeAblaufplan } from '../src/lib/ablaufplan';
import { SATZ_VIDEO, satzVideoDauer } from '../src/lib/videoSync';
import { KATEGORIE_LABEL, BEWEGUNGSMUSTER_LABEL, EQUIPMENT_LABEL } from '../src/types';
import type { Exercise, SetExercise } from '../src/types';

/** Übungen, die ein Kraftteil einer Vorlage wählen kann: Satzanzahl/-dauer bestimmt
 * dann die Vorlage, deshalb Satz-Video statt Video über die ganze Übung. */
function istSatzUebung(ex: Exercise): boolean {
  return STARTVORLAGEN.some((v) =>
    v.programmteile.some(
      (t) =>
        t.istKraftteil &&
        (!t.auswahlregel.kategorien || t.auswahlregel.kategorien.includes(ex.kategorie)) &&
        (!t.auswahlregel.bewegungsmuster || t.auswahlregel.bewegungsmuster.includes(ex.bewegungsmuster))
    )
  );
}

function parameterText(ex: Exercise): string {
  const p = ex.parameter;
  switch (p.art) {
    case 'intervall':
      return `Intervall: ${p.anzahl} × (${p.arbeit_s} s Arbeit + ${p.pause_s} s Pause)`;
    case 'halten':
      return p.wiederholungen > 1 ? `Halten: ${p.wiederholungen} × ${p.dauer_s} s, dazwischen ${p.pause_zwischen_wdh_s} s Pause` : `Halten: ${p.dauer_s} s`;
    case 'isometrie_serie':
      return `Isometrie-Serie: ${p.anzahl} × (${p.kontraktion_s} s Anspannen + ${p.pause_s} s Pause)`;
    case 'kraftsatz':
      return `Kraftsatz: ${p.satzanzahl} × ${p.satzdauer_s} s`;
  }
}

const ARTNAME = { arbeit: 'ARBEIT', pause: 'PAUSE', wechsel: 'WECHSEL' } as const;
const zeile = (von: number, bis: number, art: string, text: string) =>
  `  ${String(von).padStart(3)}–${String(bis).padStart(3)} s  ${art.padEnd(7)} ${String(bis - von).padStart(3)} s  ${text}`;

function kopf(ex: Exercise, typ: string): string[] {
  const vorhanden = ex.darstellungsart === 'video' ? ' — VIDEO VORHANDEN' : '';
  const z = [`## ${ex.id} · ${ex.name}${vorhanden}`, '', '```text', '=== ÜBUNGS-DATENBLATT ==='];
  z.push(`ID:              ${ex.id}`);
  z.push(`VIDEO-TYP:       ${typ}`);
  z.push(`Dateiname:       ${ex.id}.mp4`);
  z.push(`Übungsname:      ${ex.name}`);
  z.push(`Kopfzeile:       ${ex.name}  /  ${KATEGORIE_LABEL[ex.kategorie]}`);
  z.push(`Bewegungsmuster: ${BEWEGUNGSMUSTER_LABEL[ex.bewegungsmuster]}`);
  z.push(`Einseitig:       ${ex.einseitig ? 'ja (erst linke, dann rechte Seite)' : 'nein'}`);
  z.push(`Equipment:       ${ex.equipment.length ? ex.equipment.map((e) => EQUIPMENT_LABEL[e]).join(', ') : 'keins'}`);
  z.push(`Ausführung:      ${ex.beschreibung ?? '—'}`);
  z.push('Technik-Hinweise (Quelle für die Sprechtexte):');
  for (const h of ex.hinweise ?? []) z.push(`  - ${h}`);
  return z;
}

function uebungsBlock(ex: Exercise): string[] {
  const u: SetExercise = { ...ex, exerciseId: ex.id };
  const phasen = buildeAblaufplan({ id: 's', name: 's', uebungen: [u], ersteller: 'ich', sichtbarkeit: 'privat', erstelltAm: '', geaendertAm: '' });
  const gesamt = phasen.reduce((s, p) => s + p.dauer_s, 0);
  const z = kopf(ex, 'ÜBUNG (ein Video über die ganze Übung)');
  z.push(`Parameter:       ${parameterText(ex)}`);
  z.push(`GESAMTDAUER:     ${gesamt} s  (Video muss exakt ${gesamt},0 s lang sein)`);
  z.push('Zeitplan (muss exakt eingehalten werden):');
  let t = 0;
  for (const p of phasen) {
    const seite = p.seite === 'L' ? ' · linke Seite' : p.seite === 'R' ? ' · rechte Seite' : '';
    z.push(zeile(t, t + p.dauer_s, ARTNAME[p.art], `„${p.label}“${seite}`));
    t += p.dauer_s;
  }
  return [...z, '=== ENDE DATENBLATT ===', '```', ''];
}

function satzBlock(ex: Exercise): string[] {
  const { arbeit_s, wechsel_s, pause_s } = SATZ_VIDEO;
  const dauer = satzVideoDauer(ex.einseitig);
  const vorgabe = ex.parameter.art === 'kraftsatz' ? ex.parameter.wiederholungsvorgabe : undefined;
  const z = kopf(ex, 'SATZ (ein Video für EINEN Satz, die App startet es bei jedem Satz neu)');
  z.push(`Wiederholungen:  ${vorgabe ?? 'ca. 8–12 Wdh.'} ${ex.einseitig ? 'pro Seite und Satz' : 'pro Satz'}`);
  z.push(`GESAMTDAUER:     ${dauer} s  (Video muss exakt ${dauer},0 s lang sein)`);
  z.push('Zeitplan (muss exakt eingehalten werden):');
  if (ex.einseitig) {
    z.push(zeile(0, arbeit_s, 'ARBEIT', '„Satz · links“ · linke Seite'));
    z.push(zeile(arbeit_s, arbeit_s + wechsel_s, 'WECHSEL', '„Seitenwechsel“'));
    z.push(zeile(arbeit_s + wechsel_s, arbeit_s * 2 + wechsel_s, 'ARBEIT', '„Satz · rechts“ · rechte Seite'));
  } else {
    z.push(zeile(0, arbeit_s, 'ARBEIT', '„Satz“'));
  }
  z.push(zeile(dauer - pause_s, dauer, 'PAUSE', '„Satzpause“ — Pausen-Abschluss, letztes Bild bleibt in der Satzpause stehen'));
  return [...z, '=== ENDE DATENBLATT ===', '```', ''];
}

const satz = STARTBIBLIOTHEK.filter(istSatzUebung);
const uebung = STARTBIBLIOTHEK.filter((ex) => !istSatzUebung(ex));
const out: string[] = [
  '# Datenblätter für Übungsvideos',
  '',
  'Automatisch aus dem App-Code erzeugt (Übungsbibliothek, Vorlagen, Timer-Ablaufplan). Die Zeiten entsprechen exakt dem, was der Timer der App abspielt.',
  '',
  `- **Teil A — ${uebung.length} Übungen, VIDEO-TYP ÜBUNG:** feste Dauer, ein Video über die ganze Übung.`,
  `- **Teil B — ${satz.length} Kraftübungen, VIDEO-TYP SATZ:** Satzanzahl und Pausen legt die Vorlage je Einheit fest; das Video zeigt einen Satz und wird bei jedem Satz neu gestartet.`,
  '',
  'Je Video: den Master-Prompt aus `video-prompt.md` kopieren und **einen** der folgenden Blöcke an der markierten Stelle einfügen.',
  '',
  'Nach Änderungen an Übungen oder Vorlagen neu erzeugen: `npm run video-datenblaetter`',
  '',
  '# Teil A — VIDEO-TYP ÜBUNG',
  '',
  ...uebung.flatMap(uebungsBlock),
  '# Teil B — VIDEO-TYP SATZ',
  '',
  ...satz.flatMap(satzBlock)
];

console.log(out.join('\n'));
