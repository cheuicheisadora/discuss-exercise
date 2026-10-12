# NOTES: how this prototype was built

A log of what was built, where it deviates from Figma and why, and what I (Claude, the AI coding agent) was unsure about. Written to be specific and honest, including mistakes.

---

## 1. Process, in order

1. **Read Figma before coding.** Using the Figma MCP, I read the "Read me" node, the 5 screens, the Components page and the Foundations page, plus the "Library Events" variables and text styles. Each screen came back as reference React + Tailwind code with a screenshot. I downloaded the icon SVGs to copy their exact paths and stroke widths.
2. **Plan + questions, then waited.** I replied with the stack, file structure, components, routes and 8 questions, each with a proposed default. You answered "ok", so every default below was approved, not invented silently.
3. **Built in this order:** tokens → data → selectors (all counts) → router → icons → small components → Branch menu / TopBar → EventRow / Preview → views → App shell.
4. **Verified with scripts, not by eye only.** Headless Chromium (Playwright) took screenshots, which I overlaid pixel by pixel on the Figma renders. I also ran axe-core, Lighthouse, a scripted keyboard-only walkthrough, count checks and horizontal-overflow checks at 5 widths.
5. **Fixed what verification found** (listed in section 5).
6. **Security cleanup** (section 6), then the deploy.

## 2. What was built

- A single-page app with Vite + React 18 + TypeScript and plain CSS custom properties. The only runtime dependencies are `react` and `react-dom`. The JS is about 60 KB gzipped.
- Hash routes: `#/my-events`, `#/my-events/past`, `#/branch/:slug?tab=&event=`, `#/branch/all`, `#/search?q=`, `#/classic`.
- One component per Figma component, with the same names and props: Button, Select, BranchTitle, StatusBadge, Tag, Count, SectionLabel, DateTile, NavItem, SearchField, Profile, TopBar, Tab, BranchMenu, BranchItem, Divider, EventRow, PreviewEvent, PreviewEmpty, DetailRow. Plus Toast, which was not in Figma; the brief asked for it.
- `src/data.ts` is the single source of truth: "today" is fixed to 2026-10-12, there are 62 events, and 11 of them are exactly as specified. `src/selectors.ts` computes every number on screen. In dev mode it asserts the required counts per branch and logs an error if the data drifts.
- All 5 "messy states" from the brief: empty branch, no results, undated event, long list and empty preview. Also a preview overlay below 1100px and toasts for the out-of-scope actions.

## 3. Deviations from Figma (and why)

| # | Where | Figma | What I did | Why |
|---|---|---|---|---|
| 1 | EventRow "Status & action" gap | 13px | 12px (`--space-12`) | 13px isn't a token, and the brief forbids raw values. Approved in the plan. Visible effect: the badge sits 1px further right. |
| 2 | Branch menu ARIA | Component description says `aria-haspopup="menu"` | Non-modal `dialog` containing a `combobox` input and a `listbox` with `group`s. Triggers use `aria-haspopup="dialog"` | A `role="menu"` can't contain a text input. The combobox/listbox pattern is the correct one for a filterable list. axe and Lighthouse both pass. |
| 3 | Branch title | A `div` with text + chevron | A `<button>` inside the page `<h1>`, with `aria-label="Switch branch, current: X"` | The Figma description itself asks for a button with that label. Putting it in the h1 keeps "one h1 per view". |
| 4 | Focus ring on Search field and Select | Not drawn | 2px ring on the pill/box wrapper (`:focus-within`). The inner input/select has `outline: none` | Otherwise the ring would draw around an invisible native control. The ring is still 2px `--color-brand-primary` with a 2px offset, as the brief specifies. **Honest note:** the brief says "never remove outlines". Technically I moved the outline from the inner element to its visible container rather than keeping it on the element. |
| 5 | Select | Figma draws a custom box, no open state | ~~A native `<select>` under the styled box~~ → **replaced in round 3** with a custom listbox in the Branch menu style (see section 11) | The native popup looked like the OS default and didn't match the Branch menu; you asked for the same style. |
| 6 | Preview subtitle wrap (screen 04) | Wraps as "…West Ashley ·" / "Room A" | Each part is kept on one line, so it wraps as "…10:00 am ·" / "West Ashley · Room A" | Our font rendering is a few pixels wider than Figma's, so "West Ashley" was splitting across lines. |
| 7 | Page side padding | 120px at 1440 | `clamp(40px, (100vw − 1200px)/2, 120px)` | At 1280 with a fixed 120px, row details wrapped mid-word ("Reading / room"). The content now stays 1200px wide down to 1280. Identical to Figma at 1440. |
| 8 | Hover states | Only Branch title and Branch item have a Hover variant | Small hover feedback on buttons, rows, tabs and selects, using token colors only | Not drawn in Figma. I kept them subtle; you may want to remove them. |
| 9 | Event row is clickable | "Whole row is clickable" | The row's main button spans the whole card. The status column is positioned over it, and the action button is a sibling, not a child | Avoids nested interactive elements, as the brief requires. The focus ring therefore surrounds the whole card. |
| 10 | Status inside the row | Visible badge | The visible badge is `aria-hidden`, and the same status text is repeated visually hidden inside the row button | Otherwise screen readers would hear the status twice, or not as part of the row's name. |
| 11 | Date tile, empty state | Shows the month + "–" | Same, plus visually hidden "No date yet" | A screen reader would otherwise read "Oct dash". |

