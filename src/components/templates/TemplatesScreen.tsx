import { useState } from 'react';
import type { Template } from '../../types';
import { useAppDataApi, useAppDataState } from '../../lib/AppDataContext';
import { TemplateEditor, neueVorlage } from './TemplateEditor';

export function TemplatesScreen() {
  const { data } = useAppDataState();
  const api = useAppDataApi();
  const [editingId, setEditingId] = useState<string | null>(null);

  function saveTemplate(t: Template) {
    api.mutate((d) => ({ ...d, templates: d.templates.some((x) => x.id === t.id) ? d.templates.map((x) => (x.id === t.id ? t : x)) : [...d.templates, t] }));
  }
  function deleteTemplate(id: string) {
    api.mutate((d) => ({ ...d, templates: d.templates.filter((x) => x.id !== id) }));
    setEditingId(null);
  }
  function addTemplate() {
    const t = neueVorlage();
    api.mutate((d) => ({ ...d, templates: [...d.templates, t] }));
    setEditingId(t.id);
  }

  const editing = data.templates.find((t) => t.id === editingId);
  if (editing) {
    return <TemplateEditor template={editing} onChange={saveTemplate} onDelete={() => deleteTemplate(editing.id)} onClose={() => setEditingId(null)} />;
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Vorlagen</h2>
        <button className="btn-primary" onClick={addTemplate}>
          + Neue Vorlage
        </button>
      </div>
      <div className="library-list">
        {data.templates.map((t) => (
          <button key={t.id} className="library-item" onClick={() => setEditingId(t.id)}>
            <div className="library-item-info">
              <strong>{t.name}</strong>
              <span>{t.programmteile.length} Programmteile · {t.programmteile.reduce((s, p) => s + p.dauer_min, 0)} min geplant</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
