// Migrationen für Altdaten, die vor der Einführung eines Datenfelds gespeichert
// wurden (Google Drive/localStorage enthalten keine Schema-Version, siehe 3.7).
import type { AppData, SetExercise } from '../types';
import { EXERCISE_HINWEISE } from '../data/exerciseHints';

function mitNachgetragenenHinweisen(u: SetExercise): SetExercise {
  const hinweise = u.hinweise?.length ? u.hinweise : EXERCISE_HINWEISE[u.exerciseId];
  const fuellUebung = u.fuellUebung ? mitNachgetragenenHinweisen(u.fuellUebung) : u.fuellUebung;
  if (hinweise === u.hinweise && fuellUebung === u.fuellUebung) return u;
  return { ...u, hinweise: hinweise ?? u.hinweise, fuellUebung };
}

/** Trägt bei Altdaten (gespeichert, bevor es Ausführungshinweise gab) die Hinweise
 * für Standardübungen nach — eigene/bereits befüllte Hinweise bleiben unangetastet. */
export function backfillHinweise(data: AppData): AppData {
  return {
    ...data,
    exercises: data.exercises.map((ex) => (ex.hinweise?.length || !EXERCISE_HINWEISE[ex.id] ? ex : { ...ex, hinweise: EXERCISE_HINWEISE[ex.id] })),
    sets: data.sets.map((set) => ({ ...set, uebungen: set.uebungen.map(mitNachgetragenenHinweisen) }))
  };
}
