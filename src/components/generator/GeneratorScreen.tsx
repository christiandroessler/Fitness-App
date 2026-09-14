import { useRef, useState } from 'react';
import type { TrainingSet } from '../../types';
import { KATEGORIE_LABEL } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { generateEinheit } from '../../lib/generator';
import { SetBuilder } from '../builder/SetBuilder';
import { Warning } from '@phosphor-icons/react';

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
  const optionalerTeil = template?.programmteile.find((t) => t.optional);

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
              <p key={i}>
                <Warning size={14} weight="bold" style={{ verticalAlign: '-2px', marginRight: 4 }} />
                {w}
              </p>
            ))}
          </div>
        )}
        <SetBuilder initialSet={ergebnis} bibliothek={data.exercises} onSave={speichernAlsSet} onStart={onStart} onCancel={() => setErgebnis(null)} />
      </div>
    );
  }

  if (data.templates.length === 0) {
    return (
      <div className="screen">
        <h2>Einheit generieren</h2>
        <p className="empty-hint">Keine Vorlagen vorhanden — erst unter „Vorlagen" eine anlegen.</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="meta-label">Vorlage</span>
      </div>

      <div className="segmented">
        {data.templates.map((t) => (
          <button key={t.id} type="button" className={`segmented-item ${t.id === template?.id ? 'active' : ''}`} onClick={() => setTemplateId(t.id)}>
            {t.name}
          </button>
        ))}
      </div>

      {template && (
        <div className="card">
          {template.beschreibung && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>{template.beschreibung}</p>}
          <div className="filter-pills" style={{ flexWrap: 'wrap', paddingTop: 8 }}>
            {template.programmteile.map((teil) => (
              <span key={teil.id} className="pill">
                {teil.name} {teil.dauer_min}′
              </span>
            ))}
          </div>
        </div>
      )}

      {optionalerTeil && (
        <button type="button" className="toggle-row" onClick={() => setNurPflicht((v) => !v)}>
          <span>
            {optionalerTeil.name}
            {optionalerTeil.auswahlregel.kategorien?.[0] ? ` (${KATEGORIE_LABEL[optionalerTeil.auswahlregel.kategorien[0]]})` : ''} auslassen
          </span>
          <span className={`toggle-track ${nurPflicht ? 'on' : ''}`}>
            <span className="toggle-thumb" />
          </span>
        </button>
      )}

      <button className="btn-cta" onClick={generieren} disabled={!template}>
        Einheit generieren
      </button>
    </div>
  );
}
