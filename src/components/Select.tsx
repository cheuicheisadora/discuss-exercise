import { useId } from 'react';
import { IconChevronDown } from '../icons';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Visible prefix, e.g. "Type". The button reads "Type: All". */
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

/** Native <select> styled as the Figma Select (light and fully accessible). */
export function Select({ label, value, options, onChange }: SelectProps) {
  const id = useId();
  const current = options.find((o) => o.value === value)?.label ?? '';
  return (
    <div className="select">
      <span className="select__text t-button" aria-hidden="true">
        {label}: {current}
      </span>
      <IconChevronDown className="select__chevron" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} className="select__native t-button" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