## 4. Things I was unsure about (and what I chose)

- **Past tab search placeholder.** The brief said "Search West Ashley", but Figma screen 05 says "Search past events". I followed Figma (approved).
- **My events "Upcoming" list.** Figma leaves out the two Needs attention events, so they don't appear twice. I kept that (approved).
- **Year filter.** Figma shows "Year: 2025–2026". I made that label the "all years" option, generated from the data, with 2026 and 2025 as the other options.
- **Type categories.** The data had no types, so I invented five: Kids & teens, Talks, Workshops, Clubs, Community (approved).
- **Generated events.** Except for the 11 required ones, all events, rooms, coordinators, registrations and notes are invented to satisfy the count table. Every branch has past events except where a count rule forbids it; Dorchester Road has past events but no upcoming ones.
- **Ana's past events.** "My past events" shows 5: the 4 required West Ashley events plus one I added at Summerville ("Teen movie afternoon"), so the Tag visibly mixes branches.
- **"Needs attention" in the Branch menu summary.** Counts every upcoming event with a blocker, including undated ones. That's why Summerville shows "1 needs attention" while its 2 events this week are both Confirmed. This matches Figma's numbers.
- **Copy I had to write (not in Figma or the brief):** the toast messages, the My past events subtitle, the search results subtitle, "No events match these filters.", the Classic list subtitle, and the "Branch not found" page.
- **Quotes.** I first used curly quotes in "No events match “yoga”", then switched to straight quotes to match the brief's copy exactly.
- **Focus after navigation.** On a page change, focus moves to the page h1. If the URL selects an event, it moves to that row instead. This is my choice; Figma doesn't specify it.
- **Overlay preview (<1100px).** Focus moves into the panel when it opens. There is no backdrop and no focus trap, because it's non-modal.
- **Classic list default sort.** Date ascending, so the oldest past events come first and undated events come last. The brief only said "sorted by date"; descending would also be defensible.
- **Fonts.** Loaded from Google Fonts, so the app needs internet to show Nunito Sans. Offline it falls back to system fonts.

## 5. Mistakes found during verification (and fixed)

- My test script reloaded the same URL, so a second click *closed* the Branch menu. That was a bug in the test, not the app.
- The All branches placeholder read "Search All branches" with a capital A. Fixed to "Search all branches".
- At 1280px the details line wrapped mid-word. Fixed with deviation 7.
- I killed my own shell with `pkill -f vite`, because the pattern matched the command itself, so the first commit attempt didn't happen. I re-ran it.
- A 404 for `favicon.ico` showed in the console. I added an inline SVG favicon.

