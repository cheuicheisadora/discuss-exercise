import type { ReactNode } from 'react';
import './Button.css';

export interface ButtonProps {
  style?: 'primary' | 'outline' | 'neutral';
  size?: 'medium' | 'large';
  label: string;
  icon?: ReactNode;
  /** Renders a link instead of a button. */
  href?: string;
  onClick?: () => void;
  fullWidth?: boolean;
  /** Extra accessible context, e.g. "Book room for Author talk". */
  ariaLabel?: string;
  className?: string;
}

export function Button({ style = 'primary', size = 'medium', label, icon, href, onClick, fullWidth, ariaLabel, className }: ButtonProps) {
  const cls = ['btn', `btn--${style}`, `btn--${size}`, fullWidth ? 'btn--full' : '', className ?? ''].filter(Boolean).join(' ');
  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  );
  if (href) {
    return (
      <a className={cls} href={href} aria-label={ariaLabel} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={cls} aria-label={ariaLabel} onClick={onClick}>
      {content}
    </button>
  );
}
