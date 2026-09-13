import { useState } from 'react';
import type { TrainingSet } from '../../types';
import { useAppDataApi } from '../../lib/AppDataContext';
import { useTimerPlayer } from './useTimerPlayer';
import { useWakeLock } from '../../lib/wakeLock';
import { unlockAudio, setMuted, isMuted } from '../../lib/sound';
import { StickFigure } from '../StickFigure';
import { getPoseFrames } from '../figures/poses';
import { newId } from '../../lib/id';

interface TimerScreenProps {
  set: TrainingSet;
  onDone: () => void;
}

export function TimerScreen({ set, onDone }: TimerScreenProps) {
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<'abgeschlossen' | 'abgebrochen' | null>(null);
  const [muted, setMutedState] = useState(isMuted());
  const api = useAppDataApi();
  const { denied: wakeLockDenied } = useWakeLock(started && !result);

  const handleFinish = (erreichterUebungIndex: number, status: 'abgeschlossen' | 'abgebrochen') => {
    const absolvierteUebungen = set.uebungen.slice(0, erreichterUebungIndex).map((u) => ({ exerciseId: u.exerciseId, name: u.name }));
    const now = new Date();
    api.mutate((data) => ({
      ...data,
      history: [
        {
          id: newId('log'),
          datum: now.toISOString().slice(0, 10),
          uhrzeit: now.toTimeString().slice(0, 5),
          einheitentyp: set.name,
          setId: set.id,
          set,
          absolvierteUebungen,
          status
        },
        ...data.history
      ]
    }));
    setResult(status);
  };

  if (!started) {
    const gesamtMin = Math.round(set.uebungen.reduce((s, u) => s + estimateSeconds(u), 0) / 60);
    return (
      <div className="timer-gate">
        <h2>{set.name}</h2>
        <p>{set.uebungen.length} Übungen · ca. {gesamtMin} Minuten</p>
        <ol className="timer-gate-list">
          {set.uebungen.map((u, i) => (
            <li key={i}>{u.name}</li>
          ))}
        </ol>
        <button
          className="btn-primary btn-huge"
          onClick={() => {
            unlockAudio();
            setStarted(true);
          }}
        >
          Einheit starten
        </button>
        <button className="btn-secondary" onClick={onDone}>
          Zurück
        </button>
      </div>
    );
  }

  return <ActivePlayer set={set} onFinish={handleFinish} result={result} onDone={onDone} muted={muted} onToggleMute={() => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }} wakeLockDenied={wakeLockDenied} />;
}

function estimateSeconds(u: TrainingSet['uebungen'][number]): number {
  // Grobe Schätzung für die Vorschau; die exakte Ablaufplanung übernimmt ablaufplan.ts.
  const wechsel = u.einseitig ? u.wechselzeit_s : 0;
  switch (u.parameter.art) {
    case 'halten':
      return (u.parameter.dauer_s * u.parameter.wiederholungen + u.parameter.pause_zwischen_wdh_s * Math.max(0, u.parameter.wiederholungen - 1)) * (u.einseitig ? 2 : 1) + wechsel;
    case 'intervall':
      return (u.parameter.arbeit_s + u.parameter.pause_s) * u.parameter.anzahl * (u.einseitig ? 2 : 1) + wechsel;
    case 'isometrie_serie':
      return (u.parameter.kontraktion_s + u.parameter.pause_s) * u.parameter.anzahl * (u.einseitig ? 2 : 1) + wechsel;
    case 'kraftsatz': {
      const proSatz = u.einseitig ? u.parameter.satzdauer_s * 2 + wechsel : u.parameter.satzdauer_s;
      const pause = Math.max(0, u.parameter.erholung_pro_seite_s - u.parameter.satzdauer_s - wechsel);
      return (proSatz + pause) * u.parameter.satzanzahl;
    }
  }
}

interface ActivePlayerProps {
  set: TrainingSet;
  onFinish: (erreichterUebungIndex: number, status: 'abgeschlossen' | 'abgebrochen') => void;
  result: 'abgeschlossen' | 'abgebrochen' | null;
  onDone: () => void;
  muted: boolean;
  onToggleMute: () => void;
  wakeLockDenied: boolean;
}