## 6. Security issue found in the original repo (not part of the brief)

I first built this on a branch of an unrelated repo ("Multitudes"). The only file that was in that repo, `.github/workflows/main.yml`, actually contained an `.env` file with a real Neon database URL (including the password) and a Resend API key. The repository is **public**. I flagged it, and you rotated the password. I removed the file and added an empty `.env.example` plus `.env*.local` in `.gitignore`. The old values are still in git history; they're harmless once rotated. I couldn't rotate them myself, because this session had no access to Neon or Resend.

## 7. Moving to its own repo and deploying

- You asked for this to be a separate project, not connected to Multitudes. I prepared a clean copy with a fresh, single-commit history. That way none of the Multitudes history, including the leaked-secrets commit, came along. I also dropped the Multitudes `.env.example`, which isn't relevant to this app.
- **What I could not do myself:** this session's GitHub and Vercel connectors returned 403 when I tried to create the GitHub repo, create the Vercel project and change project settings. You created the empty `discuss-exercise` repo and imported it on Vercel; I pushed the code and verified the result.
- **Deployment Protection:** the new Vercel project came with Vercel Authentication set to "all except custom domains". I couldn't change that setting (403). In practice, the production domain **https://discuss-exercise-livid.vercel.app** answers 200 with no login. The other aliases (`…-cheuicheisadoras-projects.vercel.app` and deployment-specific URLs) still redirect to a Vercel login. If every alias should be public, turn Vercel Authentication off under Project → Settings → Deployment Protection.
- **Live check in a fresh browser session (no cookies, like a private window):** I re-ran the keyboard-only walkthrough and axe (0 violations) on the live URL, and took screenshots of the 5 screens. They are pixel-identical to the local build that was compared with Figma.

## 8. Verification results

- **Figma overlay at 1440×1024, 5 screens:** the only differences are deviations 1 and 6.
- **axe-core** (WCAG 2.0/2.1/2.2 A+AA + best practices): 0 violations in 15 states at 1440px and at 1000px.
- **Lighthouse:** accessibility 100 and best practices 100 on 5 routes. Performance 92–94 under mobile throttling; Google Fonts is the main cost.
- **Keyboard-only run:** My events → Branch menu → West Ashley → Kids story hour → Esc → Past tab → Halloween crafts → Reuse this event. Every step was logged with the focused element and the URL.
- **Counts:** All 22/4, West Ashley 2/1, Summerville 2/1, Bees Ferry 1, Cooper River 4, Dorchester Road 0, James Island 2/1, Main Library 6/1, the rest 1. West Ashley tabs show 3 / 4, and My events shows Needs attention 2.
- **No horizontal overflow** at 760, 1000, 1280, 1440 and 1920px.
- **`npm run build`** (strict TypeScript) is clean.

## 9. What I did not do

- No real flows for New event, Book room, Schedule, Open full event or Reuse; they show a toast, as the brief asked.
- No mobile layout. Below about 700px it stays usable and never overflows sideways, but it wasn't designed.
- No automated test suite in the repo. The verification scripts lived in a scratch folder.
- I didn't test with a real screen reader (NVDA, VoiceOver). The ARIA was checked only by axe and Lighthouse, and by inspecting the code.

---

## 10. Motion and interaction polish (round 2)

Brief: make it feel smooth and polished without changing logic, data, routes, copy, layout, colors, spacing or component structure. I analysed every state first, then you said "decide what's best and do it". No animation library: CSS transitions/keyframes, plus small JS only where CSS can't do it (exit animations, the tab indicator, hover intent).

