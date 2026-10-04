import { STARTBIBLIOTHEK } from '../src/data/exercises';
import { buildeAblaufplan } from '../src/lib/ablaufplan';
import { KATEGORIE_LABEL, BEWEGUNGSMUSTER_LABEL, EQUIPMENT_LABEL } from '../src/types';
import type { Exercise, SetExercise } from '../src/types';

function alsSetExercise(ex: Exercise): SetExercise {
  return { ...ex, exerciseId: ex.id };
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
const fmt = (s: number) => s.toFixed(0).padStart(3, ' ');

const geeignet = STARTBIBLIOTHEK.filter((ex) => ex.kategorie !== 'kraft');
const out: string[] = [];
out.push('# Datenblätter für Übungsvideos');
out.push('');
out.push('Automatisch aus dem App-Code erzeugt (Übungsbibliothek + Timer-Ablaufplan). Die Zeiten entsprechen exakt dem, was der Timer der App abspielt.');
out.push('');
out.push(`Enthalten: ${geeignet.length} Übungen mit fester Dauer. Nicht enthalten: die ${STARTBIBLIOTHEK.length - geeignet.length} Kraftübungen (KNI, HUE, WAD, ISO) — deren Satzanzahl, Satzdauer und Pausen legt der Generator je Einheit fest, ein Video mit fester Länge würde dort nicht passen.`);
out.push('');
out.push('Je Video: den Master-Prompt aus `video-prompt.md` kopieren und **einen** der folgenden Blöcke unten anhängen.');
out.push('');
out.push('Nach Änderungen an Übungen neu erzeugen: `npm run video-datenblaetter`');
out.push('');

for (const ex of geeignet) {
  const phasen = buildeAblaufplan({ id: 's', name: 's', uebungen: [alsSetExercise(ex)], ersteller: 'ich', sichtbarkeit: 'privat', erstelltAm: '', geaendertAm: '' });
  const gesamt = phasen.reduce((s, p) => s + p.dauer_s, 0);
  const vorhanden = ex.darstellungsart === 'video' ? ' — VIDEO VORHANDEN' : '';
  out.push(`## ${ex.id} · ${ex.name}${vorhanden}`);
  out.push('');
  out.push('```text');
  out.push('=== ÜBUNGS-DATENBLATT ===');
  out.push(`ID:              ${ex.id}`);
  out.push(`Dateiname:       ${ex.id}.mp4`);
  out.push(`Übungsname:      ${ex.name}`);
  out.push(`Kopfzeile:       ${ex.name}  /  ${KATEGORIE_LABEL[ex.kategorie]}`);
  out.push(`Bewegungsmuster: ${BEWEGUNGSMUSTER_LABEL[ex.bewegungsmuster]}`);
  out.push(`Einseitig:       ${ex.einseitig ? 'ja (erst linke, dann rechte Seite)' : 'nein'}`);
  out.push(`Equipment:       ${ex.equipment.length ? ex.equipment.map((e) => EQUIPMENT_LABEL[e]).join(', ') : 'keins'}`);
  out.push(`Ausführung:      ${ex.beschreibung ?? '—'}`);
  out.push('Technik-Hinweise (Quelle für die Sprechtexte):');
  for (const h of ex.hinweise ?? []) out.push(`  - ${h}`);
  out.push(`Parameter:       ${parameterText(ex)}`);
  out.push(`GESAMTDAUER:     ${gesamt} s  (Video muss exakt ${gesamt},0 s lang sein)`);
  out.push('Zeitplan (muss exakt eingehalten werden):');
  let t = 0;
  for (const p of phasen) {
    const seite = p.seite === 'L' ? ' · linke Seite' : p.seite === 'R' ? ' · rechte Seite' : '';
    out.push(`  ${fmt(t)}–${fmt(t + p.dauer_s)} s  ${ARTNAME[p.art].padEnd(7)} ${String(p.dauer_s).padStart(3)} s  „${p.label}“${seite}`);
    t += p.dauer_s;
  }
  out.push('=== ENDE DATENBLATT ===');
  out.push('```');
  out.push('');
}

console.log(out.join('\n'));
