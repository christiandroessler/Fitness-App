// Migrationen für Altdaten, die vor der Einführung eines Datenfelds gespeichert
// wurden (Google Drive/localStorage enthalten keine Schema-Version, siehe 3.7).
import type { AppData, Exercise, SetExercise } from '../types';
import { EXERCISE_HINWEISE } from '../data/exerciseHints';
import { STARTBIBLIOTHEK } from '../data/exercises';

const VIDEO_UEBUNGEN = new Map(STARTBIBLIOTHEK.filter((ex) => ex.darstellungsart === 'video').map((ex) => [ex.id, ex]));

// Darstellung und Videopfad mitgelieferter Videos sind in der App nicht editierbar und
// werden daher immer auf den aktuellen Stand gebracht (auch wenn die Videodatei ersetzt wurde).
function mitNachgetragenemVideo<T extends Pick<Exercise, 'darstellungsart' | 'figur_id' | 'videoPfad' | 'videoModus'> & { exerciseId?: string; id?: string }>(u: T): T {
  const ref = VIDEO_UEBUNGEN.get(u.exerciseId ?? u.id ?? '');
  if (!ref || (u.darstellungsart === ref.darstellungsart && u.videoPfad === ref.videoPfad && u.videoModus === ref.videoModus)) return u;
  return { ...u, darstellungsart: ref.darstellungsart, figur_id: ref.figur_id, videoPfad: ref.videoPfad, videoModus: ref.videoModus };
}

function mitNachgetragenenHinweisen(u: SetExercise): SetExercise {
  const hinweise = u.hinweise?.length ? u.hinweise : EXERCISE_HINWEISE[u.exerciseId];
  const fuellUebung = u.fuellUebung ? mitNachgetragenenHinweisen(u.fuellUebung) : u.fuellUebung;
  return mitNachgetragenemVideo({ ...u, hinweise, fuellUebung });
}

/** Trägt bei Altdaten (gespeichert, bevor es Ausführungshinweise bzw. das Armkreisen-
 * Video gab) Hinweise und Video für Standardübungen nach — eigene/bereits befüllte
 * Hinweise oder eine andere Darstellung bleiben unangetastet. */
export function backfillHinweise(data: AppData): AppData {
  return {
    ...data,
    exercises: data.exercises.map((ex) => mitNachgetragenemVideo(ex.hinweise?.length || !EXERCISE_HINWEISE[ex.id] ? ex : { ...ex, hinweise: EXERCISE_HINWEISE[ex.id] })),
    sets: data.sets.map((set) => ({ ...set, uebungen: set.uebungen.map(mitNachgetragenenHinweisen) })),
    // Verlaufseinträge lassen sich erneut starten und brauchen daher denselben Stand.
    history: data.history.map((h) => ({ ...h, set: { ...h.set, uebungen: h.set.uebungen.map(mitNachgetragenenHinweisen) } }))
  };
}