### Tokens added to `tokens.css`
- Durations: `--duration-fast` 120ms (hover, press, focus), `--duration-base` 180ms (menus, tabs, row selection, lists), `--duration-slow` 240ms (panels, toasts, empty states).
- Easing: `--ease-out` (entering), `--ease-in` (leaving), `--ease-standard` (state changes). No bounce, no overshoot.
- Distances and scales: `--motion-shift-sm` 4px, `--motion-shift-md` 8px, `--motion-scale-from` 0.98, `--motion-press` 0.98, `--motion-press-row` 0.995, `--motion-stagger` 30ms, `--motion-stagger-max` 6.
- Hover intent: `--hover-open-delay` 120ms, `--hover-close-delay` 200ms. JS reads these from CSS, so there's one source of truth.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, the distance and stagger tokens become 0, scale becomes 1, and base/slow durations become 120ms. Only short opacity fades remain. The sliding tab bar and the focus-ring settle are switched off entirely.

### What animates
| Element | Motion |
|---|---|
| Branch menu | opens: fade + scale 0.98→1 + 4px downward slide, origin at the trigger (base, ease-out). Closes faster (fast, ease-in). Items don't animate one by one. Trigger chevron rotates 180° while open |
| Branch menu: hover open | see "Hover-open Branch menu" below |
| Preview panel | opens: fade + 8px slide from the right (slow, ease-out). Switching events: the panel stays and only its content fades (base). Closes: fade + slide out (fast, ease-in), then the empty state fades in |
| Tabs | the blue bar slides from the old tab to the new one (transform only, FLIP); the panel content fades in |
| Event rows | hover: border + light shadow (no lift). Press: the whole card scales to 0.995. Selected: the border color transitions |
| Buttons, selects, search fields, nav items, branch title, "Show 5 more", Classic list rows | color / background / border transitions (fast). Buttons, selects and the branch title press to 0.98 |
| Lists | rows that newly appear (branch switch, tab switch, widening a filter, search results) rise 4px + fade, staggered 30ms, max 6 staggered. Rows already on screen never re-animate, so typing in search doesn't flicker |
| Page / view changes | the new view fades in (base) |
| Toasts | slide up 8px + fade in (slow); fade out on dismiss (base, ease-in) |
| Empty states | fade in (slow) |
| Focus ring | visible on the first frame; only its offset settles 0→2px (fast). Never delayed |

### Hover-open Branch menu (WCAG 1.4.13)
- **Opening:** opens after 120ms of mouse hover on "Branches ▾" or the branch title, so passing over doesn't flicker. It doesn't move focus.
- **Closing:** closes 200ms after the pointer leaves both the trigger and the menu. An invisible 4px "bridge" covers the gap, so a diagonal move into the menu works.
- **WCAG 1.4.13:** the menu stays open while hovered, Esc dismisses it without moving the pointer (a document-level listener; focus stays where it was), and it never covers its trigger.
- **Click and keyboard:**
  - Click / Enter / Space open it with focus in the filter, as before.
  - ArrowDown on the trigger now does the same. The brief listed it as existing behaviour, but it wasn't implemented, so I added it.
  - Clicking a hover-opened menu keeps it open and moves focus in (like Linear and Radix); a second click closes it.
  - Once focus is inside, it no longer closes on pointer leave.
- **Touch:** only `pointerType: mouse` on a hover-capable device triggers hover; touch taps work as before.
- **aria-expanded** always matches the real state. While the menu animates out it is `inert` and `aria-hidden`.

### Non-motion fixes I made (no layout or logic change)
1. **Screen-reader names had no spaces.** They read "Upcoming3", "Oct14Kids story hour", "West Ashley2 this week". I added whitespace text nodes; inside flex containers they aren't rendered, so the pixels are unchanged. Names now read "Upcoming 3", "Oct 14 Kids story hour …".
2. **Attention rows now get hover feedback** (the shadow). Their red border stays.
3. **The open menu's trigger now shows its state:** the "Branches" label turns dark and the chevron points up. This is the only visible change in a resting state (screen 02).

### Things I chose not to animate, and why
- **Removed rows** when a filter narrows the list just disappear. Animating them out would delay the list and needs layout animation.
- **Classic list sorting:** reordering a 62-row table with motion would be distracting, not explanatory.
- **No real two-view page crossfade:** keeping the old view on screen while the new one fades in would render two pages and delay content. The new view fades in instead, and the old one leaves at once.
- **No lift on rows**, only a shadow: a 1px jump on a long list looks jittery.
- **No skeletons, no bounce, no stagger longer than 6 items.**

