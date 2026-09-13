import { useEffect, useRef, useState } from 'react';
import type { Pose } from './figures/poses';

const SHOULDER_HALF_WIDTH = 8;
const HIP_HALF_WIDTH = 7;
const HEAD_RADIUS = 7;

interface Point {
  x: number;
  y: number;
}

interface FullPose extends Pose {
  shoulderL: Point;
  shoulderR: Point;
  hipL: Point;
  hipR: Point;
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
    hipR: { x: pose.hipC.x + perpX * HIP_HALF_WIDTH, y: pose.hipC.y + perpY * HIP_HALF_WIDTH }
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
  strokeColor?: string;
  className?: string;
}

export function StickFigure({ frames, mirrored, active = true, periodMs = 650, strokeColor = 'currentColor', className }: StickFigureProps) {
  const animated = useAnimatedPose(frames, active, periodMs);
  const p = derive(animated);

  const line = (a: Point, b: Point) => <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;

  return (
    <svg viewBox="0 0 100 150" className={className} role="img" aria-hidden="true">
      <g
        stroke={strokeColor}
        strokeWidth={4.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        transform={mirrored ? 'translate(100,0) scale(-1,1)' : undefined}
      >
        <circle cx={p.head.x} cy={p.head.y} r={HEAD_RADIUS} fill="none" />
        {line(p.neck, p.hipC)}
        {line(p.shoulderL, p.elbowL)}
        {line(p.elbowL, p.handL)}
        {line(p.shoulderR, p.elbowR)}
        {line(p.elbowR, p.handR)}
        {line(p.hipL, p.kneeL)}
        {line(p.kneeL, p.ankleL)}
        {line(p.hipR, p.kneeR)}
        {line(p.kneeR, p.ankleR)}
      </g>
    </svg>
  );
}
