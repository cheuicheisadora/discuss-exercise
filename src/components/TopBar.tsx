import { forwardRef, useEffect, useState, type ReactNode } from 'react';
import { CURRENT_USER } from '../data';
import { IconList } from '../icons';
import { Button } from './Button';
import { NavItem } from './NavItem';
import { Profile } from './Profile';
import { SearchField } from './SearchField';
import './TopBar.css';

export interface TopBarProps {
  section: 'my-events' | 'branches' | 'classic' | null;
  menuOpen: boolean;
  onToggleMenu: () => void;
  /** Branch menu, rendered under the "Branches" trigger when open from the top bar. */
  menu?: ReactNode;
  searchValue: string;
  onSearch: (q: string) => void;
}

export const TOPBAR_MENU_TRIGGER = 'branches-trigger';

export const TopBar = forwardRef<HTMLInputElement, TopBarProps>(function TopBar(
  { section, menuOpen, onToggleMenu, menu, searchValue, onSearch },
  searchRef,
) {
  const [q, setQ] = useState(searchValue);
  useEffect(() => setQ(searchValue), [searchValue]);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <p className="topbar__logo t-logo">
          <span className="topbar__logo-brand">Library</span> Events
        </p>
        <nav className="topbar__nav" aria-label="Main">
          <NavItem label="My events" state={section === 'my-events'} href="#/my-events" />
          <div className="menu-anchor">
            <NavItem
              id={TOPBAR_MENU_TRIGGER}
              label="Branches"
              showChevron
              state={section === 'branches'}
              expanded={menuOpen}
              onClick={onToggleMenu}
            />
            {menu}
          </div>
        </nav>
      </div>
      <div className="topbar__right">
        <form
          role="search"
          className="topbar__search"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(q.trim());
          }}
        >
          <SearchField
            ref={searchRef}
            variant="global"
            placeholder="Search all events"
            label="Search all events (press / to focus)"
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
