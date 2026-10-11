import './BranchItem.css';

export interface BranchItemProps {
  id: string;
  name: string;
  summary: string;
  /** Hover state = keyboard focus state (active descendant). */
  state: 'default' | 'hover';
  current?: boolean;
  onSelect: () => void;
  onHover: () => void;
}

export function BranchItem({ id, name, summary, state, current, onSelect, onHover }: BranchItemProps) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={current ?? false}
      className={`branch-item branch-item--${state}`}
      onClick={onSelect}
      onMouseMove={onHover}
    >
      <span className="branch-item__name t-button">{name}</span>
      <span className="branch-item__summary t-label">{summary}</span>
    </div>
  );
}
