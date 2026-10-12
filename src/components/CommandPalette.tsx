import { forwardRef, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { BRANCHES, EVENTS, type LibraryEvent } from '../data';
import { navigate } from '../router';
import { branchName, branchSummary, byDateAsc, byDateDesc, isPast, longDate, matchesText } from '../selectors';
import { BranchItem } from './BranchItem';
import { SearchField } from './SearchField';
import { SectionLabel } from './SectionLabel';
import './CommandPalette.css';

/**
 * "Go to…" palette (Ctrl+K / ⌘K), like GitHub, Linear and Slack:
 * type to jump to any page, branch or event without tabbing through the page.
 */
interface Item {
  key: string;
  group: 'Pages' | 'Branches' | 'Events';
  name: string;
  summary: string;
  hash: string;
}

const PAGES: Item[] = [
  { key: 'p-my', group: 'Pages', name: 'My events', summary: 'Upcoming events you coordinate', hash: '#/my-events' },
  { key: 'p-past', group: 'Pages', name: 'My past events', summary: 'Your completed events', hash: '#/my-events/past' },
  { key: 'p-all', group: 'Pages', name: 'All branches', summary: branchSummary('all').text, hash: '#/branch/all?tab=upcoming' },
  { key: 'p-classic', group: 'Pages', name: 'Classic list', summary: 'Every event in one table', hash: '#/classic' },
];
const BRANCH_ITEMS: Item[] = BRANCHES.map((b) => ({
  key: `b-${b.slug}`,
  group: 'Branches',
  name: b.name,
  summary: branchSummary(b.slug).text,
  hash: `#/branch/${b.slug}?tab=upcoming`,
}));
const eventItem = (e: LibraryEvent): Item => ({
  key: `e-${e.id}`,
  group: 'Events',
  name: e.title,
  summary: `${isPast(e) ? 'Past · ' : ''}${branchName(e.branch)} · ${e.date ? longDate(e.date) : 'No date yet'}`,
  hash: `#/branch/${e.branch}?tab=${isPast(e) ? 'past' : 'upcoming'}&event=${e.id}`,
});
const MAX_EVENTS = 8;

export const CommandPalette = forwardRef<HTMLDialogElement, { onClose: () => void; announce: (m: string) => void }>(
  function CommandPalette({ onClose, announce }, ref) {
    const uid = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const [keyboard, setKeyboard] = useState(true);

    const q = query.trim().toLowerCase();
    const items = useMemo(() => {
      const hit = (i: Item) => !q || i.name.toLowerCase().includes(q);
      const hits = q ? EVENTS.filter((e) => matchesText(e, q, true)) : [];
      // upcoming first (soonest first), then past (most recent first), as in search results
      const events = [...hits.filter((e) => !isPast(e)).sort(byDateAsc), ...hits.filter(isPast).sort(byDateDesc)]
        .slice(0, MAX_EVENTS)
        .map(eventItem);
      return [...PAGES.filter(hit), ...BRANCH_ITEMS.filter(hit), ...events];
    }, [q]);

    useEffect(() => {
      document.getElementById(`${uid}-${active}`)?.scrollIntoView({ block: 'nearest' });
    }, [active, uid]);

    function reset() {
      setQuery('');
      setActive(0);
      setKeyboard(true);
    }

    function go(i: Item) {
      navigate(i.hash);
      (ref as React.RefObject<HTMLDialogElement>).current?.close();
    }

    function onQuery(v: string) {
      setQuery(v);
      setActive(0);
      const t = v.trim().toLowerCase();
      if (!t) return announce('');
      const n =
        PAGES.filter((i) => i.name.toLowerCase().includes(t)).length +
        BRANCH_ITEMS.filter((i) => i.name.toLowerCase().includes(t)).length +
        Math.min(MAX_EVENTS, EVENTS.filter((e) => matchesText(e, t, true)).length);
      announce(n === 0 ? `Nothing matches "${v.trim()}"` : `${n} ${n === 1 ? 'result' : 'results'}`);
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      const last = items.length - 1;
      const move = (i: number) => {
        e.preventDefault();
        setKeyboard(true);
        if (items.length) setActive(i);
      };
      if (e.key === 'ArrowDown') move(active >= last ? 0 : active + 1);
      else if (e.key === 'ArrowUp') move(active <= 0 ? last : active - 1);
      else if (e.key === 'Home' && e.ctrlKey) move(0);
      else if (e.key === 'End' && e.ctrlKey) move(last);
      else if (e.key === 'PageDown') move(Math.min(last, active + 5));
      else if (e.key === 'PageUp') move(Math.max(0, active - 5));
      else if (e.key === 'Escape') {
        // close at once (a search field would otherwise clear its text first)
        e.preventDefault();
        (ref as React.RefObject<HTMLDialogElement>).current?.close();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = items[active];
        if (it) go(it);
      }
    }

    const groups = (['Pages', 'Branches', 'Events'] as const)
      .map((g) => ({ g, list: items.filter((i) => i.group === g) }))
      .filter((x) => x.list.length);

    return (
      <dialog
        ref={ref}
        className={`palette ${keyboard ? 'palette--keyboard' : ''}`}
        aria-labelledby={`${uid}-title`}
        onClose={() => {
          reset();
          onClose();
        }}
      >
        <h2 id={`${uid}-title`} className="sr-only">
          Go to
        </h2>
        <SearchField
          ref={inputRef}
          variant="menu"
          placeholder="Go to a page, branch or event…"
          label="Go to a page, branch or event"
          role="combobox"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-autocomplete="list"
          aria-activedescendant={items.length ? `${uid}-${active}` : undefined}
          aria-describedby={`${uid}-hint`}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div role="listbox" id={`${uid}-list`} aria-label="Go to" className="palette__list">
          {groups.map(({ g, list }) => (
            <div key={g} role="group" aria-label={g} className="palette__group">
              <div className="palette__group-label" aria-hidden="true">
                <SectionLabel label={g} as="span" />
              </div>
              {list.map((it) => {
                const i = items.indexOf(it);
                return (
                  <BranchItem
                    key={it.key}
                    id={`${uid}-${i}`}
                    name={it.name}
                    summary={it.summary}
                    state={i === active ? 'hover' : 'default'}
                    onSelect={() => go(it)}
                    onHover={() => {
                      setKeyboard(false);
                      setActive(i);
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {items.length === 0 && <p className="palette__empty t-body">Nothing matches "{query.trim()}".</p>}
        <p id={`${uid}-hint`} className="palette__hint t-label">
          <kbd className="kbd">↑</kbd>
          <kbd className="kbd">↓</kbd> to move, <kbd className="kbd">Enter</kbd> to go, <kbd className="kbd">Esc</kbd> to close
        </p>
      </dialog>
    );
  },
);
