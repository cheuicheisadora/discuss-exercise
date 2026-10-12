import type { KeyboardEvent } from 'react';

/**
 * List navigation for keyboard users (like Gmail / Linear):
 * ↑ / ↓ move to the previous / next item, Home / End to the first / last.
 * Items are all elements matching `selector` inside the main content, in DOM order (across groups).
 */
export function moveInList(e: KeyboardEvent<HTMLElement>, selector: string) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const scope = (e.currentTarget.closest('main') ?? document) as ParentNode;
  const items = Array.from(scope.querySelectorAll<HTMLElement>(selector)).filter((el) => el.offsetParent !== null);
  const i = items.indexOf(e.currentTarget);
  if (i === -1 || !items.length) return;
  const next =
    e.key === 'ArrowDown' ? Math.min(i + 1, items.length - 1)
    : e.key === 'ArrowUp' ? Math.max(i - 1, 0)
    : e.key === 'Home' ? 0
    : items.length - 1;
  e.preventDefault();
  items[next].focus();
  items[next].scrollIntoView({ block: 'nearest' });
}
