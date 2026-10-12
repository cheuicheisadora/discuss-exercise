import { forwardRef, Fragment, useEffect, useRef } from 'react';
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
  /** Changes when another event is shown: only the content crossfades, the panel stays. */
  contentKey: string;
  /** Animating out after close: inert and hidden from assistive tech. */
  exiting: boolean;
  onClose: () => void;
  onPrimary: () => void;
  onSecondary?: () => void;
}

export const PreviewEvent = forwardRef<HTMLElement, PreviewEventProps>(function PreviewEvent(p, ref) {
  const headingId = `${p.id}-title`;
  const localRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (p.exiting) localRef.current?.setAttribute('inert', '');
    else localRef.current?.removeAttribute('inert');
  }, [p.exiting]);
  return (
    <aside
      ref={(el) => {
        localRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      id={p.exiting ? undefined : p.id}
      className={`preview preview--event ${p.exiting ? 'preview--exiting' : ''}`}
      aria-labelledby={headingId}
      aria-hidden={p.exiting || undefined}
      tabIndex={-1}
    >
      <Fragment key={p.contentKey}>
      <div className="preview__header preview__item">
        <div className="preview__heading">
          <h2 id={headingId} className="t-heading preview__title" tabIndex={-1}>
            {p.title}
          </h2>
          <p className="t-body preview__subtitle">{p.subtitle}</p>
        </div>
        <button tabIndex={0} type="button" className="preview__close" aria-label="Close preview" aria-keyshortcuts="Escape" onClick={p.onClose}>
          <IconClose />
        </button>
      </div>
      <Divider />
      <dl className="preview__details preview__item">
        {p.details.map((d) => (
          <DetailRow key={d.label} label={d.label} value={d.value} />
        ))}
      </dl>
      {p.notes && (
        <div className="preview__notes preview__item">
          <SectionLabel label="Notes" as="h3" />
          <p className="t-body preview__notes-text">{p.notes}</p>
        </div>
      )}
      <div className="preview__spacer" />
      <div className="preview__actions preview__item">
        {p.showSecondary ? (
          <>
            <Button style="primary" size="large" fullWidth label="Reuse this event" onClick={p.onPrimary} />
            <Button style="neutral" size="large" fullWidth label="Open full event" onClick={p.onSecondary} />
          </>
        ) : (
          <Button style="primary" size="large" fullWidth label="Open full event" onClick={p.onPrimary} />
        )}
      </div>
      </Fragment>
    </aside>
  );
});
