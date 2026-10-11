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
| 5 | Select | Figma draws a custom box | A native `<select>`, invisible, layered over a box styled exactly like Figma | Light and fully accessible on old library computers. The open dropdown list looks like the OS default, not Figma (Figma doesn't draw an open state). |
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
