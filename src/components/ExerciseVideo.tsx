import { useEffect, useRef } from 'react';

interface ExerciseVideoProps {
  pfad: string;
  active: boolean;
}

/** Mitgeliefertes Übungsvideo (App-Asset) als Alternative zur Strichfigur — läuft in
 * einer Schleife und pausiert, wenn `active` false ist (z. B. während der Timer pausiert). */
export function ExerciseVideo({ pfad, active }: ExerciseVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active, pfad]);

  return (
    <video
      ref={ref}
      className="timer-video"
      src={`${import.meta.env.BASE_URL}${pfad}`}
      muted
      loop
      playsInline
      autoPlay
      aria-hidden="true"
    />
  );
}
