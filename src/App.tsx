import { useCallback, useEffect, useRef, useState } from 'react';
import { BranchMenu } from './components/BranchMenu';
import { Toast } from './components/Toast';
import { TopBar, TOPBAR_MENU_TRIGGER } from './components/TopBar';
import { navigate, pageKey, useRoute } from './router';
import { getBranch, getEvent, isPast, type Scope } from './selectors';
import { BranchView, TITLE_MENU_TRIGGER } from './views/BranchView';
import { ClassicList } from './views/ClassicList';
import { MyEvents } from './views/MyEvents';
import { MyPastEvents } from './views/MyPastEvents';
import { SearchResults } from './views/SearchResults';
import { EmptyState, rowId } from './views/shared';

type MenuAnchor = 'nav' | 'title' | null;

export function App() {
  const route = useRoute();
  const [menu, setMenu] = useState<MenuAnchor>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [liveMsg, setLiveMsg] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  /* ---------- Announcements (aria-live="polite") ---------- */
  const announce = useCallback((msg: string) => {
    setLiveMsg('');
    if (msg) window.setTimeout(() => setLiveMsg(msg), 50);
  }, []);

  /* ---------- Toast for out-of-scope actions ---------- */
  const toastTimer = useRef<number>();
  const notify = useCallback((msg: string) => {
    setToast(null);
    window.clearTimeout(toastTimer.current);
    window.setTimeout(() => setToast(msg), 30);
    toastTimer.current = window.setTimeout(() => setToast(null), 6000);
  }, []);

  /* ---------- "/" focuses the global search ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      e.preventDefault();
      setMenu(null);
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ---------- Focus management on real page changes ---------- */
  const key = pageKey(route);
  const prevKey = useRef(key);
  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    setMenu(null);
    document.getElementById('main')?.scrollTo(0, 0);
    requestAnimationFrame(() => {
      const ev = route.name === 'branch' ? route.event : null;
      const row = ev ? document.getElementById(rowId(ev)) : null;
      if (row) {
        row.focus();
        row.scrollIntoView({ block: 'nearest' });
      } else {
        document.getElementById('page-title')?.focus();
      }
    });
  }, [key]);

  /* ---------- Branch menu ---------- */
  const currentScope: Scope | null = route.name === 'branch' ? (route.slug as Scope) : null;
  const closeMenu = useCallback(
    (returnFocus: boolean) => {
      const trigger = menu === 'title' ? TITLE_MENU_TRIGGER : TOPBAR_MENU_TRIGGER;
      setMenu(null);
      if (returnFocus) document.getElementById(trigger)?.focus();
    },
    [menu],
  );
  const selectBranch = (scope: Scope) => {
    setMenu(null);
    if (scope === currentScope) {
      document.getElementById('page-title')?.focus();
      return;
    }
    navigate({ name: 'branch', slug: scope, tab: 'upcoming', event: null });
  };
  const menuEl = (anchor: 'nav' | 'title') =>
    menu === anchor ? (
      <BranchMenu
        current={currentScope}
        onSelect={selectBranch}
        onClose={closeMenu}
        triggerId={anchor === 'title' ? TITLE_MENU_TRIGGER : TOPBAR_MENU_TRIGGER}
        announce={announce}
      />
    ) : null;

  /* ---------- Views ---------- */
  let view: JSX.Element;
  let section: 'my-events' | 'branches' | 'classic' | null = null;
  switch (route.name) {
    case 'my-events':
      section = 'my-events';
      view = <MyEvents notify={notify} />;
      break;
    case 'my-past':
      section = 'my-events';
      view = <MyPastEvents eventId={route.event} announce={announce} notify={notify} />;
      break;
    case 'branch': {
      section = 'branches';
      const valid = route.slug === 'all' || !!getBranch(route.slug);
      if (!valid) {
        view = (
          <div className="page">
            <h1 className="page-title t-display" id="page-title" tabIndex={-1}>
              Branch not found
            </h1>
            <EmptyState title="We could not find that branch.">
              <a className="text-link" href="#/my-events">
                Go to My events
              </a>
            </EmptyState>
          </div>
        );
        break;
      }
      // A deep link to a past event always opens the Past tab (and vice versa).
      const ev = getEvent(route.event);
      const tab = ev ? (isPast(ev) ? 'past' : 'upcoming') : route.tab;
      view = (
        <BranchView
          key={route.slug}
          scope={route.slug as Scope}
          tab={tab}
          eventId={ev && (route.slug === 'all' || ev.branch === route.slug) ? ev.id : null}
          menuOpen={menu === 'title'}
          onToggleMenu={() => setMenu((m) => (m === 'title' ? null : 'title'))}
          menu={menuEl('title')}
          announce={announce}
          notify={notify}
        />
      );
      break;
    }
    case 'search':
      view = <SearchResults key={route.q} q={route.q} notify={notify} />;
      break;
    case 'classic':
      section = 'classic';
      view = <ClassicList announce={announce} />;
      break;
  }

  /* Announce search result counts when a search runs. */
  useEffect(() => {
    if (route.name !== 'search') return;
    const el = document.querySelector('.page-subtitle');
    if (el) announce(el.textContent ?? '');
  }, [route.name === 'search' ? route.q : null]);

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={(e) => {
        e.preventDefault();
        document.getElementById('page-title')?.focus();
      }}>
        Skip to content
      </a>
      <TopBar
        ref={searchRef}
        section={section === 'classic' ? null : section}
        menuOpen={menu === 'nav'}
        onToggleMenu={() => setMenu((m) => (m === 'nav' ? null : 'nav'))}
        menu={menuEl('nav')}
        searchValue={route.name === 'search' ? route.q : ''}
        onSearch={(q) => navigate({ name: 'search', q })}
      />
      <main className="main" id="main">
        {view}
      </main>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMsg}
      </div>
      <Toast message={toast} />
    </div>
  );
}
