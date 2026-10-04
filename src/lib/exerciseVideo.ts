// Ein einziges, wiederverwendetes <video>-Element für alle Video-Übungen einer Einheit:
// iOS Safari erlaubt Wiedergabe mit Ton nur für Medien-Elemente, die einmal innerhalb
// einer Nutzergeste gestartet wurden — ein erst später erzeugtes Element bliebe stumm.
let element: HTMLVideoElement | null = null;

export function videoUrl(pfad: string): string {
  return `${import.meta.env.BASE_URL}${pfad}`;
}

export function getSharedVideo(): HTMLVideoElement {
  if (!element) {
    element = document.createElement('video');
    element.className = 'timer-video';
    element.playsInline = true;
    element.setAttribute('playsinline', '');
    element.preload = 'auto';
  }
  return element;
}

/** Muss synchron aus einem Klick-Handler aufgerufen werden (iOS-Freischaltung,
 * analog zu unlockAudio()). Die ersten ~0,1 s des Videos sind still. */
export function primeVideo(pfad: string): void {
  const v = getSharedVideo();
  v.src = videoUrl(pfad);
  v.muted = false;
  v.play()
    .then(() => {
      v.pause();
      v.currentTime = 0;
    })
    .catch(() => undefined);
}
