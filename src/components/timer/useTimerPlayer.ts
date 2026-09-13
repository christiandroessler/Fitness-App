import { useCallback, useEffect, useRef, useState } from 'react';
import type { TrainingSet } from '../../types';
import { buildeAblaufplan, type Phase } from '../../lib/ablaufplan';
import { playStartTon, playCountdownBeep, playEndTon } from '../../lib/sound';

export type PlayerStatus = 'laufend' | 'pausiert' | 'fertig' | 'abgebrochen';

interface InternalState {
  phaseIndex: number;
  remainingMs: number;
  status: PlayerStatus;
  lastBeepSecond: number | null;
}

export interface TimerPlayer {
  phasen: Phase[];
  phase: Phase | null;
  naechstePhase: Phase | null;
  phaseIndex: number;
  remainingMs: number;
  status: PlayerStatus;
  gesamtDauerS: number;
  vergangeneS: number;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  abort: () => void;
}

/** Zustandsmaschine der Timer-Wiedergabe (7.4). Nutzt eine Ref als "single source of
 * truth" statt verschachtelter setState-Aufrufe, damit Sekunden-genaue Countdown-Töne
 * ohne Render-Verzögerung ausgelöst werden können. */
export function useTimerPlayer(set: TrainingSet, onFinish: (erreichterUebungIndex: number, status: 'abgeschlossen' | 'abgebrochen') => void): TimerPlayer {
  const phasenRef = useRef<Phase[]>(buildeAblaufplan(set));
  const phasen = phasenRef.current;

  const stateRef = useRef<InternalState>({
    phaseIndex: 0,
    remainingMs: (phasen[0]?.dauer_s ?? 0) * 1000,
    status: 'laufend',
    lastBeepSecond: null
  });
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);
  const lastFrameRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  const finishSession = useCallback(
    (finalStatus: 'abgeschlossen' | 'abgebrochen') => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const erreichterUebungIndex = phasen[stateRef.current.phaseIndex]?.uebungIndex ?? set.uebungen.length;
      stateRef.current.status = finalStatus === 'abgeschlossen' ? 'fertig' : 'abgebrochen';
      if (finalStatus === 'abgeschlossen') playEndTon();
      rerender();
      onFinish(finalStatus === 'abgeschlossen' ? set.uebungen.length : erreichterUebungIndex, finalStatus);
    },
    [onFinish, phasen, rerender, set.uebungen.length]
  );

  const goToPhase = useCallback(
    (index: number) => {
      if (index >= phasen.length) {
        finishSession('abgeschlossen');
        return;
      }
      stateRef.current.phaseIndex = index;
      stateRef.current.remainingMs = phasen[index].dauer_s * 1000;
      stateRef.current.lastBeepSecond = null;
      if (stateRef.current.status === 'laufend') playStartTon();
      rerender();
    },
    [phasen, finishSession, rerender]
  );

  useEffect(() => {
    if (phasen.length === 0) {
      finishSession('abgeschlossen');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let raf: number;
    function tick(now: number) {
      if (stateRef.current.status === 'laufend' && !finishedRef.current) {
        const last = lastFrameRef.current ?? now;
        const delta = now - last;
        lastFrameRef.current = now;
        stateRef.current.remainingMs -= delta;
        const secondsLeft = Math.ceil(stateRef.current.remainingMs / 1000);
        if (secondsLeft <= 3 && secondsLeft >= 1 && stateRef.current.lastBeepSecond !== secondsLeft) {
          stateRef.current.lastBeepSecond = secondsLeft;
          playCountdownBeep();
        }
        if (stateRef.current.remainingMs <= 0) {
          goToPhase(stateRef.current.phaseIndex + 1);
        } else {
          rerender();
        }
      } else {
        lastFrameRef.current = now;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [goToPhase, rerender]);

  const pause = useCallback(() => {
    if (stateRef.current.status !== 'laufend') return;
    stateRef.current.status = 'pausiert';
    rerender();
  }, [rerender]);

  const resume = useCallback(() => {
    if (stateRef.current.status !== 'pausiert') return;
    stateRef.current.status = 'laufend';
    lastFrameRef.current = null;
    rerender();
  }, [rerender]);

  const skip = useCallback(() => {
    const currentUebungIndex = phasen[stateRef.current.phaseIndex]?.uebungIndex;
    let next = stateRef.current.phaseIndex + 1;
    while (next < phasen.length && phasen[next].uebungIndex === currentUebungIndex) next++;
    goToPhase(next);
  }, [phasen, goToPhase]);

  const abort = useCallback(() => finishSession('abgebrochen'), [finishSession]);

  const gesamtDauerS = phasen.reduce((sum, p) => sum + p.dauer_s, 0);
  const vergangeneS = phasen.slice(0, stateRef.current.phaseIndex).reduce((sum, p) => sum + p.dauer_s, 0) + Math.max(0, phasen[stateRef.current.phaseIndex]?.dauer_s ?? 0) - Math.max(0, stateRef.current.remainingMs / 1000);

  return {
    phasen,
    phase: phasen[stateRef.current.phaseIndex] ?? null,
    naechstePhase: phasen[stateRef.current.phaseIndex + 1] ?? null,
    phaseIndex: stateRef.current.phaseIndex,
    remainingMs: Math.max(0, stateRef.current.remainingMs),
    status: stateRef.current.status,
    gesamtDauerS,
    vergangeneS,
    pause,
    resume,
    skip,
    abort
  };
}
