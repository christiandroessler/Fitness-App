interface CheckboxGroupProps<T extends string> {
  legend: string;
  options: readonly T[];
  labels: Record<T, string>;
  selected: T[];
  onChange: (next: T[]) => void;
}

export function CheckboxGroup<T extends string>({ legend, options, labels, selected, onChange }: CheckboxGroupProps<T>) {
  function toggle(value: T) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }
  return (
    <div>
      <span className="meta-label">{legend}</span>
      <div className="chip-row" style={{ marginTop: 6 }}>
        {options.map((opt) => (
          <button key={opt} type="button" className={`chip ${selected.includes(opt) ? 'active' : ''}`} onClick={() => toggle(opt)}>
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}
