// Töne der Timer-Wiedergabe (7.4): Countdown letzte 3 s, Startton je Abschnitt,
// Endton der Einheit — Start- und Endton hörbar unterschiedlich. Reine Web-Audio-
// Beeps, keine Audiodateien nötig. Auf iOS muss die Wiedergabe durch eine
// Nutzergeste (Start-Knopf) freigeschaltet werden — dafür unlock().
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

/** Muss synchron aus einem Klick-Handler aufgerufen werden (iOS-Freischaltung). */
export function unlockAudio(): void {
  const c = getCtx();
  if (c.state === 'suspended') void c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.01);
}

function beep(frequency: number, durationMs: number, when = 0, volume = 0.22): void {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  const start = c.currentTime + when;
  const dur = durationMs / 1000;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

let muted = false;
export function setMuted(m: boolean): void {
  muted = m;
}
export function isMuted(): boolean {
  return muted;
}

export function playStartTon(): void {
  if (muted) return;
  beep(880, 130);
}

export function playCountdownBeep(): void {
  if (muted) return;
  beep(440, 90);
}

export function playEndTon(): void {
  if (muted) return;
  beep(660, 160, 0);
  beep(990, 220, 0.18);
}
