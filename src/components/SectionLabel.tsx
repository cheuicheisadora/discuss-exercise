import { Count } from './Count';
import './SectionLabel.css';

export interface SectionLabelProps {
  label: string;
  showCount?: boolean;
  count?: number;
  /** Heading level when the label introduces a section. */
  as?: 'h2' | 'h3' | 'p' | 'span';
  id?: string;
}

export function SectionLabel({ label, showCount = false, count = 0, as: Tag = 'p', id }: SectionLabelProps) {
  return (
    <Tag className="section-label" id={id}>
      <span className="t-overline">{label}</span>
      {showCount && <Count count={count} />}
    </Tag>
  );
}
