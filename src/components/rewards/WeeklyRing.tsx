import { Fire } from '@phosphor-icons/react';

interface WeeklyRingProps {
  erledigt: number;
  ziel: number;
  streakWochen: number;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WeeklyRing({ erledigt, ziel, streakWochen }: WeeklyRingProps) {
  const anteil = ziel > 0 ? Math.min(1, erledigt / ziel) : 0;
  const offset = CIRCUMFERENCE * (1 - anteil);

  return (
    <div className="card weekly-ring-card">
      <svg viewBox="0 0 100 100" className="weekly-ring" role="img" aria-label={`${erledigt} von ${ziel} Einheiten diese Woche`}>
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="9" style={{ stroke: 'var(--border)' }} />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ stroke: 'var(--teal)', transition: 'stroke-dashoffset 0.4s ease' }}
        />
        <text x="50" y="47" textAnchor="middle" fontSize="26" style={{ fill: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
          {erledigt}
        </text>
        <text x="50" y="65" textAnchor="middle" fontSize="11" style={{ fill: 'var(--muted)' }}>
          von {ziel}
        </text>
      </svg>
      <div className="weekly-ring-info">
        <span className="meta-label">Diese Woche</span>
        <strong>
          {erledigt} von {ziel} Einheiten
        </strong>
        {streakWochen > 0 && (
          <span className="streak-badge">
            <Fire size={16} weight="fill" />
            {streakWochen} {streakWochen === 1 ? 'Woche' : 'Wochen'} in Folge
          </span>
        )}
      </div>
    </div>
  );
}
