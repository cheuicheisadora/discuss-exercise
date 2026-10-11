import './DetailRow.css';

/** Label / value row inside the preview panel. Rendered inside a <dl>. */
export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <dt className="detail-row__label t-body">{label}</dt>
      <dd className="detail-row__value t-button">{value}</dd>
    </div>
  );
}
