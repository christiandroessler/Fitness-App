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
});
