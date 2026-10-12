import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { IconChevronDown } from '../icons';
import { usePresence } from '../motion';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Visible prefix, e.g. "Type". The button reads "Type: All". */
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

/**
 * Filter select styled like the Branch menu (same surface, shadow, items and motion).
 * Pattern: button (aria-haspopup="listbox") + listbox with aria-activedescendant.
 * Keys: Enter / Space / ↑ / ↓ open; ↑ ↓ Home End and first letter move; Enter / Space choose;
 * Esc closes and returns focus to the button; Tab closes. Click outside closes.
 */
export function Select({ label, value, options, onChange }: SelectProps) {
  const uid = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const [active, setActive] = useState(selectedIndex);
  const [keyboard, setKeyboard] = useState(false);
  const { item: rendered, exiting } = usePresence(open ? true : null, '--duration-fast');
  const current = options[selectedIndex]?.label ?? '';
  const optionId = (i: number) => `${uid}-opt-${i}`;

  const openMenu = (index = selectedIndex) => {
    setActive(index);
    setOpen(true);
  };
  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };
  const choose = (i: number) => {
    const o = options[i];
    if (o && o.value !== value) onChange(o.value);
    close(true);
  };

  // Focus moves into the list when it opens.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  // Inert while animating out.
  useEffect(() => {
    if (exiting) listRef.current?.setAttribute('inert', '');
    else listRef.current?.removeAttribute('inert');
  }, [exiting]);

  // Click outside closes.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Keep the active option visible.
  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setKeyboard(true);
      openMenu(selectedIndex);
    }
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1;
    const move = (i: number) => {
      e.preventDefault();
      setKeyboard(true);
      setActive(Math.min(last, Math.max(0, i)));
    };
    switch (e.key) {
      case 'ArrowDown': return move(active + 1);
      case 'ArrowUp': return move(active - 1);
      case 'Home': return move(0);
      case 'End': return move(last);
      case 'Enter':
      case ' ':
        e.preventDefault();
        return choose(active);
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        return close(true);
      case 'Tab':
        return close(false);
      default:
        // type-ahead: jump to the next option starting with that letter
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const k = e.key.toLowerCase();
          const order = [...options.keys()].map((n) => (active + 1 + n) % options.length);
          const hit = order.find((i) => options[i].label.toLowerCase().startsWith(k));
          if (hit !== undefined) move(hit);
        }
    }
  };

  return (
    <div className="select-field" ref={wrapRef}>
      <button tabIndex={0}
        ref={buttonRef}
        type="button"
        className="select"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${uid}-list` : undefined}
        onClick={(e) => {
          if (open) return close(false);
          setKeyboard(e.detail === 0); // Enter / Space fire a click with detail 0: show the keyboard focus ring
          openMenu();
        }}
        onKeyDown={onButtonKey}
      >
        <span className="select__text t-button">
          {label}: {current}
        </span>
        <IconChevronDown className="select__chevron" />
      </button>
      {rendered && (
        <ul
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          aria-label={label}
          aria-activedescendant={optionId(active)}
          aria-hidden={exiting || undefined}
          tabIndex={-1}
          className={`select-menu ${keyboard ? 'select-menu--keyboard' : ''} ${exiting ? 'select-menu--exiting' : ''}`}
          onKeyDown={onListKey}
          onBlur={(e) => {
            if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
          }}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={optionId(i)}
              role="option"
              aria-selected={o.value === value}
              className={`select-menu__option t-button ${i === active ? 'select-menu__option--active' : ''}`}
              onMouseMove={() => {
                setKeyboard(false);
                setActive(i);
              }}
              onClick={() => choose(i)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
