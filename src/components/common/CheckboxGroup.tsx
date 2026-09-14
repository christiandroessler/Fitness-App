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
    <fieldset className="checkbox-group">
      <legend>{legend}</legend>
      <div className="checkbox-group-grid">
        {options.map((opt) => (
          <label key={opt} className="checkbox-label">
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
            {labels[opt]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
