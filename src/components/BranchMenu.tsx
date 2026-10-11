import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { BRANCHES, CURRENT_USER } from '../data';
import { branchSummary, type Scope } from '../selectors';
import { BranchItem } from './BranchItem';
import { Divider } from './Divider';
import { SearchField } from './SearchField';
import { SectionLabel } from './SectionLabel';
import './BranchMenu.css';

const FIRST_OTHERS = 5;

export interface BranchMenuProps {
  current: Scope | null;
  onSelect: (scope: Scope) => void;
  /** returnFocus = true when closed with Esc. */
  onClose: (returnFocus: boolean) => void;
  /** Element(s) that toggle the menu; clicks on them are not "outside". */
  triggerId: string;
  announce: (msg: string) => void;
}

interface Option {
  scope: Scope;
  name: string;
  group: 'all' | 'yours' | 'others';
}

export function BranchMenu({ current, onSelect, onClose, triggerId, announce }: BranchMenuProps) {
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [keyboard, setKeyboard] = useState(false);

  const others = BRANCHES.filter((b) => !CURRENT_USER.branches.includes(b.slug));
  const yours = BRANCHES.filter((b) => CURRENT_USER.branches.includes(b.slug));
  const q = query.trim().toLowerCase();
  const match = (name: string) => !q || name.toLowerCase().includes(q);

  const options: Option[] = useMemo(() => {
    const list: Option[] = [];
    if (match('All branches')) list.push({ scope: 'all', name: 'All branches', group: 'all' });
    yours.filter((b) => match(b.name)).forEach((b) => list.push({ scope: b.slug, name: b.name, group: 'yours' }));
    const otherMatches = others.filter((b) => match(b.name));
    const shown = q || expanded ? otherMatches : otherMatches.slice(0, FIRST_OTHERS);
    shown.forEach((b) => list.push({ scope: b.slug, name: b.name, group: 'others' }));
    return list;
  }, [q, expanded]);

  const hiddenCount = q || expanded ? 0 : Math.max(0, others.length - FIRST_OTHERS);

  const initialActive = Math.max(0, options.findIndex((o) => o.scope === current));
  const [active, setActive] = useState(initialActive);

  // Focus moves into the menu when it opens.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the active option in view.
  useEffect(() => {
    const el = document.getElementById(optionId(active));
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  // Click outside closes.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (document.getElementById(triggerId)?.contains(t)) return;
      onClose(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose, triggerId]);

  function optionId(i: number) {
    return `${uid}-opt-${i}`;
  }

  function onQuery(value: string) {
    setQuery(value);
    setActive(0);
    const v = value.trim().toLowerCase();
    const count = BRANCHES.filter((b) => b.name.toLowerCase().includes(v)).length + ('all branches'.includes(v) ? 1 : 0);
    announce(v ? (count === 0 ? `No branches match "${value.trim()}"` : `${count} ${count === 1 ? 'result' : 'results'}`) : '');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setKeyboard(true);
      if (options.length === 0) return;
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + delta + options.length) % options.length);
    } else if (e.key === 'Home' || e.key === 'End') {
      if (!options.length) return;
      e.preventDefault();
      setKeyboard(true);
      setActive(e.key === 'Home' ? 0 : options.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const o = options[active];
      if (o) onSelect(o.scope);
    }
  }

  function onRootKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose(true);
    }
  }

  function showMore() {
    const firstNew = options.length;
    setExpanded(true);
    setActive(firstNew);
    setKeyboard(true);
    inputRef.current?.focus();
    announce(`${hiddenCount} more branches shown`);
  }

  const renderOption = (o: Option) => {
    const i = options.indexOf(o);
    const s = branchSummary(o.scope);
    return (
      <BranchItem
        key={o.scope}
        id={optionId(i)}
        name={o.name}
        summary={s.text}
        state={i === active ? 'hover' : 'default'}
        current={o.scope === current}
        onSelect={() => onSelect(o.scope)}
        onHover={() => {
          setKeyboard(false);
          setActive(i);
        }}
      />
    );
  };

  const all = options.filter((o) => o.group === 'all');
  const yourOpts = options.filter((o) => o.group === 'yours');
  const otherOpts = options.filter((o) => o.group === 'others');
  const listboxId = `${uid}-listbox`;

  return (
    <div
      ref={rootRef}
      className={`branch-menu ${keyboard ? 'branch-menu--keyboard' : ''}`}
      role="dialog"
      aria-label="Choose a branch"
      onKeyDown={onRootKeyDown}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (next && !rootRef.current?.contains(next) && !document.getElementById(triggerId)?.contains(next)) onClose(false);
      }}
    >
      <SearchField
        ref={inputRef}
        variant="menu"
        placeholder="Find a branch"
        role="combobox"
        aria-expanded="true"
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={options.length ? optionId(active) : undefined}
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div role="listbox" id={listboxId} aria-label="Branches" className="branch-menu__list">
        {all.map(renderOption)}
        {yourOpts.length > 0 && (
          <>
            {all.length > 0 && <Divider />}
            <div role="group" aria-label="Your branches" className="branch-menu__group">
              <div className="branch-menu__group-label" aria-hidden="true">
                <SectionLabel label="Your branches" as="span" />
              </div>
              {yourOpts.map(renderOption)}
            </div>
          </>
        )}
        {otherOpts.length > 0 && (
          <>
            {(all.length > 0 || yourOpts.length > 0) && <Divider />}
            <div role="group" aria-label="All branches" className="branch-menu__group">
              <div className="branch-menu__group-label" aria-hidden="true">
                <SectionLabel label="All branches" as="span" />
              </div>
              {otherOpts.map(renderOption)}
            </div>
          </>
        )}
      </div>
      {options.length === 0 && <p className="branch-menu__empty t-body">No branches match "{query.trim()}".</p>}
      {hiddenCount > 0 && (
        <button type="button" className="branch-menu__more t-button" onClick={showMore}>
          Show {hiddenCount} more branches
        </button>
      )}
    </div>
  );
}

