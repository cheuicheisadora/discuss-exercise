import { IconAlert } from '../icons';
import './StatusBadge.css';

export interface StatusBadgeProps {
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  showIcon?: boolean;
  label: string;
  /** Hide from assistive tech when the same text is already announced elsewhere (e.g. inside a row button). */
  decorative?: boolean;
}

export function StatusBadge({ tone, showIcon = false, label, decorative }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${tone}`} aria-hidden={decorative || undefined}>
      {showIcon && <IconAlert className="status-badge__icon" />}
      {label}
    </span>
  );
}
