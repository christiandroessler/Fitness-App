import { useEffect, useRef, useState } from 'react';
import { SpeakerHigh } from '@phosphor-icons/react';
import { getSharedVideo, videoUrl } from '../lib/exerciseVideo';

interface ExerciseVideoProps {
  pfad: string;
  /** Läuft der Timer gerade (nicht pausiert)? */
  active: boolean;
  /** Verstrichene Zeit innerhalb der Übung — das Video ist auf die Übungsdauer geschnitten. */
  zeit_s: number;
  muted: boolean;
}

const MAX_ABWEICHUNG_S = 0.5;

/** Mitgeliefertes Übungsvideo mit eigenem Ton, synchron zum Timer der Übung. */
export function ExerciseVideo({ pfad, active, zeit_s, muted }: ExerciseVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blockiert, setBlockiert] = useState(false);
  const keineVersucheMehrRef = useRef(false);

  useEffect(() => {
    const v = getSharedVideo();
    containerRef.current?.appendChild(v);
    return () => {
      v.pause();
      v.remove();
    };
  }, []);

  useEffect(() => {
    const v = getSharedVideo();
    const url = videoUrl(pfad);
    if (v.getAttribute('src') !== url) v.src = url;
    v.muted = muted || blockiert;

    if (v.readyState >= 1 && !v.seeking && zeit_s < v.duration && Math.abs(v.currentTime - zeit_s) > MAX_ABWEICHUNG_S) {
      v.currentTime = zeit_s;
    }

    if (active && v.paused && !v.ended && !keineVersucheMehrRef.current) {
      v.play().catch(() => {
        if (v.muted) {
          // Selbst stumm verweigert (z. B. iOS-Stromsparmodus): nur noch per Button.
          keineVersucheMehrRef.current = true;
          setBlockiert(true);
          return;
        }
        // iOS hat die Wiedergabe mit Ton verweigert: stumm weiterlaufen lassen und
        // per Button eine Nutzergeste zum Freischalten anbieten.
        setBlockiert(true);
        v.muted = true;
        void v.play().catch(() => {
          keineVersucheMehrRef.current = true;
        });
      });
    } else if (!active && !v.paused) {
      v.pause();
    }
  });

  function freischalten() {
    const v = getSharedVideo();
    v.muted = muted;
    keineVersucheMehrRef.current = false;
    setBlockiert(false);
    if (active) void v.play().catch(() => undefined);
  }

  return (
    <div className="timer-video-wrap" ref={containerRef}>
      {blockiert && (
        <button className="timer-video-unlock" onClick={freischalten}>
          <SpeakerHigh size={18} /> Ton aktivieren
        </button>
      )}
    </div>
  );
}
