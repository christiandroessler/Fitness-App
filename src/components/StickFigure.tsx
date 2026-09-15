import { useEffect, useRef, useState } from 'react';
import type { Pose } from './figures/poses';

// Körperbreiten der soliden Figur (Schritt 2: "menschlicher" statt Strichmännchen).
// Gliedmaßen werden als dicke, rundkappige Linien ("Kapseln") gezeichnet — bei
// gleicher Breite wie ihre Endpunkt-Kreise ergibt das durchgehend weiche Übergänge.
const SHOULDER_HALF_WIDTH = 10;
const HIP_HALF_WIDTH = 9;
const HEAD_RADIUS = 10.5;
const ARM_WIDTH = 9.5;
const LEG_WIDTH = 13.5;
const NECK_WIDTH = 9;
const EYE_OFFSET = 3.4;
const EYE_RADIUS = 1.3;

interface Point {
  x: number;
  y: number;
}

interface FullPose extends Pose {
  shoulderL: Point;
  shoulderR: Point;
  hipL: Point;
  hipR: Point;
  perpX: number;
  perpY: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((key) => {
    out[key] = lerpPoint(a[key], b[key], t);
  });
  return out;
}

/** Ergänzt Schultern und Hüften senkrecht zur Wirbelsäule, damit sie sich mit der
 * Rumpfneigung mitdrehen, statt fix waagerecht zu bleiben. */
function derive(pose: Pose): FullPose {
  const dx = pose.neck.x - pose.hipC.x;
  const dy = pose.neck.y - pose.hipC.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  return {
    ...pose,
    shoulderL: { x: pose.neck.x - perpX * SHOULDER_HALF_WIDTH, y: pose.neck.y - perpY * SHOULDER_HALF_WIDTH },
    shoulderR: { x: pose.neck.x + perpX * SHOULDER_HALF_WIDTH, y: pose.neck.y + perpY * SHOULDER_HALF_WIDTH },
    hipL: { x: pose.hipC.x - perpX * HIP_HALF_WIDTH, y: pose.hipC.y - perpY * HIP_HALF_WIDTH },
    hipR: { x: pose.hipC.x + perpX * HIP_HALF_WIDTH, y: pose.hipC.y + perpY * HIP_HALF_WIDTH },
    perpX,
    perpY
  };
}

