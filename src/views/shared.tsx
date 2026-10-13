import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { usePresence } from '../motion';
import type { LibraryEvent } from '../data';
import { EventRow } from '../components/EventRow';
import { PreviewEmpty } from '../components/PreviewEmpty';
import { PreviewEvent } from '../components/PreviewEvent';
import { SectionLabel } from '../components/SectionLabel';
import {
  branchName,
  dayOfMonth,
  detailsLine,
  isPast,
  monthShort,
  needsAttention,
  previewSubtitle,
  nextStepOf,
  statusOf,
} from '../selectors';

export const PREVIEW_ID = 'event-preview';
export const rowId = (eventId: string) => `row-${eventId}`;

/* ---------------- Out-of-scope actions ---------------- */

export type Notify = (msg: string) => void;

export function actionMessage(action: string, e?: LibraryEvent) {
  const t = e?.title ?? '';
  switch (action) {
    case 'New event':
      return 'In the full product, this opens a form to create a new event.';
    case 'Book room':
      return `In the full product, this opens room booking for ${t}.`;
    case 'Schedule':
      return `In the full product, this opens the scheduler to pick a date for ${t}.`;
    case 'Promote':
      return `In the full product, this opens promotion tools (newsletter, social posts, flyers) for ${t}.`;
    case 'Manage waitlist':
      return `In the full product, this opens the waitlist for ${t}.`;
    case 'Reuse this event':
      return `In the full product, this opens a new event prefilled with ${t}.`;
    case 'Open full event':
    default:
      return `In the full product, this opens the full event page for ${t}.`;
  }
}

/* ---------------- Rows ---------------- */

interface RowOptions {
  showTag: boolean;
  selected?: boolean;
  /** true on branch pages: the row opens the details panel (aria-expanded / aria-controls). */
  opensPreview?: boolean;
  onSelect?: () => void;
  notify: Notify;
  /** My events "Next steps": rows without a blocker also get their next step as the action button (Promote, Manage waitlist). */
  nextStepAction?: boolean;
}

export function Row({ event: e, showTag, selected = false, opensPreview = false, onSelect, notify, nextStepAction = false }: RowOptions & { event: LibraryEvent }) {
  const st = statusOf(e);
  const s = { ...st, action: st.action ?? (nextStepAction ? nextStepOf(e)?.label : undefined) };
  return (
    <EventRow
      id={rowId(e.id)}
      title={e.title}
      details={detailsLine(e)}
      date={e.date ? { state: 'default', month: monthShort(e.date), day: dayOfMonth(e.date) } : { state: 'empty', month: e.targetMonth ?? '' }}
      status={{ tone: s.tone, label: s.label, showIcon: s.showIcon }}
      tag={branchName(e.branch)}
      actionLabel={s.action}
      attention={needsAttention(e)}
      selected={selected}
      showTag={showTag}
      showAction={!!s.action}
      onSelect={onSelect}
      previewId={opensPreview ? PREVIEW_ID : undefined}
      onAction={s.action ? () => notify(actionMessage(s.action as string, e)) : undefined}
    />
  );
}

/** Ids rendered in the previous commit; only rows that were not there before animate in. */
function useEnteringIds(ids: string[]) {
  const sig = ids.join('|');
  const prev = useRef<Set<string> | null>(null);
  const entering = useMemo(() => ids.filter((id) => !prev.current || !prev.current.has(id)), [sig]);
  useEffect(() => {
    prev.current = new Set(ids);
  }, [sig]);
  return entering;
}

