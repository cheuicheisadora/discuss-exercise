# Library Events: prototype

An interactive prototype of a browse-and-navigate tool for library events coordinators, built from the **DashStack › Library Events** Figma file. The 5 Figma screens are states of one single-page app.

- **Stack:** Vite + React 18 + TypeScript, plain CSS with custom properties. No UI library, no router library, no animation library. The JS bundle is about 60 KB gzipped.
- **"Today" is fixed:** Monday, October 12, 2026 (see `src/data.ts`). The system date is never used.
- **Logged-in user:** Ana R., Events coordinator at West Ashley and Summerville.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/
```

Routing uses the URL hash, so deep links work on any static host (Vercel included) with no server config.

## Routes

| Route | View |
|---|---|
| `#/my-events` (default) | My events (screen 01) |
| `#/my-events/past` | My past events: Ana's completed events from both branches |
| `#/branch/:slug?tab=upcoming\|past&event=:id` | Branch view (screens 03–05). `:slug` is e.g. `west-ashley` |
| `#/branch/all` | All branches (system-wide view, Tag visible) |
| `#/search?q=...` | Global search results, grouped Upcoming / Past |
| `#/classic` | Classic list: one sortable table of every event |

Examples:
- Screen 04: `#/branch/west-ashley?tab=upcoming&event=wa-kids-story-hour`
- Screen 05: `#/branch/west-ashley?tab=past&event=wa-halloween-crafts`

## How to reach each state

| State | How to get there |
|---|---|
| Screen 01: My events | Open the app, or click **My events** in the top bar |
| Screen 02: Branch menu open | Click **Branches ▾** in the top bar, or the branch title (e.g. "West Ashley ⌄") on a branch page |
| Screen 03: Branch view, Upcoming | Branch menu → **West Ashley** |
| Screen 04: Upcoming, event selected | On West Ashley, click **Kids story hour** |
| Screen 05: Past, event selected | On West Ashley, choose the **Past** tab, then click **Halloween crafts** |
| Empty branch | Branch menu → **Dorchester Road**. Upcoming shows "No upcoming events at Dorchester Road" and a **See past events** link |
| No search results | Type `yoga` in the top bar search (or in a branch's search field) and press Enter |
| Undated event (empty date tile "–") | My events → **Digital skills webinar**, or Branch menu → **Summerville** (group "No date yet") |
| Long list | Branch menu → **Main Library** (6 events this week + 8 later). The list scrolls inside the page; the preview stays visible |
| Empty preview | Any branch page before a row is selected ("No event selected") |
| My past events | My events → **See my past events** |
| All branches | Branch menu → **All branches** (first row) |
| Filters | Branch page → **Type** / **Status** (Upcoming) or **Year** / **Type** (Past). Try Main Library → Status: Needs attention |
| Out-of-scope action toast | **New event**, **Book room**, **Schedule**, **Open full event**, **Reuse this event** |
| Preview as overlay | Make the window narrower than 1100px and select a row |

## Keyboard

- `/` focuses the global search (from anywhere except a text field). Enter shows the results.
- **Branch menu:** focus moves into "Find a branch". Typing filters. ↑/↓ (and Home/End) move, Enter opens the branch, Esc closes and returns focus to the trigger, Tab reaches "Show 5 more branches". A click outside also closes it.
- **Tabs:** ←/→ (and Home/End) switch between Upcoming and Past.
- **Rows:** each row is a single button (or a link on My events and in search results). The action button ("Book room", "Schedule") is a separate control beside it.
- **Preview:** Esc or ✕ closes it and returns focus to the row. The list keeps its scroll position.
- **"Skip to content"** is the first Tab stop.

## Project structure

```
src/
  data.ts              single source of truth: branches, events, TODAY, current user
  selectors.ts         every count, grouping, sort, search and text line is computed here
  router.ts            tiny hash router
  icons.tsx            inline SVGs copied from the Figma icon components
  styles/tokens.css    Figma variables + text styles (the only file with raw values)
  styles/base.css      reset, focus ring, layout, responsive rules, reduced motion
  components/          one component per Figma component (same names and props)
  views/               MyEvents, MyPastEvents, BranchView, SearchResults, ClassicList
```

**Data rules.** Nothing in the UI is hardcoded. Tab counts, "N this week · N need(s) attention", the Needs attention count, group headers and result counts all come from `selectors.ts`. In dev mode, `selectors.ts` also asserts the required per-branch counts (All 22/4, West Ashley 2/1, Summerville 2/1, Bees Ferry 1/0, Cooper River 4/0, Dorchester Road 0/0, James Island 2/1, Main Library 6/1, the other five 1/0) and logs a console error if the data drifts.

## Decisions and small deviations from Figma

- **Status & action gap:** 12px (`--space-12`). Figma uses 13px, which isn't a token.
- **Branch menu roles:** Figma's description says `aria-haspopup="menu"`. Because the popup contains a text filter, it's built as a non-modal `dialog` containing a `combobox` input and a `listbox` (with groups). The triggers use `aria-haspopup="dialog"` + `aria-expanded`. This is the correct ARIA pattern for a filterable list.
- **Search fields and selects** draw the focus ring on their pill/box wrapper (`:focus-within`) instead of the inner control, so the ring follows the visible shape.
- **Filters** are native `<select>` elements styled as the Figma Select (light, and natively accessible on older machines). Type options: Kids & teens, Talks, Workshops, Clubs, Community.
- **Past tab search** placeholder is "Search past events" (as in Figma screen 05). Upcoming uses "Search {branch}".
- **Page side padding** is 120px at 1440px (as in Figma) and shrinks to 40px toward 1280px, so the content keeps its 1200px width.
- **Below 1100px** the preview is a fixed panel sliding over the list from the right, and focus moves into it when it opens.

## Verification done

- All 5 screens compared with the Figma renders at 1440×1024 (pixel overlay). The only differences are the 1px token gap above, and the line break in the screen 04 preview subtitle ("West Ashley" is kept on one line).
- axe-core (WCAG 2.0/2.1/2.2 A+AA + best practices): 0 violations in 15 states at 1440px and 1000px.
- Lighthouse accessibility: 100 on My events, branch Past + selection, Main Library, Classic list and search. Best practices: 100.
- Keyboard-only run: My events → Branch menu → West Ashley → Kids story hour → Esc → Past tab → Halloween crafts → Reuse this event.
- No horizontal overflow at 760, 1000, 1280, 1440 or 1920px.
- `npm run build` with strict TypeScript: no errors or warnings.
