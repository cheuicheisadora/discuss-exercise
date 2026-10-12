import { forwardRef, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { TOPBAR_MENU_TRIGGER } from '../useBranchMenu';
import { CURRENT_USER } from '../data';
import { IconClose, IconList, IconSearch } from '../icons';
import { Button } from './Button';
import { NavItem } from './NavItem';
import { Profile } from './Profile';
import { SearchField } from './SearchField';
import './TopBar.css';

export interface TopBarProps {
  section: 'my-events' | 'branches' | 'classic' | null;
  menuTrigger: { expanded: boolean; onClick: (e?: MouseEvent) => void; onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void };
  menuHover: { onPointerEnter: (e: PointerEvent) => void; onPointerLeave: (e: PointerEvent) => void };
  /** Branch menu, rendered under the "Branches" trigger when open from the top bar. */
  menu?: ReactNode;
  searchValue: string;
  onSearch: (q: string) => void;
}


export const TopBar = forwardRef<HTMLInputElement, TopBarProps>(function TopBar(
  { section, menuTrigger, menuHover, menu, searchValue, onSearch },
  searchRef,
) {
  const [q, setQ] = useState(searchValue);
  useEffect(() => setQ(searchValue), [searchValue]);

  // Phones: the global search sits behind a search button and opens as its own row.
  // (On wider screens the field is always visible and this state has no effect.)
  const [searchOpen, setSearchOpen] = useState(!!searchValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (searchValue) setSearchOpen(true);
  }, [searchValue]);
  // "/" opens the search row first (App dispatches this event before focusing the field).
  useEffect(() => {
    const open = () => setSearchOpen(true);
    window.addEventListener('app:open-search', open);
    return () => window.removeEventListener('app:open-search', open);
  }, []);
  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const closeSearch = () => {
    setSearchOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <p className="topbar__logo t-logo">
          <span className="topbar__logo-brand">Library</span> Events
        </p>
        <nav className="topbar__nav" aria-label="Main">
          <NavItem label="My events" state={section === 'my-events'} href="#/my-events" />
          <div className="menu-anchor" {...menuHover}>
            <NavItem
              id={TOPBAR_MENU_TRIGGER}
              label="Branches"
              showChevron
              state={section === 'branches'}
              expanded={menuTrigger.expanded}
              onClick={menuTrigger.onClick}
              onKeyDown={menuTrigger.onKeyDown}
            />
            {menu}
          </div>
        </nav>
      </div>
      <div className="topbar__right">
        <button tabIndex={0}
          ref={toggleRef}
          type="button"
          className="topbar__search-toggle"
          aria-expanded={searchOpen}
          aria-controls="topbar-search"
          aria-label={searchOpen ? 'Close search' : 'Search all events'}
          onClick={() => (searchOpen ? closeSearch() : openSearch())}
        >
          {searchOpen ? <IconClose /> : <IconSearch />}
        </button>
        <form
          role="search"
          id="topbar-search"
          className={`topbar__search ${searchOpen ? 'topbar__search--open' : ''}`}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && window.matchMedia('(max-width: 699px)').matches) {
              e.preventDefault();
              closeSearch();
            }
          }}
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(q.trim());
          }}
        >
          <SearchField
            ref={(el) => {
              inputRef.current = el;
              if (typeof searchRef === 'function') searchRef(el);
              else if (searchRef) searchRef.current = el;
            }}
            variant="global"
            placeholder="Search all events"
            label="Search all events (press / to focus)"
            aria-keyshortcuts="/"
            showShortcut
            value={q}
            onChange={(e) => setQ(e.target.value)}
            enterKeyHint="search"
          />
        </form>
        <Button style="neutral" size="medium" label="Classic list" icon={<IconList />} href="#/classic" />
        <Profile initials={CURRENT_USER.initials} name={CURRENT_USER.name} role={CURRENT_USER.role} />
      </div>
    </header>
  );
});
