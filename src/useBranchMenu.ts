import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { canHover, tokenMs, usePresence } from './motion';

export type MenuAnchor = 'nav' | 'title';
type Mode = 'hover' | 'pinned';
interface MenuState {
  anchor: MenuAnchor;
  /** hover = opened by hover intent (focus stays where it was); pinned = opened by click/keyboard, or focus moved inside */
  mode: Mode;
  /** Non-zero when the input should receive focus (click / keyboard open). */
  focusToken: number;
}

export const TOPBAR_MENU_TRIGGER = 'branches-trigger';
export const TITLE_MENU_TRIGGER = 'branch-title-trigger';
const triggerId = (a: MenuAnchor) => (a === 'title' ? TITLE_MENU_TRIGGER : TOPBAR_MENU_TRIGGER);

/**
 * Branch menu open/close logic:
 * - click / Enter / Space / ArrowDown open it with focus in the filter (unchanged behaviour)
 * - mouse hover opens it after --hover-open-delay without moving focus; it closes --hover-close-delay
 *   after the pointer leaves both trigger and menu (WCAG 1.4.13: hoverable, persistent, dismissible with Esc)
 * - touch never hover-opens
 */
export function useBranchMenu() {
  const [state, setState] = useState<MenuState | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();
  const focusCounter = useRef(0);
  const presence = usePresence(state?.anchor ?? null, '--duration-fast');

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };

  const close = useCallback((returnFocus: boolean) => {
    clearTimers();
    const s = stateRef.current;
    setState(null);
    if (returnFocus && s) document.getElementById(triggerId(s.anchor))?.focus();
  }, []);

  /** focusFilter = false for touch taps: don't pop up the phone keyboard over the list. */
  const openPinned = (anchor: MenuAnchor, focusFilter = true) => {
    clearTimers();
    focusCounter.current += 1;
    setState({ anchor, mode: 'pinned', focusToken: focusFilter ? focusCounter.current : 0 });
  };

  /** Focus entered the menu (e.g. the user clicked into the filter): it no longer closes on pointer leave. */
  const pin = useCallback(() => {
    setState((s) => (s && s.mode === 'hover' ? { ...s, mode: 'pinned' } : s));
  }, []);

  const triggerProps = (anchor: MenuAnchor) => ({
    expanded: state?.anchor === anchor,
    onClick: (e?: MouseEvent) => {
      const touch = (e?.nativeEvent as globalThis.PointerEvent | undefined)?.pointerType === 'touch';
      const s = stateRef.current;
      if (s && s.anchor === anchor) {
        // A click on a hover-opened menu keeps it open and moves focus in; a second click closes it.
        if (s.mode === 'hover') openPinned(anchor, !touch);
        else close(false);
      } else {
        openPinned(anchor, !touch);
      }
    },
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        openPinned(anchor);
      }
    },
  });

  /** Spread on the element wrapping both the trigger and the menu (the menu carries an invisible hover bridge). */
  const hoverProps = (anchor: MenuAnchor) => ({
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !canHover()) return;
      window.clearTimeout(closeTimer.current);
      const s = stateRef.current;
      if (s && (s.anchor === anchor || s.mode === 'pinned')) return;
      window.clearTimeout(openTimer.current);
      openTimer.current = window.setTimeout(() => {
        setState((cur) => (cur && (cur.anchor === anchor || cur.mode === 'pinned') ? cur : { anchor, mode: 'hover', focusToken: 0 }));
      }, tokenMs('--hover-open-delay'));
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      window.clearTimeout(openTimer.current);
      const s = stateRef.current;
      if (!s || s.anchor !== anchor || s.mode !== 'hover') return;
      window.clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => {
        const cur = stateRef.current;
        const root = document.querySelector('.branch-menu');
        if (cur?.mode === 'hover' && !root?.contains(document.activeElement)) setState(null);
      }, tokenMs('--hover-close-delay'));
    },
  });

  // Esc dismisses a hover-opened menu without moving the pointer or the focus.
  useEffect(() => {
    if (state?.mode !== 'hover') return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      close(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [state?.mode, close]);

  useEffect(() => clearTimers, []);

  return {
    open: state,
    rendered: presence.item,
    exiting: presence.exiting,
    close,
    pin,
    triggerProps,
    hoverProps,
  };
}
