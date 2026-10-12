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

const ROWS = '.event-row__main, .classic__title';

/**
 * ↑ / ↓ when focus is not on an event yet (page heading, a filter button, nothing at all):
 * ↓ goes to the selected event (or the first one), ↑ to the selected event (or the last one).
 * From an action button ("Book room") the arrows move relative to its own row.
 * Fields, tabs, dropdowns, menus, dialogs and the details panel keep their own arrow keys.
 */
export function listArrowsFromAnywhere(e: globalThis.KeyboardEvent) {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const t = (e.target as HTMLElement) ?? document.body;
  if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
  if (t.closest('[role="tablist"], [role="listbox"], [role="dialog"], dialog, [inert], .preview--event')) return;
  const main = document.getElementById('main') ?? document.querySelector('main');
  if (!main) return;
  const items = Array.from(main.querySelectorAll<HTMLElement>(ROWS)).filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const down = e.key === 'ArrowDown';
  let next: HTMLElement | undefined;
  const ownRow = t.closest('.event-row, tr')?.querySelector<HTMLElement>(ROWS);
  if (ownRow && ownRow !== t && items.includes(ownRow)) {
    const i = items.indexOf(ownRow);
    next = items[down ? Math.min(i + 1, items.length - 1) : Math.max(i - 1, 0)];
  } else if (!items.includes(t)) {
    next = main.querySelector<HTMLElement>('.event-row__main--selected') ?? (down ? items[0] : items[items.length - 1]);
  }
  if (!next) return;
  e.preventDefault();
  next.focus();
  next.scrollIntoView({ block: 'nearest' });
}
