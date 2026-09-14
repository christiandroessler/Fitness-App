// Screen Wake Lock (3.6): hält den Bildschirm während einer laufenden Einheit an.
// Wird die Anfrage abgelehnt (Akku, Stromsparmodus) oder ist die API nicht verfügbar,
// gibt der Hook das über `denied` zurück, damit die UI einen Hinweis zeigen kann.
import { useEffect, useRef, useState } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
}

export function useWakeLock(active: boolean): { denied: boolean; supported: boolean } {
  const [denied, setDenied] = useState(false);
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  useEffect(() => {
    if (!active || !supported) return;
    let cancelled = false;

    async function request() {
      try {
        const nav = navigator as Navigator & { wakeLock: { request(type: 'screen'): Promise<WakeLockSentinelLike> } };
        const sentinel = await nav.wakeLock.request('screen');
        if (cancelled) {
          void sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
        setDenied(false);
      } catch {
        if (!cancelled) setDenied(true);
      }
    }

    void request();

    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && active && !sentinelRef.current) {
        void request();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (sentinelRef.current && !sentinelRef.current.released) {
        void sentinelRef.current.release();
      }
      sentinelRef.current = null;
    };
  }, [active, supported]);

  return { denied, supported };
}
