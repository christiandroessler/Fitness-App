import { useRef, useState } from 'react';
import type { TrainingSet } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { generateEinheit } from '../../lib/generator';
import { SetBuilder } from '../builder/SetBuilder';

interface GeneratorScreenProps {
  onStart: (set: TrainingSet) => void;
}

export function GeneratorScreen({ onStart }: GeneratorScreenProps) {
  const { data } = useAppDataState();
  const api = useAppDataApi();
  const [templateId, setTemplateId] = useState(data.templates[0]?.id ?? '');
  const [nurPflicht, setNurPflicht] = useState(false);
  const [ergebnis, setErgebnis] = useState<TrainingSet | null>(null);
  const [warnungen, setWarnungen] = useState<string[]>([]);
  const zuletztGeneriertRef = useRef<string[]>([]);

  const template = data.templates.find((t) => t.id === templateId) ?? data.templates[0];

  function generieren() {
    if (!template) return;
    const letzteN = data.history.slice(0, data.settings.letzteNGenerator).flatMap((h) => h.absolvierteUebungen.map((u) => u.exerciseId));
    const vermeideIds = new Set([...letzteN, ...zuletztGeneriertRef.current]);
    const verfuegbar = new Set(data.settings.verfuegbaresEquipment);
    const res = generateEinheit(template, data.exercises, { verfuegbaresEquipment: verfuegbar, vermeideIds, nurPflichtteile: nurPflicht });
    zuletztGeneriertRef.current = res.set.uebungen.map((u) => u.exerciseId).slice(0, 12);
    setErgebnis(res.set);
    setWarnungen(res.warnungen);
  }

  function speichernAlsSet(set: TrainingSet) {
    api.mutate((d) => ({ ...d, sets: [...d.sets, set] }));
    setErgebnis(null);
  }

  if (ergebnis) {
    return (
      <div className="screen">
        <h2>Generierte Einheit</h2>
        {warnungen.length > 0 && (
          <div className="warning-box">
            {warnungen.map((w, i) => (
              <p key={i}>⚠ {w}</p>
            ))}
          </div>
        )}
        <SetBuilder initialSet={ergebnis} bibliothek={data.exercises} onSave={speichernAlsSet} onStart={onStart} onCancel={() => setErgebnis(null)} />
      </div>
    );
  }

  return (
    <div className="screen">
      <h2>Einheit generieren</h2>
      <label>
        Vorlage
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          {data.templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="checkbox-label">
        <input type="checkbox" checked={nurPflicht} onChange={(e) => setNurPflicht(e.target.checked)} />
        Optionale Teile (z. B. Abschluss) auslassen
      </label>
      <button className="btn-primary btn-huge" onClick={generieren} disabled={!template}>
        Einheit generieren
      </button>
      {data.templates.length === 0 && <p className="empty-hint">Keine Vorlagen vorhanden — erst unter "Vorlagen" eine anlegen.</p>}
    </div>
  );
}
