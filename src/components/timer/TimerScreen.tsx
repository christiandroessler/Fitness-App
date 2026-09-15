import { useEffect, useRef, useState } from 'react';
import type { TrainingSet } from '../../types';
import { KATEGORIE_LABEL, BEWEGUNGSMUSTER_LABEL } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { useTimerPlayer, type TimerPlayer } from './useTimerPlayer';
import { useWakeLock } from '../../lib/wakeLock';
import { unlockAudio, primeSpeech, speakHints, setMuted, isMuted } from '../../lib/sound';
import { berechneStreak, wochenFortschritt } from '../../lib/streak';
import { StickFigure } from '../StickFigure';
import { getPoseFrames } from '../figures/poses';
import { newId } from '../../lib/id';
import { SpeakerHigh, SpeakerSlash, SkipForward, SkipBack, CheckCircle, Fire } from '@phosphor-icons/react';

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
        <p>
          {set.uebungen.length} Übungen · ca. {gesamtMin} Minuten
        </p>
        <ol className="timer-gate-list">
          {set.uebungen.map((u, i) => (
            <li key={i}>{u.name}</li>
          ))}
        </ol>
        <button
          className="btn-cta"
          onClick={() => {
            unlockAudio();
            primeSpeech();
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

  return (
    <ActivePlayer
      set={set}
      onFinish={handleFinish}
      result={result}
      onDone={onDone}
      muted={muted}
      onToggleMute={() => {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
      }}
      wakeLockDenied={wakeLockDenied}
    />
  );
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

function baueDanachText(player: TimerPlayer, set: TrainingSet): string | null {
  const next = player.phasen[player.phaseIndex + 1];
  if (!next) return null;
  if (next.uebungIndex !== player.phase?.uebungIndex) {
    return `Danach: ${set.uebungen[next.uebungIndex]?.name ?? ''}`;
  }
  if (next.art === 'wechsel') {
    const uebernaechste = player.phasen[player.phaseIndex + 2];
    const seite = uebernaechste?.seite === 'R' ? ', dann rechte Seite' : uebernaechste?.seite === 'L' ? ', dann linke Seite' : '';
    return `Danach: ${next.dauer_s} s Seitenwechsel${seite}`;
  }
  return `Danach: ${next.label}`;
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
  const { data } = useAppDataState();

  const phase = player.phase;
  const uebung = phase ? set.uebungen[phase.uebungIndex] : null;
  const zeigtFuellUebung = phase?.art === 'pause' && phase.fuellUebung;

  // Liest die Ausführungshinweise einer Übung genau einmal vor — in der Pause, oder
  // beim einzigen Arbeitsabschnitt, falls die Übung gar keine Pause hat (z. B. ein
  // einfacher Halten-Block ohne Wiederholungen).
  const spokenRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (result || !phase || player.status !== 'laufend') return;
    const idx = phase.uebungIndex;
    if (zeigtFuellUebung && phase.fuellUebung) {
      const key = `fill-${idx}`;
      if (!spokenRef.current.has(key) && phase.fuellUebung.hinweise?.length) {
        spokenRef.current.add(key);
        speakHints(phase.fuellUebung.hinweise);
      }
      return;
    }
    const key = `main-${idx}`;
    if (spokenRef.current.has(key)) return;
    const hints = uebung?.hinweise;
    if (!hints || hints.length === 0) return;
    const hatPause = player.phasen.some((ph) => ph.uebungIndex === idx && ph.art === 'pause');
    const istPassenderMoment = phase.art === 'pause' || (!hatPause && phase.art === 'arbeit');
    if (istPassenderMoment) {
      spokenRef.current.add(key);
      speakHints(hints);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, phase?.uebungIndex, phase?.art, player.status]);

  if (result === 'abgeschlossen') {
    const erledigt = wochenFortschritt(data.history);
    const ziel = data.settings.wochenzielEinheiten ?? 3;
    const { wochen: streakWochen } = berechneStreak(data.history);
    return (
      <div className="timer-gate timer-result">
        <div className="timer-result-icon">
          <CheckCircle size={72} weight="fill" />
        </div>
        <h2>Einheit abgeschlossen</h2>
        <p>{set.name}</p>
        <p className="timer-result-stat">
          Diese Woche: {erledigt} von {ziel} Einheiten
        </p>
        {streakWochen > 0 && (
          <p className="timer-result-stat streak">
            <Fire size={16} weight="fill" /> {streakWochen} {streakWochen === 1 ? 'Woche' : 'Wochen'} in Folge
          </p>
        )}
        <button className="btn-cta" onClick={onDone}>
          Fertig
        </button>
      </div>
    );
  }

  if (result === 'abgebrochen') {
    return (
      <div className="timer-gate">
        <h2>Einheit abgebrochen</h2>
        <p>{set.name}</p>
        <button className="btn-cta" onClick={onDone}>
          Fertig
        </button>
      </div>
    );
  }

  const frames = uebung?.darstellungsart === 'figur' ? getPoseFrames(uebung.figur_id) : undefined;
  const sekunden = Math.ceil(player.remainingMs / 1000);
  const fortschritt = player.gesamtDauerS > 0 ? Math.min(1, player.vergangeneS / player.gesamtDauerS) : 0;
  const fuellFrames = zeigtFuellUebung ? getPoseFrames(phase.fuellUebung!.figur_id) : undefined;
  const danachText = baueDanachText(player, set);
  const nochMin = Math.round((player.gesamtDauerS - player.vergangeneS) / 60);
  const aktiveHinweise = zeigtFuellUebung ? phase.fuellUebung?.hinweise : uebung?.hinweise;

  return (
    <div className="timer-screen">
      <div className="timer-meta-row">
        <span>
          Übung {(phase?.uebungIndex ?? 0) + 1} von {set.uebungen.length}
          {uebung ? ` · ${KATEGORIE_LABEL[uebung.kategorie]} · ${BEWEGUNGSMUSTER_LABEL[uebung.bewegungsmuster]}` : ''}
        </span>
        <span>noch ca. {nochMin} min</span>
      </div>
      <div className="timer-progress">
        <div className="timer-progress-bar" style={{ width: `${fortschritt * 100}%` }} />
      </div>

      {wakeLockDenied && <div className="timer-hint">Bildschirm-Sperre nicht möglich — das Display kann sich abschalten.</div>}

      <div className="timer-figure">
        {zeigtFuellUebung && phase.fuellUebung ? (
          fuellFrames ? (
            <StickFigure frames={fuellFrames} active={player.status === 'laufend'} />
          ) : (
            <div className="timer-figure-fallback">
              <strong>{phase.fuellUebung.name}</strong>
            </div>
          )
        ) : frames ? (
          <StickFigure frames={frames} mirrored={phase?.seite === 'R'} active={player.status === 'laufend' && phase?.art !== 'pause'} />
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
        {danachText && <p className="timer-next">{danachText}</p>}
        {aktiveHinweise && aktiveHinweise.length > 0 && (
          <ul className="timer-hints">
            {aktiveHinweise.map((hinweis, i) => (
              <li key={i}>{hinweis}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="timer-controls">
        <button className="btn-icon" onClick={onToggleMute} aria-label="Ton stumm/ein">
          {muted ? <SpeakerSlash size={19} /> : <SpeakerHigh size={19} />}
        </button>
        <button className="btn-icon" onClick={player.back} aria-label="Zurück zur vorherigen Übung">
          <SkipBack size={19} />
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
        <button className="btn-icon" onClick={player.skip} aria-label="Übung überspringen">
          <SkipForward size={19} />
        </button>
      </div>

      {confirmAbort ? (
        <div className="confirm-box">
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
