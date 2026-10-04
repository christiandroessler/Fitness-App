import { describe, expect, it } from 'vitest';
import { backfillHinweise } from './migrations';
import { STARTBIBLIOTHEK } from '../data/exercises';
import { emptyAppData } from '../types';
import type { SetExercise } from '../types';

// Nimmt eine echte Standardübung mit hinterlegten Hinweisen als Vorlage, um die
// Migration realistisch zu prüfen statt mit frei erfundenen IDs.
const REFERENZ = STARTBIBLIOTHEK.find((ex) => (ex.hinweise?.length ?? 0) > 0)!;

function alsSetExercise(overrides: Partial<SetExercise> = {}): SetExercise {
  return {
    exerciseId: REFERENZ.id,
    name: REFERENZ.name,
    kategorie: REFERENZ.kategorie,
    bewegungsmuster: REFERENZ.bewegungsmuster,
    uebungsart: REFERENZ.uebungsart,
    einseitig: REFERENZ.einseitig,
    wechselzeit_s: REFERENZ.wechselzeit_s,
    equipment: REFERENZ.equipment,
    parameter: REFERENZ.parameter,
    darstellungsart: REFERENZ.darstellungsart,
    ...overrides
  };
}

describe('backfillHinweise', () => {
  it('trägt fehlende Hinweise für eine bekannte Standardübung in data.exercises nach', () => {
    const data = { ...emptyAppData(), exercises: [{ ...REFERENZ, hinweise: undefined }] };
    const result = backfillHinweise(data);
    expect(result.exercises[0].hinweise).toEqual(REFERENZ.hinweise);
  });

  it('überschreibt bereits vorhandene (z. B. eigene) Hinweise nicht', () => {
    const eigeneHinweise = ['Ganz eigener Hinweis'];
    const data = { ...emptyAppData(), exercises: [{ ...REFERENZ, hinweise: eigeneHinweise }] };
    const result = backfillHinweise(data);
    expect(result.exercises[0].hinweise).toEqual(eigeneHinweise);
  });

  it('lässt unbekannte (z. B. selbst angelegte) Übungen ohne Hinweise unangetastet', () => {
    const data = { ...emptyAppData(), exercises: [{ ...REFERENZ, id: 'eigene-uebung-123', hinweise: undefined }] };
    const result = backfillHinweise(data);
    expect(result.exercises[0].hinweise).toBeUndefined();
  });

  it('trägt Hinweise auch in bereits gespeicherten Sets nach, inkl. Füllübung', () => {
    const uebung = alsSetExercise({ hinweise: undefined, fuellUebung: alsSetExercise({ hinweise: undefined }) });
    const data = { ...emptyAppData(), sets: [{ id: 'set-1', name: 'Set', uebungen: [uebung], ersteller: 'ich' as const, sichtbarkeit: 'privat' as const, erstelltAm: '', geaendertAm: '' }] };
    const result = backfillHinweise(data);
    expect(result.sets[0].uebungen[0].hinweise).toEqual(REFERENZ.hinweise);
    expect(result.sets[0].uebungen[0].fuellUebung?.hinweise).toEqual(REFERENZ.hinweise);
  });

  it('trägt bei Altdaten die Video-Darstellung für das Armkreisen nach (statt der alten Figur)', () => {
    const armkreisen = STARTBIBLIOTHEK.find((ex) => ex.id === 'ERW-05')!;
    const data = { ...emptyAppData(), exercises: [{ ...armkreisen, darstellungsart: 'figur' as const, figur_id: 'fig-arm-circle', videoPfad: undefined }] };
    const result = backfillHinweise(data);
    expect(result.exercises[0].darstellungsart).toBe('video');
    expect(result.exercises[0].videoPfad).toBe(armkreisen.videoPfad);
  });

  it('lässt eine bereits auf Video migrierte Übung unangetastet', () => {
    const armkreisen = STARTBIBLIOTHEK.find((ex) => ex.id === 'ERW-05')!;
    const data = { ...emptyAppData(), exercises: [armkreisen] };
    const result = backfillHinweise(data);
    expect(result.exercises[0]).toEqual(armkreisen);
  });

  it('aktualisiert einen veralteten Videopfad auf die aktuelle Videodatei', () => {
    const armkreisen = STARTBIBLIOTHEK.find((ex) => ex.id === 'ERW-05')!;
    const data = { ...emptyAppData(), exercises: [{ ...armkreisen, videoPfad: 'videos/armkreisen-coach.mp4' }] };
    const result = backfillHinweise(data);
    expect(result.exercises[0].videoPfad).toBe(armkreisen.videoPfad);
  });

  it('migriert auch Sets in Verlaufseinträgen, da diese erneut gestartet werden können', () => {
    const armkreisen = STARTBIBLIOTHEK.find((ex) => ex.id === 'ERW-05')!;
    const uebung = alsSetExercise({ exerciseId: 'ERW-05', darstellungsart: 'video', videoPfad: 'videos/armkreisen-coach.mp4' });
    const set = { id: 'set-1', name: 'Set', uebungen: [uebung], ersteller: 'ich' as const, sichtbarkeit: 'privat' as const, erstelltAm: '', geaendertAm: '' };
    const data = {
      ...emptyAppData(),
      history: [{ id: 'log-1', datum: '2026-10-01', uhrzeit: '10:00', einheitentyp: 'Set', set, absolvierteUebungen: [], status: 'abgeschlossen' as const }]
    };
    const result = backfillHinweise(data);
    expect(result.history[0].set.uebungen[0].videoPfad).toBe(armkreisen.videoPfad);
  });

  it('trägt die Video-Darstellung auch in bereits gespeicherten Sets nach', () => {
    const uebung = alsSetExercise({ exerciseId: 'ERW-05', darstellungsart: 'figur', figur_id: 'fig-arm-circle', videoPfad: undefined });
    const data = { ...emptyAppData(), sets: [{ id: 'set-1', name: 'Set', uebungen: [uebung], ersteller: 'ich' as const, sichtbarkeit: 'privat' as const, erstelltAm: '', geaendertAm: '' }] };
    const result = backfillHinweise(data);
    const armkreisen = STARTBIBLIOTHEK.find((ex) => ex.id === 'ERW-05')!;
    expect(result.sets[0].uebungen[0].darstellungsart).toBe('video');
    expect(result.sets[0].uebungen[0].videoPfad).toBe(armkreisen.videoPfad);
  });
});
