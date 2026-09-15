import { useState } from 'react';
import type { Bewegungsmuster, Equipment, Kategorie, Programmteil, Template } from '../../types';
import { ALLE_EQUIPMENT, BEWEGUNGSMUSTER_LABEL, EQUIPMENT_LABEL, KATEGORIE_LABEL } from '../../types';
import { newId } from '../../lib/id';
import { CheckboxGroup } from '../common/CheckboxGroup';
import { CaretDown, CaretUp, Trash } from '@phosphor-icons/react';

const KATEGORIEN = Object.keys(KATEGORIE_LABEL) as Kategorie[];
const BEWEGUNGSMUSTER = Object.keys(BEWEGUNGSMUSTER_LABEL) as Bewegungsmuster[];
const AUSWAEHLBARES_EQUIPMENT = ALLE_EQUIPMENT.filter((e) => e !== 'keins');

function neuerProgrammteil(): Programmteil {
  return { id: newId('teil'), name: 'Neuer Teil', dauer_min: 5, auswahlregel: {} };
}

function teilMeta(teil: Programmteil): string {
  if (teil.istKraftteil) {
    const kat = teil.auswahlregel.kategorien?.map((k) => KATEGORIE_LABEL[k]).join(', ') ?? 'Kraft';
    return `${kat} · ${teil.satzanzahl ?? 3} Sätze à ${teil.satzdauer_s ?? 40} s · ${teil.erholung_pro_seite_s ?? 120} s Erholung`;
  }
  const parts = [...(teil.auswahlregel.kategorien?.map((k) => KATEGORIE_LABEL[k]) ?? []), ...(teil.auswahlregel.bewegungsmuster?.map((b) => BEWEGUNGSMUSTER_LABEL[b]) ?? [])];
  let s = parts.join(' · ');
  if (teil.optional) s = s ? `${s} · optional` : 'optional';
  return s || '—';
}

interface ProgrammteilEditorProps {
  teil: Programmteil;
  index: number;
  count: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (t: Programmteil) => void;
  onRemove: () => void;
  onMove: (delta: -1 | 1) => void;
}

function ProgrammteilEditor({ teil, index, count, expanded, onToggleExpand, onChange, onRemove, onMove }: ProgrammteilEditorProps) {
  const accent = teil.istKraftteil ? 'accent-red' : teil.optional ? '' : 'accent-teal';

  return (
    <div className={`accent-card ${accent}`} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="programmteil-header">
        <button
          type="button"
          onClick={onToggleExpand}
          style={{ flex: 1, background: 'none', border: 'none', padding: 0, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, textAlign: 'left' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <strong style={{ fontSize: '0.95rem', fontWeight: 500 }}>{teil.name}</strong>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>{teil.dauer_min} min</span>
            {expanded ? <CaretUp size={15} color="var(--muted)" /> : <CaretDown size={15} color="var(--muted)" />}
          </span>
          <span className="list-row-meta">{teilMeta(teil)}</span>
        </button>
        <div className="set-exercise-actions">
          <button className="btn-icon" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Nach oben">
            ↑
          </button>
          <button className="btn-icon" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Nach unten">
            ↓
          </button>
          <button className="btn-icon btn-icon-danger" onClick={onRemove} aria-label="Teil entfernen">
            <Trash size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <label>
            Name
            <input className="programmteil-name" value={teil.name} onChange={(e) => onChange({ ...teil, name: e.target.value })} />
          </label>

          <label>
            Dauer (min)
            <input type="number" min={1} value={teil.dauer_min} onChange={(e) => onChange({ ...teil, dauer_min: Number(e.target.value) })} />
          </label>

          <CheckboxGroup
            legend="Kategorien"
            options={KATEGORIEN}
            labels={KATEGORIE_LABEL}
            selected={teil.auswahlregel.kategorien ?? []}
            onChange={(next) => onChange({ ...teil, auswahlregel: { ...teil.auswahlregel, kategorien: next.length ? next : undefined } })}
          />
          <CheckboxGroup
            legend="Bewegungsmuster"
            options={BEWEGUNGSMUSTER}
            labels={BEWEGUNGSMUSTER_LABEL}
            selected={teil.auswahlregel.bewegungsmuster ?? []}
            onChange={(next) => onChange({ ...teil, auswahlregel: { ...teil.auswahlregel, bewegungsmuster: next.length ? next : undefined } })}
          />

          <button type="button" className="toggle-row" onClick={() => onChange({ ...teil, optional: !teil.optional })}>
            <span>Optional (z. B. Abschluss)</span>
            <span className={`toggle-track ${teil.optional ? 'on' : ''}`}>
              <span className="toggle-thumb" />
            </span>
          </button>

          <button
            type="button"
            className="toggle-row"
            onClick={() =>
              onChange({
                ...teil,
                istKraftteil: !teil.istKraftteil,
                satzanzahl: !teil.istKraftteil ? (teil.satzanzahl ?? 3) : undefined,
                satzdauer_s: !teil.istKraftteil ? (teil.satzdauer_s ?? 40) : undefined,
                erholung_pro_seite_s: !teil.istKraftteil ? (teil.erholung_pro_seite_s ?? 120) : undefined
              })
            }
          >
            <span>Kraftteil (fester Kraftsatz statt freier Übungsauswahl)</span>
            <span className={`toggle-track ${teil.istKraftteil ? 'on' : ''}`}>
              <span className="toggle-thumb" />
            </span>
          </button>

          {teil.istKraftteil && (
            <>
              <div className="form-row">
                <label>
                  Sätze
                  <input type="number" min={1} value={teil.satzanzahl ?? 3} onChange={(e) => onChange({ ...teil, satzanzahl: Number(e.target.value) })} />
                </label>
                <label>
                  Satzdauer (s)
                  <input type="number" min={1} value={teil.satzdauer_s ?? 40} onChange={(e) => onChange({ ...teil, satzdauer_s: Number(e.target.value) })} />
                </label>
                <label>
                  Ziel-Erholung/Seite (s)
                  <input type="number" min={0} value={teil.erholung_pro_seite_s ?? 120} onChange={(e) => onChange({ ...teil, erholung_pro_seite_s: Number(e.target.value) })} />
                </label>
              </div>
              <CheckboxGroup
                legend="Füllübung in Satzpausen (Bewegungsmuster)"
                options={BEWEGUNGSMUSTER}
                labels={BEWEGUNGSMUSTER_LABEL}
                selected={teil.fuellUebungAuswahlregel?.bewegungsmuster ?? []}
                onChange={(next) => onChange({ ...teil, fuellUebungAuswahlregel: next.length ? { bewegungsmuster: next } : undefined })}
              />
            </>
          )}

          <CheckboxGroup
            legend="Bevorzugtes Equipment (weiche Präferenz)"
            options={AUSWAEHLBARES_EQUIPMENT as Equipment[]}
            labels={EQUIPMENT_LABEL}
            selected={teil.bevorzugtesEquipment ?? []}
            onChange={(next) => onChange({ ...teil, bevorzugtesEquipment: next.length ? next : undefined })}
          />
        </>
      )}
    </div>
  );
}

