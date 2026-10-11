import './Tag.css';

/** Tag always means branch. Only used where lists mix branches. */
export function Tag({ label }: { label: string }) {
  return <span className="tag">{label}</span>;
}
