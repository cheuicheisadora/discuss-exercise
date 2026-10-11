import { forwardRef, type KeyboardEvent } from 'react';
import './Tab.css';

export interface TabProps {
  label: string;
  count: number;
  state: 'selected' | 'default';
  id: string;
  controls: string;
  onSelect: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab({ label, count, state, id, controls, onSelect, onKeyDown }, ref) {
  const selected = state === 'selected';
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={selected ? 0 : -1}
      className={`tab tab--${state}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <span className="tab__content">
        <span className="t-button">{label}</span>
        <span className="tab__count t-label">{count}</span>
      </span>
      <span className="tab__indicator" aria-hidden="true" />
    </button>
  );
});