interface TemplateEditorProps {
  template: Template;
  onChange: (t: Template) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function TemplateEditor({ template, onChange, onDelete, onClose }: TemplateEditorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function updateTeil(index: number, teil: Programmteil) {
    onChange({ ...template, programmteile: template.programmteile.map((t, i) => (i === index ? teil : t)) });
  }
  function removeTeil(index: number) {
    onChange({ ...template, programmteile: template.programmteile.filter((_, i) => i !== index) });
  }
  function moveTeil(index: number, delta: -1 | 1) {
    const next = [...template.programmteile];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...template, programmteile: next });
  }
  function addTeil() {
    const teil = neuerProgrammteil();
    onChange({ ...template, programmteile: [...template.programmteile, teil] });
    setExpandedId(teil.id);
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="app-header-action" onClick={onClose}>
          ← Fertig
        </button>
      </div>

      <label className="set-name-field">
        Name der Vorlage
        <input value={template.name} onChange={(e) => onChange({ ...template, name: e.target.value })} />
      </label>

      <label>
        Kurzbeschreibung (für die Generator-Übersicht)
        <textarea rows={2} value={template.beschreibung ?? ''} onChange={(e) => onChange({ ...template, beschreibung: e.target.value })} />
      </label>

      <span className="screen-header-meta">{template.programmteile.length} Programmteile</span>

      <div className="template-teile-list">
        {template.programmteile.map((teil, i) => (
          <ProgrammteilEditor
            key={teil.id}
            teil={teil}
            index={i}
            count={template.programmteile.length}
            expanded={expandedId === teil.id}
            onToggleExpand={() => setExpandedId((id) => (id === teil.id ? null : teil.id))}
            onChange={(t) => updateTeil(i, t)}
            onRemove={() => removeTeil(i)}
            onMove={(delta) => moveTeil(i, delta)}
          />
        ))}
      </div>

      <button className="btn-secondary" onClick={addTeil}>
        + Programmteil hinzufügen
      </button>

      <div className="set-builder-actions">
        {confirmDelete ? (
          <>
            <span>Vorlage wirklich löschen?</span>
            <button className="btn-danger" onClick={onDelete}>
              Ja, löschen
            </button>
            <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>
              Abbrechen
            </button>
          </>
        ) : (
          <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
            Vorlage löschen
          </button>
        )}
      </div>
    </div>
  );
}

export function neueVorlage(): Template {
  return { id: newId('vorlage'), name: 'Neue Vorlage', programmteile: [] };
}
