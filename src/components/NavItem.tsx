import { forwardRef, type KeyboardEvent, type MouseEvent } from 'react';
import { IconChevronDown } from '../icons';
import './NavItem.css';

export interface NavItemProps {
  label: string;
  /** true = current section (blue + 3px indicator) */
  state: boolean;
  showChevron?: boolean;
  /** Link target. Without href the item is a button (used by "Branches ▾"). */
  href?: string;
  onClick?: (e: MouseEvent) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  expanded?: boolean;
  id?: string;
}

export const NavItem = forwardRef<HTMLButtonElement, NavItemProps>(function NavItem(
  { label, state, showChevron = false, href, onClick, onKeyDown, expanded, id },
  ref,
) {
  const cls = `nav-item ${state ? 'nav-item--active' : ''}`;
  const inner = (
    <>
      <span className="nav-item__content">
        <span className="t-button">{label}</span>
        {showChevron && <IconChevronDown className="nav-item__chevron" />}
      </span>
      <span className="nav-item__indicator" aria-hidden="true" />
    </>
  );
  if (href) {
    return (
      <a tabIndex={0} className={cls} href={href} aria-current={state ? 'page' : undefined} id={id}>
        {inner}
      </a>
    );
  }
  return (
    <button tabIndex={0}
      ref={ref}
      type="button"
      id={id}
      className={cls}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-haspopup="dialog"
      aria-expanded={expanded ?? false}
      aria-current={state ? 'page' : undefined}
    >
      {inner}
    </button>
  );
});
