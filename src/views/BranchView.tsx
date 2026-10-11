import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { TITLE_MENU_TRIGGER } from '../useBranchMenu';
import { tokenMs } from '../motion';
import { EVENT_TYPES, type LibraryEvent } from '../data';
import { BranchTitle } from '../components/BranchTitle';
import { SearchField } from '../components/SearchField';
import { Select } from '../components/Select';
import { Tab } from '../components/Tab';
import { navigate, type From, type Tab as TabName } from '../router';
import { IconArrowRight } from '../icons';
import {
  DEFAULT_FILTERS,
  applyFilters,
  getBranch,
  getEvent,
  groupUpcoming,
  matchesText,
  pastIn,
  plural,
  upcomingIn,
  yearsOf,
  type Filters,
  type Scope,
} from '../selectors';
import { EmptyState, GroupedList, RowList, SplitView, noMatchText, type Notify } from './shared';


interface Props {
  scope: Scope;
  tab: TabName;
  eventId: string | null;
  /** Set when the user jumped here from My events / My past events: shows a back link. */
  from?: From | null;
  menuTrigger: { expanded: boolean; onClick: () => void; onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void };
  menuHover: { onPointerEnter: (e: PointerEvent) => void; onPointerLeave: (e: PointerEvent) => void };
  menu?: ReactNode;
  announce: (msg: string) => void;
  notify: Notify;
}

export function BranchView({ scope, tab, eventId, from = null, menuTrigger, menuHover, menu, announce, notify }: Props) {
  const isAll = scope === 'all';
  const name = isAll ? 'All branches' : getBranch(scope)?.name ?? '';
  const upcoming = useMemo(() => upcomingIn(scope), [scope]);
  const past = useMemo(() => pastIn(scope), [scope]);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<TabName, Filters>>({ upcoming: DEFAULT_FILTERS, past: DEFAULT_FILTERS });
  const f = filters[tab];
  const setFilter = (patch: Partial<Filters>) => setFilters((all) => ({ ...all, [tab]: { ...all[tab], ...patch } }));

  const base = tab === 'upcoming' ? upcoming : past;
  const visible = applyFilters(base, f).filter((e) => matchesText(e, query, isAll));
  const selected = getEvent(eventId);

  const go = (t: TabName, ev: string | null, replace = true) =>
    navigate({ name: 'branch', slug: scope, tab: t, event: ev, from }, { replace });

  /* ---------- Search across tabs ---------- */
  const otherTab: TabName = tab === 'upcoming' ? 'past' : 'upcoming';
  const q = query.trim();
  const otherMatches = q
    ? applyFilters(otherTab === 'upcoming' ? upcoming : past, filters[otherTab]).filter((e) => matchesText(e, query, isAll)).length
    : 0;
  const otherMatchText = `${otherMatches} ${otherTab} ${plural(otherMatches, 'event matches', 'events match')}`;
  /** Switch to the other tab and keep the search term. */
  const showOtherResults = () => {
    go(otherTab, null);
    requestAnimationFrame(() => tabRefs[otherTab].current?.focus());
  };

  /* ---------- Tabs ---------- */
  const tabRefs = { upcoming: useRef<HTMLButtonElement>(null), past: useRef<HTMLButtonElement>(null) };
  const switchTab = (t: TabName, focus = false) => {
    if (t !== tab) {
      setQuery('');
      go(t, null); // switching tabs clears the selection
    }
    if (focus) tabRefs[t].current?.focus();
  };
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const order: TabName[] = ['upcoming', 'past'];
    const i = order.indexOf(tab);
    let next: TabName | null = null;
    if (e.key === 'ArrowRight') next = order[(i + 1) % order.length];
    if (e.key === 'ArrowLeft') next = order[(i - 1 + order.length) % order.length];
    if (e.key === 'Home') next = order[0];
    if (e.key === 'End') next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      switchTab(next, true);
    }
  };

  /* ---------- Sliding tab indicator ----------
     At rest each tab shows its own bar (pixel-identical to the approved design). When the tab
     changes, a shared bar slides from the old tab to the new one with `transform` only (FLIP),
     then hands back to the tab's own bar. Skipped under reduced motion. */
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const prevTab = useRef<TabName>(tab);
  useLayoutEffect(() => {
    const el = tabRefs[tab].current;
    const ind = indicatorRef.current;
    const list = ind?.parentElement;
    if (!el || !ind || !list) return;
    const from = tabRefs[prevTab.current].current;
    const changed = prevTab.current !== tab;
    prevTab.current = tab;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!changed || !from || reduce) return;
    const x = el.offsetLeft;
    const w = el.offsetWidth;
    const prev = { x: from.offsetLeft, w: from.offsetWidth };

    ind.style.width = `${w}px`;
    ind.classList.remove('tabs__indicator--animated');
    ind.style.transform = `translateX(${prev.x}px) scaleX(${prev.w / w})`;
    list.classList.add('tabs--sliding');
    ind.getBoundingClientRect(); // commit the start position
    ind.classList.add('tabs__indicator--animated');
    ind.style.transform = `translateX(${x}px)`;

    const done = () => list.classList.remove('tabs--sliding');
    const timer = window.setTimeout(done, tokenMs('--duration-base') + 50);
    ind.addEventListener('transitionend', done, { once: true });
    return () => {
      window.clearTimeout(timer);
      ind.removeEventListener('transitionend', done);
      done();
    };
  }, [tab]);

  /* ---------- Announce result counts / empty states on change ---------- */
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    announce(resultText());
  }, [query, f.type, f.status, f.year, tab]);

  function resultText() {
    if (base.length === 0 && tab === 'upcoming') return `No upcoming events at ${name}`;
    if (visible.length === 0 && q && otherMatches > 0) return `No ${tab} events match "${q}". ${otherMatchText}.`;
    if (visible.length === 0) return query.trim() ? noMatchText(query.trim()) : 'No events match these filters.';
    const kind = tab === 'upcoming' ? 'upcoming' : 'past';
    return `${visible.length} ${kind} ${plural(visible.length, 'event', 'events')}`;
  }

  /* ---------- List ---------- */
  let list: ReactNode;
  const rowOpts = { showTag: isAll, selectedId: eventId, onSelectId: (id: string) => go(tab, id), notify };
  if (tab === 'upcoming' && upcoming.length === 0) {
    list = (
      <EmptyState title={`No upcoming events at ${name}`}>
        <a className="text-link" href={`#/branch/${scope}?tab=past`}>
          See past events
        </a>
      </EmptyState>
    );
  } else if (visible.length === 0 && q && otherMatches > 0) {
    list = (
      <EmptyState title={`No ${tab} events match "${q}".`}>
        <p className="empty-state__text t-body">{otherMatchText}.</p>
        <a
          className="text-link"
          href={`#/branch/${scope}?tab=${otherTab}`}
          onClick={(e) => {
            e.preventDefault();
            showOtherResults();
          }}
        >
          Show {otherTab} results
          <IconArrowRight />
        </a>
      </EmptyState>
    );
  } else if (visible.length === 0) {
    list = query.trim() ? (
      <EmptyState title={noMatchText(query.trim())} />
    ) : (
      <EmptyState title="No events match these filters." text="Change the filters above to see more events." />
    );
  } else if (tab === 'upcoming') {
    list = <GroupedList groups={groupUpcoming(visible)} {...rowOpts} />;
  } else {
    list = (
      <section aria-label="Past events">
        <RowList events={visible} {...rowOpts} />
      </section>
    );
  }

  const searchPlaceholder = tab === 'past' ? 'Search past events' : isAll ? 'Search all branches' : `Search ${name}`;

  return (
    <div className="page page--split">
      {from && (
        <a className="text-link back-link" href={from === 'my-past' ? '#/my-events/past' : '#/my-events'}>
          <span aria-hidden="true">←</span>
          <span>
            <span className="sr-only">Back to </span>
            {from === 'my-past' ? 'My past events' : 'My events'}
          </span>
        </a>
      )}
      <div className="branch-header">
        <h1 className="page-title" id="page-title" tabIndex={-1}>
          <span className="menu-anchor" {...menuHover}>
            <BranchTitle
              id={TITLE_MENU_TRIGGER}
              branchName={name}
              expanded={menuTrigger.expanded}
              onClick={menuTrigger.onClick}
              onKeyDown={menuTrigger.onKeyDown}
            />
            {menu}
          </span>
        </h1>
        <SearchField
          variant="page"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="tabs" role="tablist" aria-label={`${name} events`}>
        <Tab
          ref={tabRefs.upcoming}
          id="tab-upcoming"
          controls="panel-upcoming"
          label="Upcoming"
          count={upcoming.length}
          state={tab === 'upcoming' ? 'selected' : 'default'}
          onSelect={() => switchTab('upcoming')}
          onKeyDown={onTabKey}
        />
        <Tab
          ref={tabRefs.past}
          id="tab-past"
          controls="panel-past"
          label="Past"
          count={past.length}
          state={tab === 'past' ? 'selected' : 'default'}
          onSelect={() => switchTab('past')}
          onKeyDown={onTabKey}
        />
        <span ref={indicatorRef} className="tabs__indicator" aria-hidden="true" />
      </div>

      <div key={tab} className="tabpanel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        <Filters tab={tab} filters={f} past={past} onChange={setFilter} />
        <SplitView list={list} selected={selected} onSelect={(id) => go(tab, id)} notify={notify} />
      </div>
    </div>
  );
}

