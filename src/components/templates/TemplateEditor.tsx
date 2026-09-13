import { useState } from 'react';
import type { Bewegungsmuster, Equipment, Kategorie, Programmteil, Template } from '../../types';
import { ALLE_EQUIPMENT, BEWEGUNGSMUSTER_LABEL, EQUIPMENT_LABEL, KATEGORIE_LABEL } from '../../types';
import { newId } from '../../lib/id';
import { CheckboxGroup } from '../common/CheckboxGroup';

const KATEGORIEN = Object.keys(KATEGORIE_LABEL) as Kategorie[];
const BEWEGUNGSMUSTER = Object.keys(BEWEGUNGSMUSTER_LABEL) as Bewegungsmuster[];
const AUSWAEHLBARES_EQUIPMENT = ALLE_EQUIPMENT.filter((e) => e !== 'keins');

function neuerProgrammteil(): Programmteil {
  return { id: newId('teil'), name: 'Neuer Teil', dauer_min: 5, auswahlregel: {} };
}

interface ProgrammteilEditorProps {
  teil: Programmteil;
  index: number;
  count: number;
  onChange: (t: Programmteil) => void;
  onRemove: () => void;
  onMove: (delta: -1 | 1) => void;
}

function ProgrammteilEditor({ teil, index, count, onChange, onRemove, onMove }: ProgrammteilEditorProps) {
  return (
    <div className="programmteil-editor">
      <div className="programmteil-header">
        <input className="programmteil-name" value={teil.name} onChange={(e) => onChange({ ...teil, name: e.target.value })} />
        <div className="set-exercise-actions">
          <button className="btn-icon" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Nach oben">
            ↑
          </button>
          <button className="btn-icon" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Nach unten">
            ↓
          </button>
          <button className="btn-icon btn-icon-danger" onClick={onRemove} aria-label="Teil entfernen">
            🗑
          </button>
        </div>
      </div>

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

      <label className="checkbox-label">
        <input type="checkbox" checked={teil.optional ?? false} onChange={(e) => onChange({ ...teil, optional: e.target.checked })} />
        Optional (z. B. Abschluss)
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={teil.istKraftteil ?? false}
          onChange={(e) =>
            onChange({
              ...teil,
              istKraftteil: e.target.checked,
              satzanzahl: e.target.checked ? (teil.satzanzahl ?? 3) : undefined,
              satzdauer_s: e.target.checked ? (teil.satzdauer_s ?? 40) : undefined,
              erholung_pro_seite_s: e.target.checked ? (teil.erholung_pro_seite_s ?? 120) : undefined
            })
          }
        />
        Kraftteil (fester Kraftsatz statt freier Übungsauswahl)
      </label>

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
    onChange({ ...template, programmteile: [...template.programmteile, neuerProgrammteil()] });
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <label className="set-name-field">
          Name der Vorlage
          <input value={template.name} onChange={(e) => onChange({ ...template, name: e.target.value })} />
        </label>
      </div>

      <div className="template-teile-list">
        {template.programmteile.map((teil, i) => (
          <ProgrammteilEditor
            key={teil.id}
            teil={teil}
            index={i}
            count={template.programmteile.length}
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
        <button className="btn-secondary" onClick={onClose}>
          Fertig
        </button>
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
