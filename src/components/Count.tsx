import './Count.css';

/** Count pill used next to the "Needs attention" section label. */
export function Count({ count, ariaLabel }: { count: number; ariaLabel?: string }) {
  return (
    <span className="count t-overline" aria-label={ariaLabel}>
      {count}
    </span>
  );
}
