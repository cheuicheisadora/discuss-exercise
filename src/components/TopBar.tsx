import { forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { TOPBAR_MENU_TRIGGER } from '../useBranchMenu';
import { CURRENT_USER } from '../data';
import { IconClose, IconList, IconSearch } from '../icons';
import { navigate } from '../router';
import { branchName, isPast, longDate, suggestEvents } from '../selectors';
import { BranchItem } from './BranchItem';
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

  /* ---------- Suggestions under the field (combobox + listbox, like Google / GitHub) ---------- */
  const uid = useId();
  const listId = `${uid}-suggestions`;
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [active, setActive] = useState(-1); // -1 = nothing chosen: Enter shows all results
  const [keyboard, setKeyboard] = useState(false);
  const suggestions = suggestEvents(q);
  const showSuggest = suggestOpen && q.trim() !== '';
  const optCount = suggestions.length + 1; // + "See all results"
  const optId = (i: number) => `${uid}-opt-${i}`;
  const closeSuggest = () => {
    setSuggestOpen(false);
    setActive(-1);
  };
  const choose = (i: number) => {
    closeSuggest();
    const e = suggestions[i];
    if (e) navigate(`#/branch/${e.branch}?tab=${isPast(e) ? 'past' : 'upcoming'}&event=${e.id}`);
    else onSearch(q.trim());
  };
  const onSuggestKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!q.trim()) return;
      e.preventDefault();
      setKeyboard(true);
      if (!showSuggest) {
        setSuggestOpen(true);
        setActive(e.key === 'ArrowDown' ? 0 : optCount - 1);
        return;
      }
      setActive((i) => (e.key === 'ArrowDown' ? (i + 1) % optCount : i <= 0 ? optCount - 1 : i - 1));
    } else if (e.key === 'Enter' && showSuggest && active >= 0) {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape' && showSuggest) {
      // first Esc closes the list and keeps the text
      e.preventDefault();
      e.stopPropagation();
      closeSuggest();
    }
  };
  useEffect(() => {
    if (active >= 0) document.getElementById(optId(active))?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  const suggestCount = suggestions.length;
  const suggestStatus = !showSuggest ? '' : suggestCount === 0 ? 'No suggestions' : `${suggestCount} ${suggestCount === 1 ? 'suggestion' : 'suggestions'}`;

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
            closeSuggest();
            onSearch(q.trim());
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeSuggest();
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
            onChange={(e) => {
              setQ(e.target.value);
              setSuggestOpen(true);
              setActive(-1);
            }}
            onFocus={() => q.trim() && q.trim() !== searchValue && setSuggestOpen(true)}
            onKeyDown={onSuggestKey}
            role="combobox"
            aria-expanded={showSuggest}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showSuggest && active >= 0 ? optId(active) : undefined}
            enterKeyHint="search"
          />
          {showSuggest && (
            <div
              className={`search-suggest ${keyboard ? 'search-suggest--keyboard' : ''}`}
              onMouseDown={(e) => e.preventDefault() /* keep focus in the field */}
            >
              <div role="listbox" id={listId} aria-label="Suggestions" className="search-suggest__list">
                {suggestions.map((ev, i) => (
                  <BranchItem
                    key={ev.id}
                    id={optId(i)}
                    name={ev.title}
                    summary={`${isPast(ev) ? 'Past · ' : ''}${branchName(ev.branch)} · ${ev.date ? longDate(ev.date) : 'No date yet'}`}
                    state={i === active ? 'hover' : 'default'}
                    onSelect={() => choose(i)}
                    onHover={() => {
                      setKeyboard(false);
                      setActive(i);
                    }}
                  />
                ))}
                <div
                  id={optId(suggestions.length)}
                  role="option"
                  aria-selected={false}
                  className={`branch-item search-suggest__all t-button ${active === suggestions.length ? 'branch-item--hover' : ''}`}
                  onClick={() => choose(suggestions.length)}
                  onMouseMove={() => {
                    setKeyboard(false);
                    setActive(suggestions.length);
                  }}
                >
                  {suggestions.length ? `See all results for "${q.trim()}"` : `No events match "${q.trim()}". Search anyway`}
                </div>
              </div>
            </div>
          )}
          <span className="sr-only" role="status" aria-live="polite">
            {suggestStatus}
          </span>
        </form>
        <Button style="neutral" size="medium" label="Classic list" icon={<IconList />} href="#/classic" />
        <Profile initials={CURRENT_USER.initials} name={CURRENT_USER.name} role={CURRENT_USER.role} />
      </div>
    </header>
  );
});
