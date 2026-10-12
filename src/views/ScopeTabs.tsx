import { useRef, type KeyboardEvent } from 'react';
import { Tab } from '../components/Tab';
import type { MyScope } from '../selectors';

/** "Coordinated by me" / "All" scope tabs (My events and My past events), like Linear's "My issues" tabs. */
export const SCOPES: { value: MyScope; label: string }[] = [
  { value: 'mine', label: 'Coordinated by me' },
  { value: 'branches', label: 'All' }, // all events at your branches (the subtitle above names them)
];

export function ScopeTabs({
  scope,
  counts,
  onSelect,
  idPrefix,
}: {
  scope: MyScope;
  counts: Record<MyScope, number>;
  onSelect: (s: MyScope) => void;
  idPrefix: string;
}) {
  const refs = useRef<Record<MyScope, HTMLButtonElement | null>>({ mine: null, branches: null });
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = SCOPES.findIndex((x) => x.value === scope);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (i + 1) % SCOPES.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + SCOPES.length) % SCOPES.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = SCOPES.length - 1;
    if (next !== null) {
      e.preventDefault();
      onSelect(SCOPES[next].value);
      refs.current[SCOPES[next].value]?.focus();
    }
  };
  return (
    <div className="tabs" role="tablist" aria-label="Which events">
      {SCOPES.map((s) => (
        <Tab
          key={s.value}
          ref={(el) => {
            refs.current[s.value] = el;
          }}
          id={`${idPrefix}-tab-${s.value}`}
          controls={`${idPrefix}-panel-${s.value}`}
          label={s.label}
          count={counts[s.value]}
          state={scope === s.value ? 'selected' : 'default'}
          onSelect={() => onSelect(s.value)}
          onKeyDown={onKey}
        />
      ))}
    </div>
  );
}
