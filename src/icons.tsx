/* Icons copied from the Figma icon components (same paths and stroke widths). They inherit color via currentColor. */

type IconProps = { className?: string };

const base = { fill: 'none', 'aria-hidden': true, focusable: false } as const;

export function IconSearch({ className }: IconProps) {
  return (
    <svg {...base} className={className} width="20" height="20" viewBox="0 0 20 20">
      <path d="M9.16667 15C12.3883 15 15 12.3883 15 9.16667C15 5.94501 12.3883 3.33333 9.16667 3.33333C5.94501 3.33333 3.33333 5.94501 3.33333 9.16667C3.33333 12.3883 5.94501 15 9.16667 15Z" stroke="currentColor" strokeWidth="1.66667" />
      <path d="M16.6667 16.6667L13.75 13.75" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" />
    </svg>
  );
}

export function IconList({ className }: IconProps) {
  return (
    <svg {...base} className={className} width="20" height="20" viewBox="0 0 20 20">
      <path d="M6.66667 5H16.6667M6.66667 10H16.6667M6.66667 15H16.6667M3.33333 5H3.34167M3.33333 10H3.34167M3.33333 15H3.34167" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" />
    </svg>
  );
}

/** 16px chevron (nav item, select). Pass size 24 for the Branch title chevron. */
export function IconChevronDown({ className, size = 16 }: IconProps & { size?: 16 | 24 }) {
  if (size === 24) {
    return (
      <svg {...base} className={className} width="24" height="24" viewBox="0 0 24 24">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...base} className={className} width="16" height="16" viewBox="0 0 16 16">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className} width="20" height="20" viewBox="0 0 20 20">
      <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="2.08333" strokeLinecap="round" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg {...base} className={className} width="20" height="20" viewBox="0 0 20 20">
      <path d="M4.16667 10H15.8333M10.8333 15L15.8333 10L10.8333 5" stroke="currentColor" strokeWidth="2.08333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconAlert({ className }: IconProps) {
  return (
    <svg {...base} className={className} width="16" height="16" viewBox="0 0 16 16">
      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.33333" />
      <path d="M8 5V8.33333M8 11H8.00667" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base} className={className} width="20" height="20" viewBox="0 0 20 20">
      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2.08333" strokeLinecap="round" />
    </svg>
  );
}
