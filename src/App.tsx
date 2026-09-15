import { useState } from 'react';
import type { TrainingSet } from './types';
import { AppDataProvider, useAppDataApi, useAppDataState } from './lib/AppDataContext';
import { ConflictDialog } from './components/ConflictDialog';
import { GeneratorScreen } from './components/generator/GeneratorScreen';
import { SetsScreen } from './components/sets/SetsScreen';
import { LibraryScreen } from './components/library/LibraryScreen';
import { TemplatesScreen } from './components/templates/TemplatesScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { TimerScreen } from './components/timer/TimerScreen';
import { DiceFive, ListChecks, Barbell, PuzzlePiece, ClockCounterClockwise, SlidersHorizontal, X } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

type Tab = 'generator' | 'sets' | 'bibliothek' | 'vorlagen' | 'verlauf' | 'einstellungen';

const TABS: { id: Tab; label: string; Icon: Icon }[] = [
  { id: 'generator', label: 'Start', Icon: DiceFive },
  { id: 'sets', label: 'Einheiten', Icon: ListChecks },
  { id: 'bibliothek', label: 'Übungen', Icon: Barbell },
  { id: 'vorlagen', label: 'Vorlagen', Icon: PuzzlePiece },
  { id: 'verlauf', label: 'Verlauf', Icon: ClockCounterClockwise },
  { id: 'einstellungen', label: 'Mehr', Icon: SlidersHorizontal }
];

function Shell() {
  const state = useAppDataState();
  const api = useAppDataApi();
  const [tab, setTab] = useState<Tab>('generator');
  const [activeTimerSet, setActiveTimerSet] = useState<TrainingSet | null>(null);

  if (activeTimerSet) {
    return <TimerScreen set={activeTimerSet} onDone={() => setActiveTimerSet(null)} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark">
          <span className="brand-bar" />
          <span className="brand-bar red" />
          <h1>Kraft &amp; Mobility</h1>
        </div>
      </header>

      {state.error && (
        <div className="error-banner">
          <span>{state.error}</span>
          <button className="btn-icon" onClick={api.dismissError} aria-label="Meldung schließen">
            <X size={16} />
          </button>
        </div>
      )}

      <main className="app-main">
        {state.status === 'loading' && <p className="loading-hint">Lade…</p>}
        {state.status !== 'loading' && tab === 'generator' && <GeneratorScreen onStart={setActiveTimerSet} />}
        {state.status !== 'loading' && tab === 'sets' && <SetsScreen onStart={setActiveTimerSet} />}
        {state.status !== 'loading' && tab === 'bibliothek' && <LibraryScreen />}
        {state.status !== 'loading' && tab === 'vorlagen' && <TemplatesScreen />}
        {state.status !== 'loading' && tab === 'verlauf' && <HistoryScreen onStart={setActiveTimerSet} />}
        {state.status !== 'loading' && tab === 'einstellungen' && <SettingsScreen />}
      </main>

      <nav className="app-nav">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} className={`app-nav-item ${active ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <t.Icon size={19} weight={active ? 'fill' : 'regular'} />
              <span>{t.label}</span>
              <span className="app-nav-indicator" />
            </button>
          );
        })}
      </nav>

      <ConflictDialog />
    </div>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <Shell />
    </AppDataProvider>
  );
}
