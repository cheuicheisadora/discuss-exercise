import type { DateTileProps } from './DateTile';
import { DateTile } from './DateTile';
import { Button } from './Button';
import { StatusBadge, type StatusBadgeProps } from './StatusBadge';
import { Tag } from './Tag';
import './EventRow.css';

export interface EventRowProps {
  /** DOM id of the row's main control (used to return focus). */
  id: string;
  title: string;
  details: string;
  date: DateTileProps;
  status: Pick<StatusBadgeProps, 'tone' | 'label' | 'showIcon'>;
  tag?: string;
  actionLabel?: string;
  /** Figma properties */
  attention: boolean;
  selected: boolean;
  showTag: boolean;
  showAction: boolean;
  /** Either a link (navigates) or a button that opens the preview. */
  href?: string;
  onSelect?: () => void;
  previewId?: string;
  onAction?: () => void;
}

/**
 * The whole row is ONE control (link or button) that covers the full card.
 * The action button is a sibling positioned on top of it, so there are no nested interactive elements.
 */
export function EventRow(p: EventRowProps) {
  const cls = [
    'event-row__main',
    p.attention ? 'event-row__main--attention' : '',
    p.selected ? 'event-row__main--selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <DateTile {...p.date} />
      <span className="event-row__info">
        <span className="event-row__title t-heading">{p.title}</span>
        <span className="event-row__meta">
          {p.showTag && p.tag && <Tag label={p.tag} />}
          <span className="event-row__details t-body">{p.details}</span>
        </span>
        <span className="sr-only">, {p.status.label}</span>
      </span>
    </>
  );

  return (
    <div className="event-row">
      {p.href ? (
        <a id={p.id} className={cls} href={p.href}>
          {content}
        </a>
      ) : (
        <button
          id={p.id}
          type="button"
          className={cls}
          onClick={p.onSelect}
          aria-expanded={p.selected}
          aria-controls={p.selected ? p.previewId : undefined}
        >
          {content}
        </button>
      )}
      <div className="event-row__status">
        <StatusBadge {...p.status} decorative />
        {p.showAction && p.actionLabel && (
          <Button style="outline" size="medium" label={p.actionLabel} ariaLabel={`${p.actionLabel}: ${p.title}`} onClick={p.onAction} />
        )}
      </div>
    </div>
  );
}