export function RowList({ events, staggerOffset = 0, ...opts }: { events: LibraryEvent[]; staggerOffset?: number; selectedId?: string | null; onSelectId?: (id: string) => void; onOpen?: (e: LibraryEvent) => void } & Omit<RowOptions, 'selected' | 'href' | 'onSelect' | 'opensPreview'>) {
  const entering = useEnteringIds(events.map((e) => e.id));
  return (
    <ul className="list">
      {events.map((e) => (
        <li
          key={e.id}
          className={entering.includes(e.id) ? 'is-entering' : undefined}
          style={entering.includes(e.id) ? ({ '--i': staggerOffset + entering.indexOf(e.id) } as CSSProperties) : undefined}
        >
          <Row
            event={e}
            showTag={opts.showTag}
            notify={opts.notify}
            nextStepAction={opts.nextStepAction}
            selected={opts.selectedId === e.id}
            opensPreview={!!opts.onSelectId}
            onSelect={opts.onSelectId ? () => opts.onSelectId?.(e.id) : opts.onOpen ? () => opts.onOpen?.(e) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Empty state ---------------- */

export function EmptyState({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title t-heading">{title}</p>
      {text && <p className="empty-state__text t-body">{text}</p>}
      {children}
    </div>
  );
}

export function noMatchText(q: string) {
  return `No events match "${q}". Try another word or check the spelling.`;
}

/* ---------------- Preview ---------------- */

function previewDetails(e: LibraryEvent) {
  if (isPast(e)) {
    return [
      { label: 'Attended', value: `${e.attended ?? 0} people` },
      ...(e.capacity ? [{ label: 'Capacity', value: e.capacity }] : []),
      ...(e.registrations ? [{ label: 'Registrations', value: e.registrations }] : []),
      { label: 'Coordinator', value: e.coordinator },
    ];
  }
  return [
    { label: 'Status', value: statusOf(e).label },
    ...(nextStepOf(e) ? [{ label: 'Next step', value: nextStepOf(e)!.detail }] : []),
    ...(e.registrations ? [{ label: 'Registrations', value: e.registrations }] : []),
    ...(e.ageGroup ? [{ label: 'Age group', value: e.ageGroup }] : []),
    { label: 'Coordinator', value: e.coordinator },
  ];
}


/**
 * List + preview panel. Owns Esc-to-close and focus return.
 * `onSelect(null)` closes the preview.
 */
export function SplitView({
  list,
  selected,
  onSelect,
  notify,
}: {
  list: ReactNode;
  selected: LibraryEvent | undefined;
  onSelect: (id: string | null) => void;
  notify: Notify;
}) {
  const previewRef = useRef<HTMLElement>(null);
  // Keep the last event mounted while the panel animates out.
  const { item: shown, exiting } = usePresence(selected ?? null, '--duration-fast');
  const lastSelected = useRef<string | null>(null);

  const close = () => {
    const id = selected?.id ?? lastSelected.current;
    onSelect(null);
    // Return focus to the row that opened the preview (the list keeps its scroll position).
    requestAnimationFrame(() => {
      const row = id ? document.getElementById(rowId(id)) : null;
      row?.focus();
    });
  };

  // Esc closes the preview.
  useEffect(() => {
    if (!selected) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape' || ev.defaultPrevented) return;
      const t = ev.target as HTMLElement;
      if (t.tagName === 'SELECT') return;
      if (t.tagName === 'INPUT' && (t as HTMLInputElement).value) return; // let Esc clear a search first
      ev.preventDefault();
      close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // When an event is selected (row click, Enter/Space, or arriving with ?event= in the URL),
  // move focus to the panel heading so keyboard and screen reader users land on the details.
  const focusedFor = useRef<string | null>(null);
  useEffect(() => {
    if (selected && selected.id !== focusedFor.current) {
      (document.getElementById(`${PREVIEW_ID}-title`) ?? previewRef.current)?.focus();
    }
    focusedFor.current = selected?.id ?? null;
    lastSelected.current = selected?.id ?? lastSelected.current;
  }, [selected]);

  // Phones: the panel is a full-screen sheet, so the page behind it is made inert while it is open
  // (focus can't wander onto hidden content). Live regions stay active.
  useEffect(() => {
    if (!selected || exiting || !window.matchMedia('(max-width: 699px)').matches) return;
    const made: Element[] = [];
    let node: Element | null = previewRef.current;
    while (node && node.parentElement && !node.classList.contains('app')) {
      for (const sib of Array.from(node.parentElement.children)) {
        if (sib === node || sib.hasAttribute('inert') || sib.matches('[aria-live], [role="status"], .skip-link')) continue;
        sib.setAttribute('inert', '');
        made.push(sib);
      }
      node = node.parentElement;
    }
    return () => made.forEach((el) => el.removeAttribute('inert'));
  }, [selected?.id, exiting]);

  return (
    <div className="content-row">
      <div className="list-column">{list}</div>
      {shown ? (
        <PreviewEvent
          ref={previewRef}
          id={PREVIEW_ID}
          contentKey={shown.id}
          exiting={exiting}
          title={shown.title}
          subtitle={previewSubtitle(shown)}
          details={previewDetails(shown)}
          notes={shown.notes}
          showSecondary={isPast(shown)}
          onClose={close}
          onPrimary={() => notify(actionMessage(isPast(shown) ? 'Reuse this event' : 'Open full event', shown))}
          onSecondary={() => notify(actionMessage('Open full event', shown))}
        />
      ) : (
        <PreviewEmpty />
      )}
    </div>
  );
}

export function GroupedList({
  groups,
  ...opts
}: {
  groups: { key: string; label: string; events: LibraryEvent[] }[];
  showTag: boolean;
  selectedId: string | null;
  onSelectId: (id: string) => void;
  notify: Notify;
}) {
  return (
    <>
      {groups.map((g, gi) => (
        <section className="group" key={g.key} aria-labelledby={`group-${g.key}`}>
          <SectionLabel label={g.label} as="h2" id={`group-${g.key}`} />
          <RowList events={g.events} staggerOffset={groups.slice(0, gi).reduce((n, x) => n + x.events.length, 0)} {...opts} />
        </section>
      ))}
    </>
  );
}
