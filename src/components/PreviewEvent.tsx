import { forwardRef } from 'react';
import { IconClose } from '../icons';
import { Button } from './Button';
import { DetailRow } from './DetailRow';
import { Divider } from './Divider';
import { SectionLabel } from './SectionLabel';
import './Preview.css';

export interface PreviewEventProps {
  id: string;
  title: string;
  subtitle: string;
  details: { label: string; value: string }[];
  notes?: string;
  /** Upcoming = one button; past = "Reuse this event" (primary) + "Open full event". */
  showSecondary: boolean;
  onClose: () => void;
  onPrimary: () => void;
  onSecondary?: () => void;
}

export const PreviewEvent = forwardRef<HTMLElement, PreviewEventProps>(function PreviewEvent(p, ref) {
  const headingId = `${p.id}-title`;
  return (
    <aside ref={ref} id={p.id} className="preview preview--event" aria-labelledby={headingId} tabIndex={-1}>
      <div className="preview__header">
        <div className="preview__heading">
          <h2 id={headingId} className="t-heading preview__title">
            {p.title}
          </h2>
          <p className="t-body preview__subtitle">{p.subtitle}</p>
        </div>
        <button type="button" className="preview__close" aria-label="Close preview" onClick={p.onClose}>
          <IconClose />
        </button>
      </div>
      <Divider />
      <dl className="preview__details">
        {p.details.map((d) => (
          <DetailRow key={d.label} label={d.label} value={d.value} />
        ))}
      </dl>
      {p.notes && (
        <div className="preview__notes">
          <SectionLabel label="Notes" as="h3" />
          <p className="t-body preview__notes-text">{p.notes}</p>
        </div>
      )}
      <div className="preview__spacer" />
      <div className="preview__actions">
        {p.showSecondary ? (
          <>
            <Button style="primary" size="large" fullWidth label="Reuse this event" onClick={p.onPrimary} />
            <Button style="neutral" size="large" fullWidth label="Open full event" onClick={p.onSecondary} />
          </>
        ) : (
          <Button style="primary" size="large" fullWidth label="Open full event" onClick={p.onPrimary} />
        )}
      </div>
    </aside>
  );
});