function useAnimatedPose(frames: Pose[], active: boolean, periodMs: number): Pose {
  const [pose, setPose] = useState<Pose>(frames[0]);
  const rafRef = useRef<number | undefined>(undefined);
  const stateRef = useRef({ segment: 0, direction: 1 as 1 | -1, start: performance.now() });

  useEffect(() => {
    stateRef.current = { segment: 0, direction: 1, start: performance.now() };
    setPose(frames[0]);
  }, [frames]);

  useEffect(() => {
    if (!active || frames.length < 2) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const n = frames.length;

    function tick(now: number) {
      const st = stateRef.current;
      let t = (now - st.start) / periodMs;
      if (t >= 1) {
        // Segment abgeschlossen: weiterschalten (Ping-Pong durch die Keyframes).
        st.start = now;
        t = 0;
        let nextSegment = st.segment + st.direction;
        if (nextSegment >= n - 1) {
          nextSegment = n - 1;
          st.direction = -1;
        } else if (nextSegment <= 0) {
          nextSegment = 0;
          st.direction = 1;
        }
        st.segment = nextSegment;
      }
      const from = st.direction === 1 ? frames[st.segment] : frames[st.segment + 1] ?? frames[st.segment];
      const to = st.direction === 1 ? frames[Math.min(st.segment + 1, n - 1)] : frames[st.segment];
      const localT = st.direction === 1 ? t : 1 - t;
      setPose(lerpPose(from, to, Math.min(1, Math.max(0, localT))));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [frames, active, periodMs]);

  return pose;
}

export interface StickFigureProps {
  frames: Pose[];
  mirrored?: boolean;
  active?: boolean;
  periodMs?: number;
  bodyColor?: string;
  className?: string;
}

export function StickFigure({ frames, mirrored, active = true, periodMs = 650, bodyColor = 'currentColor', className }: StickFigureProps) {
  const animated = useAnimatedPose(frames, active, periodMs);
  const p = derive(animated);

  const limb = (a: Point, b: Point, width: number, key: string) => (
    <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={bodyColor} strokeWidth={width} strokeLinecap="round" />
  );
  const joint = (pt: Point, width: number, key: string) => <circle key={key} cx={pt.x} cy={pt.y} r={width / 2} fill={bodyColor} />;

  const eyeL = { x: p.head.x - p.perpX * EYE_OFFSET, y: p.head.y - p.perpY * EYE_OFFSET };
  const eyeR = { x: p.head.x + p.perpX * EYE_OFFSET, y: p.head.y + p.perpY * EYE_OFFSET };

  return (
    <svg viewBox="0 0 100 150" className={className} role="img" aria-hidden="true">
      <g transform={mirrored ? 'translate(100,0) scale(-1,1)' : undefined}>
        {/* Rumpf: gefülltes Viereck mit abgerundeten Ecken (Schulter-/Hüftkreise) */}
        <polygon points={`${p.shoulderL.x},${p.shoulderL.y} ${p.shoulderR.x},${p.shoulderR.y} ${p.hipR.x},${p.hipR.y} ${p.hipL.x},${p.hipL.y}`} fill={bodyColor} />
        {joint(p.shoulderL, ARM_WIDTH, 'sL')}
        {joint(p.shoulderR, ARM_WIDTH, 'sR')}
        {joint(p.hipL, LEG_WIDTH, 'hL')}
        {joint(p.hipR, LEG_WIDTH, 'hR')}

        {/* Beine */}
        {limb(p.hipL, p.kneeL, LEG_WIDTH, 'thighL')}
        {joint(p.kneeL, LEG_WIDTH, 'kneeL')}
        {limb(p.kneeL, p.ankleL, LEG_WIDTH * 0.85, 'shinL')}
        {joint(p.ankleL, LEG_WIDTH * 0.85, 'ankleL')}
        {limb(p.hipR, p.kneeR, LEG_WIDTH, 'thighR')}
        {joint(p.kneeR, LEG_WIDTH, 'kneeR')}
        {limb(p.kneeR, p.ankleR, LEG_WIDTH * 0.85, 'shinR')}
        {joint(p.ankleR, LEG_WIDTH * 0.85, 'ankleR')}

        {/* Arme */}
        {limb(p.shoulderL, p.elbowL, ARM_WIDTH, 'upperL')}
        {joint(p.elbowL, ARM_WIDTH * 0.85, 'elbowL')}
        {limb(p.elbowL, p.handL, ARM_WIDTH * 0.85, 'forearmL')}
        {joint(p.handL, ARM_WIDTH * 0.85, 'handL')}
        {limb(p.shoulderR, p.elbowR, ARM_WIDTH, 'upperR')}
        {joint(p.elbowR, ARM_WIDTH * 0.85, 'elbowR')}
        {limb(p.elbowR, p.handR, ARM_WIDTH * 0.85, 'forearmR')}
        {joint(p.handR, ARM_WIDTH * 0.85, 'handR')}

        {/* Hals + Kopf */}
        {limb(p.neck, p.head, NECK_WIDTH, 'neck')}
        <circle cx={p.head.x} cy={p.head.y} r={HEAD_RADIUS} fill={bodyColor} />
        <circle cx={eyeL.x} cy={eyeL.y} r={EYE_RADIUS} fill="var(--bg, #161826)" opacity={0.55} />
        <circle cx={eyeR.x} cy={eyeR.y} r={EYE_RADIUS} fill="var(--bg, #161826)" opacity={0.55} />
      </g>
    </svg>
  );
}