### Bugs found while verifying (fixed)
- **Reopening the menu during its 120ms close animation** (Esc then Enter quickly) left focus on the trigger. Focus was moved before the `inert` flag was cleared; I fixed the order.
- **The first version of the sliding tab bar** (one bar positioned with `scaleX`) differed from the approved design at rest: square corners, and sub-pixel edges. The final version shows the shared bar only during the slide and hands back to each tab's own bar, so resting states are pixel-identical.

### Verification
- **Pixel comparison of 12 resting states, old build vs new, at 1440×1024:** identical (max difference 1/255, invisible), except screen 02 (fix 3 above).
- **22 automated interaction checks:**
  - hover intent (a quick pass doesn't open it);
  - diagonal move into the menu;
  - close delay;
  - Esc on a hover-open menu;
  - hover-then-click;
  - the pinned menu staying open;
  - touch tap;
  - ArrowDown;
  - Esc→Enter during the exit animation;
  - rows clickable during their entrance;
  - toast;
  - reduced motion (computed tokens 0/1, no transform, no slide).
- **Layout shift:** the only shift is the pre-existing 2px selected-row border, identical on the approved build. Lighthouse CLS is 0.
- **Keyboard-only walkthrough, axe** (0 violations at 1440 and 1000px) and **Lighthouse accessibility 100** on 5 routes. Every count and label is identical to before. `npm run build` is clean.

### Suggested, not changed (would change layout or logic)
- **Selecting a row shifts the rows below by 2px**, because the border goes from 1px to 2px, as in Figma. An inset shadow would remove the jump, but it changes the layout.
- **Toasts vanish after 6 seconds** and don't pause on hover or focus (WCAG 2.2.1); that needs a logic change.
- **Below 1100px the overlay preview** has no backdrop and no click-outside-to-close, and rows behind it stay in the Tab order.
- **A sticky header for the Classic list.**
- **The focus ring on the page title after navigation** looks heavy. It's correct, so I left it as a design decision.

---

## 11. Filter dropdowns in the Branch menu style (round 3)

You pointed out that the Type / Status / Year dropdown showed the browser's native list (blue OS highlight, square box), unlike the Branch menu. CSS can't style a native `<select>` popup, so I replaced it with a custom listbox.

- **Trigger:** unchanged. It's the same Figma Select, pixel-identical when closed (verified against production on 12 screens). It is now a real `<button aria-haspopup="listbox" aria-expanded>`, and its name reads "Type: All". The chevron rotates while open, as on the Branch menu.
- **Menu:** the same tokens as the Branch menu: surface, 1px default border, `--radius-lg`, `--shadow-menu`, 8px padding, items with 8/12px padding, `--radius-md`, and the `--color-brand-primary-soft` hover/active background. The current value is shown in brand blue. Same entrance and exit animation. Width fits the longest option (at least the trigger width).
- **Keyboard:**
  - Enter / Space / ↑ / ↓ open it, with focus on the list and the current value active.
  - ↑ ↓ Home End and typing a first letter move the active option.
  - Enter / Space choose and return focus to the button.
  - Esc closes without changing the value and returns focus. That Esc doesn't also close the event preview.
  - Tab closes it. A click outside closes it.
  - A visible focus ring sits on the active option when the list is opened from the keyboard.
- **Not copied from the Branch menu:** hover-to-open. Filters are a deliberate choice, and opening them on hover would get in the way while you move the mouse across the toolbar.
- **Logic is unchanged:** the same `Select` props (label, value, options, onChange), so filtering and announcements work as before.
- **Verified:**
  - 18 checks: mouse, keyboard, type-ahead, Esc / Tab / outside-click, focus return, Year and Type on branch and My past pages;
  - axe with the list open: 0 violations;
  - Lighthouse accessibility 100;
  - the full keyboard walkthrough and the 22 motion checks pass;
  - layout shift 0.

## 12. Classic list titles show the out-of-scope message (round 4)

You asked that clicking an event in the Classic list should not jump to the branch page. Each title is now a button (styled exactly as before; the screen is pixel-identical when nothing is pressed). It shows the same toast as "Open full event": "In the full product, this opens the full event page for {title}." The page stays on the Classic list. Verified with mouse and keyboard; axe reports 0 violations.

## 13. Usability-test fixes (round 5)

1. **Search across tabs:**
   - When a branch search finds nothing on the current tab but finds something on the other tab, the empty state reads, for example, "No upcoming events match "poetry". 1 past event matches." followed by a "Show past results →" link.
   - The link switches tabs, keeps the search term (it also respects that tab's filters) and moves focus to the newly selected tab.
   - It works in both directions. The original "Try another word or check the spelling." message stays when neither tab matches.
2. **Focus and page titles:**
   - Opening the details panel (click, Enter or Space on a row, or arriving with `?event=` from My events, search or a deep link) moves focus to the panel heading `#event-preview-title` (now `tabindex="-1"`).
   - Esc and ✕ still return focus to the row.
   - `document.title` is set per screen: "My events · Library Events", "West Ashley · Upcoming · Library Events", "Search: poetry · Library Events", "Classic list · Library Events", and so on.
3. **My events subtitle** now reads "Only events you coordinate at West Ashley and Summerville. To see everything at a branch, use Branches." The My past events subtitle was already clear, so I left it.
4. **"← My events" back link:** built first, then **removed** after your follow-up (below). Since My events rows no longer jump to a branch page, there's nothing to go back from.
5. **Follow-up: clicks on lists outside branch pages show the message.** You decided that only branch pages and All branches keep the details panel. Everywhere else events appear in a list, a click (or Enter) on a row shows "In the full product, this opens the full event page for {title}." and stays on the page. That covers My events, My past events and search results; the Classic list already did this.
   - My past events lost its side panel. An empty "Select an event…" box that can never fill would be misleading, so the list now uses the full width, like My events. Its filters are unchanged.
   - On these lists rows no longer have `aria-expanded`, because they don't control a panel.
   - The action buttons ("Book room", "Schedule") keep their own messages.

**Bug found while verifying (also on production before this round):** in about 1 of 3 test runs, a fast open → close of a dropdown left the closed list mounted, invisibly. The cause was a stale value in `usePresence` (the helper that keeps menus mounted for their exit animation). I rewrote it to use a functional state update; 6 out of 6 runs are now clean. Nothing visible changed.

**Verified:**
- Flows (a), (b) and (d) pass, plus edge cases: reverse direction, no matches anywhere, Space key, the ✕ button, reopening the same row. Flow (c) changed with the follow-up: clicking "Kids story hour" on My events now shows the message.
- List clicks show the message (mouse and Enter) on My events, My past events and search, with axe clean on each. Branch pages and All branches still open the panel and move focus to its heading.
- The 22 motion checks and 18 dropdown checks pass. axe reports 0 violations, and Lighthouse accessibility is 100.
- Pixel comparison with production, before the follow-up: only the My events subtitle and the focus ring on the panel heading (when arriving with `?event=`) differed. After the follow-up, My past events also changed: its list is full width.

## 14. Mobile (round 6)

You asked for a polished phone layout with the same information and the same design assets. Breakpoint: **≤ 699px**. Tablets (700–1099px) keep the existing overlay layout, and desktop is unchanged: pixel-identical to production on 12 screens, except the fix in "Also fixed" below.

**Audit before (at 390px):**
- The top bar overflowed: the page was 481px wide, and the search field covered "Branches", so it couldn't be tapped.
- Event-row status badges and action buttons hung outside the card.
- The details panel was a 360px overlay with a sliver of list beside it.
- The Branch menu was 400px wide, so it ran off screen.
- The Classic list table needed sideways scrolling.

**What I did:**
- **Top bar, in two sticky rows:**
  - Row 1: logo · search button · Classic list (icon) · avatar.
  - Row 2: My events · Branches ▾, with the blue indicator.
  - The search button opens a full-width search row (Esc or ✕ closes it); "/" still works.
  - New size tokens: `--size-topbar-row-mobile` 56px, `--size-nav-mobile` 48px.
- **Pages:** scroll as normal documents (no inner scroll boxes), with 16px side padding and full-width search fields. Title, search, tabs and filters stack.
- **Event rows:** date tile and text on top; the status badge (and the action button, right-aligned) inside the card along the bottom. Same tile, badge, button and type styles.
- **Details panel → full-screen sheet:** the same component, with its actions at the bottom (respecting the iPhone home-bar safe area). The page behind is made `inert` while it's open, so keyboard and screen-reader focus can't land on hidden content; live regions stay active. ✕ or Esc closes it and returns focus to the row.
- **Branch menu:** full width minus 16px margins, hanging from the top bar (or the branch title), with internal scroll. **Tapping** it no longer focuses "Find a branch", so the phone keyboard doesn't cover the list. Mouse and keyboard behave as before.
- **Filter dropdowns:** kept on screen.
- **Classic list:** each event becomes a stacked card (title, then Date / Branch / Room / Status with labels). The sort buttons stay on top and are 40px tall for touch. Explicit table roles keep the table semantics for screen readers in the card layout.
- **Toasts** respect the safe area. Added `viewport-fit=cover` to the viewport meta tag.

**Also fixed (every screen size):** the "Find a branch" field showed a second, square focus ring inside the rounded one. Only the rounded ring remains.

**Verified:**
- No horizontal overflow and nothing off-screen at 320, 360, 375, 390, 414 and 430px, across 14 states (menus, sheet, search row and dropdown open).
- Touch flows: the menu opens by tap, choosing a branch works, the row opens the sheet with focus on its heading and the page behind inert, the sheet closes with focus back on the row, "Book room" works inside the card, search works, a result tap shows the message, and Classic list sorting works.
- axe: 0 violations, with the menu open, the sheet open and on the Classic list cards. Every tap target is at least 24×24px.
- Lighthouse in mobile mode: accessibility 100, best practices 100, performance 92–93, CLS 0.
- No overflow at tablet widths (700, 768, 834, 1024 and 1280px).
- Desktop suites still pass: 22 motion checks, 18 dropdown checks and 17 list checks.

## 15. My events scope, shown as tabs (round 7)

You pointed out that the explanatory sentence ("Only events you coordinate at … To see everything at a branch, use Branches.") isn't how products present this. I checked how others do it:
- **[Linear "My issues"](https://linear.app/docs/my-issues):** no explanatory text; the scope is a row of tabs ("Assigned", "Created", "Subscribed", "Activity").
- **[GitHub's pull requests dashboard](https://github.blog/changelog/2026-07-09-new-pull-requests-dashboard-is-now-generally-available):** named default filters ("Authored by me", "Assigned to me", …).
- **Filter UX guidance** (e.g. [SaaS UI](https://www.saasui.design/blog/saas-tags-labels-chips-ux-patterns)): keep the active scope visible as a control.

**What changed (applying that pattern):**
- **Subtitle:** now only the context, "Your branches: West Ashley and Summerville".
- **Scope tabs** under the title, reusing the Tab component and tokens: **"Coordinated by me (5)"**, the default and the same 5 events as before, and **"All (7)"**, everything at Ana's branches including Marcus's Chess club and Jen's Book club. Its numbers now line up with the Branches menu, which was the source of confusion in the usability test.
- **Tab behaviour:** standard ARIA tabs; ←/→/Home/End switch; the choice is kept in the URL (`#/my-events?view=branches`), so it survives refresh and Back. Row clicks still show the "full event page" message.
- **Label choice:** the second tab was first "All at my branches", but on phones (320–414px) the two labels didn't fit side by side, and a half-hidden tab is worse. I shortened it to "All" everywhere, so the visible label always matches the screen-reader name. The subtitle right above names the branches.

**Verified:**
- Desktop and phone (no overflow; the tabs fit at 320–430px).
- Keyboard, refresh and axe (0 violations).
- The list, motion, dropdown and phone suites still pass.
- Other screens are pixel-identical to production.

## 16. "All" also covers past events (round 8)

You asked that the "All" tab should let you see all past events too.
- **The past-events link follows the tab:**
  - "Coordinated by me" → "See my past events" (`#/my-events/past`), as before.
  - "All" → "See all past events" (`#/my-events/past?view=branches`).
- **My past events has the same tabs:** "Coordinated by me (5)" and "All (7)". "All" adds Chess club and both book clubs from other coordinators. The tabs are a shared `ScopeTabs` component, used by both pages.
- **Subtitle:** now "Your branches: West Ashley and Summerville", the same as My events.
- **Unchanged:** the Year / Type filters and the row message.
- **Verified:** links, tabs (click and arrow keys), filters, axe (0 violations) and phone at 360px (no overflow, tabs fit).

## 17. Desktop keyboard pass (round 9)

You said the site didn't feel ready for keyboard users on desktop. I first ran a Tab-by-Tab audit of every page at 1440px. Every stop had a visible focus ring and scrolled into view, so the basics were fine. The real problems were efficiency and discoverability:
- **Long lists cost one Tab per row** (Main Library: 14 events, two Tab stops for rows with an action button). **Fix:** ↑/↓ move between events across groups, Home/End jump to the first/last, Enter opens. Tab still works as before. This is the pattern Gmail, Linear and GitHub use. Same on the Classic list titles. (`src/keyboard.ts`)
- **The shortcuts were invisible.** "/", the arrow keys and Esc were only in the README. **Fix:** "?" opens a **Keyboard shortcuts** dialog (native `<dialog>` with `showModal`, so focus is trapped and Esc closes it; focus returns to where you were). A "Keyboard shortcuts" link is the second Tab stop, right after "Skip to content", and is hidden until focused, in the same spot. The keycaps reuse the style of the search "/" hint. I added one token, `--color-scrim`, for the dialog backdrop.
- **Messages could not be dismissed from the keyboard.** **Fix:** Esc dismisses the toast, but only if nothing else used that Esc (an open menu, dropdown or details panel closes first).
- **`aria-keyshortcuts`** on the search field ("/") and the close buttons ("Escape"), so screen readers announce them.
- **Guards:** "/" and "?" are ignored while typing in a field and while the dialog is open.
- **Verified:**
  - a new scripted test (22 checks: skip links, arrows across groups, Home/End, scroll into view, Enter/Esc focus return, Classic list, toast Esc, dialog focus trap and return; all pass);
  - the Tab audit again;
  - the earlier list, dropdown, motion, mobile, scope and past-events suites;
  - axe: 0 violations, including with the dialog open;
  - Lighthouse: accessibility 100, best practices 100 on 4 routes;
  - pixel comparison with production: identical, apart from 1–2px anti-aliasing noise.
- **Honest note:** one old check in my list suite still fails ("My events subtitle"). It expects the subtitle text from before round 8, and it fails on production too, so it's an outdated test, not a regression.
- **Not done:** single-letter shortcuts (like "j/k" or "g then b"). They can clash with screen readers and voice control (WCAG 2.1.4), and the arrow keys already cover the need.

**Follow-up:** you found that ↑/↓ did nothing until an event already had focus. Now, if focus is anywhere else (the page heading, empty space after a click, a button like "New event"), ↓ jumps to the selected event (or the first one) and ↑ to the last one. From an action button ("Book room") the arrows move relative to that row. Search fields, tabs, filter dropdowns, the Branch menu, the shortcuts dialog and the details panel keep their own arrow keys. In practice this means the arrows no longer scroll the page outside a text field; ↓ goes into the list instead. Tested with 26 scripted checks across all list pages, plus the earlier suites and axe (0 violations).