function ActivePlayer({ set, onFinish, result, onDone, muted, onToggleMute, wakeLockDenied }: ActivePlayerProps) {
  const player = useTimerPlayer(set, onFinish);
  const [confirmAbort, setConfirmAbort] = useState(false);

  if (result) {
    return (
      <div className="timer-gate">
        <h2>{result === 'abgeschlossen' ? 'Einheit abgeschlossen 🎉' : 'Einheit abgebrochen'}</h2>
        <p>{set.name}</p>
        <button className="btn-primary btn-huge" onClick={onDone}>
          Fertig
        </button>
      </div>
    );
  }

  const phase = player.phase;
  const uebung = phase ? set.uebungen[phase.uebungIndex] : null;
  const naechsteUebung = player.naechstePhase && player.naechstePhase.uebungIndex !== phase?.uebungIndex ? set.uebungen[player.naechstePhase.uebungIndex] : null;
  const frames = uebung?.darstellungsart === 'figur' ? getPoseFrames(uebung.figur_id) : undefined;
  const sekunden = Math.ceil(player.remainingMs / 1000);
  const fortschritt = player.gesamtDauerS > 0 ? Math.min(1, player.vergangeneS / player.gesamtDauerS) : 0;
  const zeigtFuellUebung = phase?.art === 'pause' && phase.fuellUebung;
  const fuellFrames = zeigtFuellUebung ? getPoseFrames(phase.fuellUebung!.figur_id) : undefined;

  return (
    <div className="timer-screen">
      <div className="timer-progress">
        <div className="timer-progress-bar" style={{ width: `${fortschritt * 100}%` }} />
      </div>

      {wakeLockDenied && <div className="timer-hint">Bildschirm-Sperre nicht möglich — das Display kann sich abschalten.</div>}

      <div className="timer-figure">
        {zeigtFuellUebung && phase.fuellUebung ? (
          fuellFrames ? (
            <StickFigure frames={fuellFrames} />
          ) : (
            <div className="timer-figure-fallback">
              <strong>{phase.fuellUebung.name}</strong>
            </div>
          )
        ) : frames ? (
          <StickFigure frames={frames} mirrored={phase?.seite === 'R'} active={player.status === 'laufend'} />
        ) : (
          <div className="timer-figure-fallback">
            <strong>{uebung?.name}</strong>
            {uebung?.beschreibung && <p>{uebung.beschreibung}</p>}
          </div>
        )}
      </div>

      <div className="timer-info">
        <h2>{zeigtFuellUebung ? `Zwischendurch: ${phase!.fuellUebung!.name}` : uebung?.name}</h2>
        <p className="timer-phase-label">{phase?.label}</p>
        <div className="timer-countdown">{sekunden}</div>
        {naechsteUebung && <p className="timer-next">Nächste Übung: {naechsteUebung.name}</p>}
      </div>

      <div className="timer-controls">
        <button className="btn-secondary btn-huge" onClick={onToggleMute} aria-label="Ton stumm/ein">
          {muted ? '🔇' : '🔊'}
        </button>
        {player.status === 'laufend' ? (
          <button className="btn-primary btn-huge" onClick={player.pause}>
            Pause
          </button>
        ) : (
          <button className="btn-primary btn-huge" onClick={player.resume}>
            Weiter
          </button>
        )}
        <button className="btn-secondary btn-huge" onClick={player.skip}>
          Überspringen
        </button>
      </div>

      {confirmAbort ? (
        <div className="timer-abort-confirm">
          <p>Einheit wirklich abbrechen?</p>
          <button className="btn-danger" onClick={player.abort}>
            Ja, abbrechen
          </button>
          <button className="btn-secondary" onClick={() => setConfirmAbort(false)}>
            Weitermachen
          </button>
        </div>
      ) : (
        <button className="btn-link-danger" onClick={() => setConfirmAbort(true)}>
          Einheit abbrechen
        </button>
      )}
    </div>
  );
}
