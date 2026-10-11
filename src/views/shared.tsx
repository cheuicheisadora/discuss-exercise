import { useEffect, useRef, type ReactNode } from 'react';
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
  href?: string;
  onSelect?: () => void;
  notify: Notify;
}

export function Row({ event: e, showTag, selected = false, href, onSelect, notify }: RowOptions & { event: LibraryEvent }) {
  const s = statusOf(e);
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
      href={href}
      onSelect={onSelect}
      previewId={PREVIEW_ID}
      onAction={s.action ? () => notify(actionMessage(s.action as string, e)) : undefined}
    />
  );
}

export function RowList({ events, ...opts }: { events: LibraryEvent[]; selectedId?: string | null; onSelectId?: (id: string) => void; hrefFor?: (e: LibraryEvent) => string } & Omit<RowOptions, 'selected' | 'href' | 'onSelect'>) {
  return (
    <ul className="list">
      {events.map((e) => (
        <li key={e.id}>
          <Row
            event={e}
            showTag={opts.showTag}
            notify={opts.notify}
            selected={opts.selectedId === e.id}
            href={opts.hrefFor?.(e)}
            onSelect={opts.onSelectId ? () => opts.onSelectId?.(e.id) : undefined}
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
    ...(e.registrations ? [{ label: 'Registrations', value: e.registrations }] : []),
    ...(e.ageGroup ? [{ label: 'Age group', value: e.ageGroup }] : []),
    { label: 'Coordinator', value: e.coordinator },
  ];
}

const isOverlay = () => window.matchMedia('(max-width: 1099px)').matches;

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

  // In overlay mode (below 1100px) move focus into the panel when it opens.
  useEffect(() => {
    if (selected && selected.id !== lastSelected.current && isOverlay()) previewRef.current?.focus();
    lastSelected.current = selected?.id ?? lastSelected.current;
  }, [selected]);

  return (
    <div className="content-row">
      <div className="list-column">{list}</div>
      {selected ? (
        <PreviewEvent
          ref={previewRef}
          key={selected.id}
          id={PREVIEW_ID}
          title={selected.title}
          subtitle={previewSubtitle(selected)}
          details={previewDetails(selected)}
          notes={selected.notes}
          showSecondary={isPast(selected)}
          onClose={close}
          onPrimary={() => notify(actionMessage(isPast(selected) ? 'Reuse this event' : 'Open full event', selected))}
          onSecondary={() => notify(actionMessage('Open full event', selected))}
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
      {groups.map((g) => (
        <section className="group" key={g.key} aria-labelledby={`group-${g.key}`}>
          <SectionLabel label={g.label} as="h2" id={`group-${g.key}`} />
          <RowList events={g.events} {...opts} />
        </section>
      ))}
    </>
  );
}
