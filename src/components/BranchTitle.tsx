import { forwardRef } from 'react';
import { IconChevronDown } from '../icons';
import './BranchTitle.css';

export interface BranchTitleProps {
  branchName: string;
  expanded: boolean;
  onClick: () => void;
  id?: string;
}

/** Shows the current branch AND opens the Branch menu. Rendered inside the page <h1>. */
export const BranchTitle = forwardRef<HTMLButtonElement, BranchTitleProps>(function BranchTitle(
  { branchName, expanded, onClick, id },
  ref,
) {
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      className="branch-title"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-label={`Switch branch, current: ${branchName}`}
      onClick={onClick}
    >
      <span className="branch-title__name t-display">{branchName}</span>
      <IconChevronDown size={24} className="branch-title__chevron" />
    </button>
  );
});
