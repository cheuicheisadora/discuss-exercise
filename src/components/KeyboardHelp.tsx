import { forwardRef } from 'react';
import { IconClose } from '../icons';
import './KeyboardHelp.css';

const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** keys = alternatives ("or"); combo = pressed together ("+"). */
const SHORTCUTS: { keys: string[]; label: string; combo?: boolean }[] = [
  { keys: [MAC ? '⌘' : 'Ctrl', 'K'], combo: true, label: 'Go to any page, branch or event' },
  { keys: ['/'], label: 'Search all events' },
  { keys: ['Tab', 'Shift + Tab'], label: 'Next / previous button, link or field' },
  { keys: ['↑', '↓'], label: 'Move between events in a list' },
  { keys: ['Home', 'End'], label: 'First / last event in a list' },
  { keys: ['Enter'], label: 'Open the event (details or message)' },
  { keys: ['Esc'], label: 'Close details, menus, messages or this list' },
  { keys: ['←', '→'], label: 'Switch tabs (Upcoming / Past, Coordinated by me / All)' },
  { keys: ['↓'], label: 'On "Branches" or the branch title: open the branch menu' },
  { keys: ['?'], label: 'Show these shortcuts' },
];

/** Keyboard shortcuts list. A native <dialog> opened with showModal(): focus is trapped, Esc closes, the page behind is inert. */
export const KeyboardHelp = forwardRef<HTMLDialogElement, { onClose: () => void; onGoTo: () => void }>(function KeyboardHelp({ onClose, onGoTo }, ref) {
  return (
    <dialog ref={ref} className="kbd-help" aria-labelledby="kbd-help-title" onClose={onClose}>
      <div className="kbd-help__header">
        <h2 id="kbd-help-title" className="t-heading">Keyboard shortcuts</h2>
        <form method="dialog">
          <button tabIndex={0} type="submit" className="kbd-help__close" aria-label="Close keyboard shortcuts" aria-keyshortcuts="Escape">
            <IconClose />
          </button>
        </form>
      </div>
      <dl className="kbd-help__list">
        {SHORTCUTS.map((s) => (
          <div key={s.label} className="kbd-help__row">
            <dt className="kbd-help__keys">
              {s.keys.map((k, i) => (
                <span key={k}>
                  {i > 0 && (s.combo ? <span className="kbd-help__plus" aria-hidden="true">+</span> : <span className="sr-only"> or </span>)}
                  <kbd className="kbd t-label">{k}</kbd>
                </span>
              ))}
            </dt>
            <dd className="kbd-help__label t-body">{s.label}</dd>
          </div>
        ))}
      </dl>
      <div className="kbd-help__footer">
        <button tabIndex={0} type="button" className="text-link kbd-help__goto" onClick={onGoTo}>
          Open "Go to…"
        </button>
        {MAC && (
          <p className="kbd-help__tip t-label">
            Safari: if Tab skips buttons and links, press Option + Tab, or turn on "Press Tab to highlight each item" in Safari Settings → Advanced.
          </p>
        )}
      </div>
    </dialog>
  );
});
