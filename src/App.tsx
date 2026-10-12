import { useCallback, useEffect, useRef, useState } from 'react';
import { BranchMenu } from './components/BranchMenu';
import { Toast } from './components/Toast';
import { TopBar } from './components/TopBar';
import { navigate, pageKey, useRoute } from './router';
import { getBranch, getEvent, isPast, type Scope } from './selectors';
import { BranchView } from './views/BranchView';
import { TITLE_MENU_TRIGGER, TOPBAR_MENU_TRIGGER, useBranchMenu, type MenuAnchor } from './useBranchMenu';
import { ClassicList } from './views/ClassicList';
import { MyEvents } from './views/MyEvents';
import { MyPastEvents } from './views/MyPastEvents';
import { SearchResults } from './views/SearchResults';
import { EmptyState, rowId } from './views/shared';

export function App() {
  const route = useRoute();
  const menu = useBranchMenu();
  const closeMenu = menu.close;
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
      closeMenu(false);
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
    closeMenu(false);
    document.getElementById('main')?.scrollTo(0, 0);
    requestAnimationFrame(() => {
      const ev = route.name === 'branch' ? route.event : null;
      const row = ev ? document.getElementById(rowId(ev)) : null;
      if (row) {
        // An event is selected from the URL: the details panel takes focus (see SplitView); keep its row in view.
        row.scrollIntoView({ block: 'nearest' });
      } else {
        document.getElementById('page-title')?.focus();
      }
    });
  }, [key]);

  /* ---------- Branch menu ---------- */
  const currentScope: Scope | null = route.name === 'branch' ? (route.slug as Scope) : null;
  const selectBranch = (scope: Scope) => {
    closeMenu(false);
    if (scope === currentScope) {
      document.getElementById('page-title')?.focus();
      return;
    }
    navigate({ name: 'branch', slug: scope, tab: 'upcoming', event: null });
  };
  const menuEl = (anchor: MenuAnchor) =>
    menu.rendered === anchor ? (
      <BranchMenu
        anchor={anchor}
        exiting={menu.exiting}
        focusToken={menu.open?.anchor === anchor ? menu.open.focusToken : 0}
        onPin={menu.pin}
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
  let title = 'My events';
  switch (route.name) {
    case 'my-events':
      section = 'my-events';
      view = <MyEvents notify={notify} />;
      break;
    case 'my-past':
      section = 'my-events';
      title = 'My past events';
      view = <MyPastEvents announce={announce} notify={notify} />;
      break;
    case 'branch': {
      section = 'branches';
      const valid = route.slug === 'all' || !!getBranch(route.slug);
      if (!valid) {
        title = 'Branch not found';
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
      title = `${route.slug === 'all' ? 'All branches' : getBranch(route.slug)?.name} · ${tab === 'past' ? 'Past' : 'Upcoming'}`;
      view = (
        <BranchView
          key={route.slug}
          scope={route.slug as Scope}
          tab={tab}
          eventId={ev && (route.slug === 'all' || ev.branch === route.slug) ? ev.id : null}
          menuTrigger={menu.triggerProps('title')}
          menuHover={menu.hoverProps('title')}
          menu={menuEl('title')}
          announce={announce}
          notify={notify}
        />
      );
      break;
    }
    case 'search':
      title = route.q.trim() ? `Search: ${route.q.trim()}` : 'Search';
      view = <SearchResults key={route.q} q={route.q} notify={notify} />;
      break;
    case 'classic':
      section = 'classic';
      title = 'Classic list';
      view = <ClassicList announce={announce} notify={notify} />;
      break;
  }

  /* A page title per screen, so screen reader users know where they are. */
  useEffect(() => {
    document.title = `${title} · Library Events`;
  }, [title]);

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
        menuTrigger={menu.triggerProps('nav')}
        menuHover={menu.hoverProps('nav')}
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