export function Filters({
  tab,
  filters,
  past,
  onChange,
}: {
  tab: TabName;
  filters: Filters;
  past: LibraryEvent[];
  onChange: (patch: Partial<Filters>) => void;
}) {
  const typeOptions = [{ value: 'all', label: 'All' }, ...EVENT_TYPES];
  const years = yearsOf(past);
  const yearOptions = [
    { value: 'all', label: years.length > 1 ? `${years[years.length - 1]}–${years[0]}` : String(years[0] ?? 'All') },
    ...(years.length > 1 ? years.map((y) => ({ value: String(y), label: String(y) })) : []),
  ];
  return (
    <div className="filters">
      <div className="filters__group">
        {tab === 'upcoming' ? (
          <>
            <Select label="Type" value={filters.type} options={typeOptions} onChange={(v) => onChange({ type: v as Filters['type'] })} />
            <Select
              label="Status"
              value={filters.status}
              options={[
                { value: 'all', label: 'All' },
                { value: 'attention', label: 'Needs attention' },
                { value: 'confirmed', label: 'Confirmed' },
              ]}
              onChange={(v) => onChange({ status: v as Filters['status'] })}
            />
          </>
        ) : (
          <>
            <Select label="Year" value={filters.year} options={yearOptions} onChange={(v) => onChange({ year: v })} />
            <Select label="Type" value={filters.type} options={typeOptions} onChange={(v) => onChange({ type: v as Filters['type'] })} />
          </>
        )}
      </div>
      <p className="filters__sort t-label">Sorted by date</p>
    </div>
  );
}
