import { useEffect, useRef, useState } from 'react';

/** Reads a time token from tokens.css (e.g. "--duration-fast" → 120). Respects the reduced-motion overrides. */
export function tokenMs(name: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  return raw.endsWith('ms') ? n : n * 1000;
}

/**
 * Keeps the last non-null value mounted for an exit animation.
 * `exiting` is true while the element animates out; then `item` becomes null.
 */
export function usePresence<T>(value: T | null, exitToken = '--duration-fast') {
  const [item, setItem] = useState<T | null>(value);
  const [exiting, setExiting] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (value !== null) {
      setItem(value);
      setExiting(false);
    } else if (item !== null) {
      setExiting(true);
      timer.current = window.setTimeout(() => {
        setItem(null);
        setExiting(false);
      }, tokenMs(exitToken));
    }
    return () => window.clearTimeout(timer.current);
  }, [value]);

  return { item: value ?? item, exiting: value === null && exiting };
}

/** True when the device has a real hover-capable pointer (mouse / trackpad). */
export function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
