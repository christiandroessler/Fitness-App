import type { Phase } from './ablaufplan';
import type { VideoModus } from '../types';

/** Aufbau eines Satz-Videos (siehe docs/video-prompt.md): Arbeit (links), bei einseitigen
 * Übungen Seitenwechsel + Arbeit rechts, danach ein kurzer Pausen-Abschluss. */
export const SATZ_VIDEO = { arbeit_s: 40, wechsel_s: 10, pause_s: 4 } as const;

export function satzVideoDauer(einseitig: boolean): number {
  const { arbeit_s, wechsel_s, pause_s } = SATZ_VIDEO;
  return (einseitig ? arbeit_s * 2 + wechsel_s : arbeit_s) + pause_s;
}

export interface VideoPosition {
  zeit_s: number;
  /** false = Bild steht (Abschnitt im Video ist kürzer als die Phase im Timer). */
  laeuft: boolean;
}

const STANDBILD_ABSTAND_S = 0.05;

export function videoPosition(phasen: Phase[], phaseIndex: number, verstrichen_s: number, modus: VideoModus, einseitig: boolean): VideoPosition {
  const phase = phasen[phaseIndex];
  if (!phase) return { zeit_s: 0, laeuft: false };

  if (modus === 'uebung') {
    const start = phasen.findIndex((p) => p.uebungIndex === phase.uebungIndex);
    const vorher = phasen.slice(start, phaseIndex).reduce((s, p) => s + p.dauer_s, 0);
    return { zeit_s: vorher + verstrichen_s, laeuft: true };
  }

  // Satz-Modus: jede Phase spielt "ihren" Abschnitt des Satz-Videos ab — unabhängig
  // davon, der wievielte Satz es ist und wie lang die Phase laut Vorlage dauert.
  const { arbeit_s, wechsel_s, pause_s } = SATZ_VIDEO;
  let start: number;
  let laenge: number;
  if (phase.art === 'pause') {
    start = einseitig ? arbeit_s * 2 + wechsel_s : arbeit_s;
    laenge = pause_s;
  } else if (phase.art === 'wechsel') {
    start = arbeit_s;
    laenge = wechsel_s;
  } else {
    start = phase.seite === 'R' ? arbeit_s + wechsel_s : 0;
    laenge = arbeit_s;
  }
  if (verstrichen_s < laenge - STANDBILD_ABSTAND_S) return { zeit_s: start + verstrichen_s, laeuft: true };
  return { zeit_s: start + laenge - STANDBILD_ABSTAND_S, laeuft: false };
}
