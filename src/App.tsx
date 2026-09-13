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

type Tab = 'generator' | 'sets' | 'bibliothek' | 'vorlagen' | 'verlauf' | 'einstellungen';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'generator', label: 'Start', icon: '🎲' },
  { id: 'sets', label: 'Einheiten', icon: '📋' },
  { id: 'bibliothek', label: 'Übungen', icon: '🏋' },
  { id: 'vorlagen', label: 'Vorlagen', icon: '🧩' },
  { id: 'verlauf', label: 'Verlauf', icon: '🕓' },
  { id: 'einstellungen', label: 'Mehr', icon: '⚙️' }
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
        <h1>Kraft &amp; Mobility</h1>
      </header>

      {state.error && (
        <div className="error-banner">
          <span>{state.error}</span>
          <button className="btn-icon" onClick={api.dismissError} aria-label="Meldung schließen">
            ✕
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
        {TABS.map((t) => (
          <button key={t.id} className={`app-nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="app-nav-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
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
