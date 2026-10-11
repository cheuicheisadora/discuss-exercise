import {
  BRANCHES,
  CURRENT_USER,
  EVENTS,
  EVENT_TYPES,
  NEXT_WEEK_END,
  THIS_WEEK_END,
  TODAY,
  type Branch,
  type BranchSlug,
  type EventType,
  type LibraryEvent,
} from './data';

/* ---------------- Dates ---------------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d, weekday: new Date(y, m - 1, d).getDay() };
}

export function monthShort(iso: string) {
  return MONTHS[parts(iso).m - 1];
}
export function dayOfMonth(iso: string) {
  return String(parts(iso).d);
}
export function weekdayShort(iso: string) {
  return WEEKDAYS[parts(iso).weekday];
}
/** "Sep 18, 2026" */
export function longDate(iso: string) {
  const p = parts(iso);
  return `${MONTHS[p.m - 1]} ${p.d}, ${p.y}`;
}
export function yearOf(iso: string) {
  return parts(iso).y;
}

/* ---------------- Branches ---------------- */

export function getBranch(slug: string): Branch | undefined {
  return BRANCHES.find((b) => b.slug === slug);
}
export function branchName(slug: BranchSlug) {
  return getBranch(slug)?.name ?? slug;
}
export function getEvent(id: string | null | undefined) {
  return id ? EVENTS.find((e) => e.id === id) : undefined;
}

/* ---------------- Status ---------------- */

export function isPast(e: LibraryEvent) {
  return e.date !== null && e.date < TODAY;
}
export function isUpcoming(e: LibraryEvent) {
  return !isPast(e);
}
export function needsAttention(e: LibraryEvent) {
  return isUpcoming(e) && !!e.blocker;
}
export function isThisWeek(e: LibraryEvent) {
  return e.date !== null && e.date >= TODAY && e.date <= THIS_WEEK_END;
}

export type Tone = 'success' | 'warning' | 'danger' | 'neutral';

export function statusOf(e: LibraryEvent): { label: string; tone: Tone; showIcon: boolean; action?: string } {
  if (isPast(e)) return { label: 'Completed', tone: 'neutral', showIcon: false };
  if (e.blocker === 'needs-room') return { label: 'Needs room', tone: 'danger', showIcon: true, action: 'Book room' };
  if (e.blocker === 'not-scheduled') return { label: 'Not scheduled', tone: 'warning', showIcon: true, action: 'Schedule' };
  return { label: 'Confirmed', tone: 'success', showIcon: false };
}

/* ---------------- Text ---------------- */

/** Row details line. Upcoming "Wed · 10:00 am · Room A", past "Sep 18, 2026 · 21 attended · Room B", undated "Target: late October". */
export function detailsLine(e: LibraryEvent) {
  if (e.date === null) return e.target ?? 'No date yet';
  if (isPast(e)) return [longDate(e.date), `${e.attended ?? 0} attended`, e.room].filter(Boolean).join(' · ');
  return [weekdayShort(e.date), e.time, e.room].filter(Boolean).join(' · ');
}

const keep = (s?: string) => s?.replace(/ /g, '\u00a0');

/** Preview subtitle. "Wed, Oct 14 · 10:00 am · West Ashley · Room A" / "Oct 30, 2025 · West Ashley · Room A". */
export function previewSubtitle(e: LibraryEvent) {
  const branch = branchName(e.branch);
  let segs: (string | undefined)[];
  if (e.date === null) segs = [e.target, branch];
  else if (isPast(e)) segs = [longDate(e.date), branch, e.room];
  else segs = [`${weekdayShort(e.date)}, ${monthShort(e.date)} ${dayOfMonth(e.date)}`, e.time, branch, e.room];
  // each part stays on one line ("West Ashley" never splits)
  return segs.filter(Boolean).map(keep).join(' · ');
}

export function typeLabel(t: EventType) {
  return EVENT_TYPES.find((x) => x.value === t)?.label ?? t;
}

export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

/* ---------------- Sorting ---------------- */

/** Soonest first, undated last. */
export function byDateAsc(a: LibraryEvent, b: LibraryEvent) {
  if (a.date === b.date) return a.title.localeCompare(b.title);
  if (a.date === null) return 1;
  if (b.date === null) return -1;
  return a.date < b.date ? -1 : 1;
}
/** Most recent first. */
export function byDateDesc(a: LibraryEvent, b: LibraryEvent) {
  return -byDateAsc(a, b);
}

/* ---------------- Collections ---------------- */

export type Scope = BranchSlug | 'all';

export function eventsIn(scope: Scope) {
  return scope === 'all' ? EVENTS : EVENTS.filter((e) => e.branch === scope);
}
export function upcomingIn(scope: Scope) {
  return eventsIn(scope).filter(isUpcoming).sort(byDateAsc);
}
export function pastIn(scope: Scope) {
  return eventsIn(scope).filter(isPast).sort(byDateDesc);
}

export function branchSummary(scope: Scope) {
  const all = eventsIn(scope);
  const week = all.filter(isThisWeek).length;
  const attention = all.filter(needsAttention).length;
  const weekText = week === 0 ? 'No events this week' : `${week} this week`;
  const attText = attention > 0 ? ` · ${attention} ${plural(attention, 'needs', 'need')} attention` : '';
  return { week, attention, text: weekText + attText };
}

export type GroupKey = 'none' | 'this-week' | 'next-week' | 'later';
export const GROUP_LABELS: Record<GroupKey, string> = {
  none: 'No date yet',
  'this-week': 'This week',
  'next-week': 'Next week',
  later: 'Later',
};

export function groupOf(e: LibraryEvent): GroupKey {
  if (e.date === null) return 'none';
  if (e.date <= THIS_WEEK_END) return 'this-week';
  if (e.date <= NEXT_WEEK_END) return 'next-week';
  return 'later';
}

/** Branch pages: grouped, soonest first, empty groups removed. "No date yet" comes first. */
export function groupUpcoming(list: LibraryEvent[]) {
  const order: GroupKey[] = ['none', 'this-week', 'next-week', 'later'];
  return order
    .map((key) => ({ key, label: GROUP_LABELS[key], events: list.filter((e) => groupOf(e) === key).sort(byDateAsc) }))
    .filter((g) => g.events.length > 0);
}

/* ---------------- My events ---------------- */

export function isMine(e: LibraryEvent) {
  return e.coordinator === CURRENT_USER.name && CURRENT_USER.branches.includes(e.branch);
}
export function myAttention() {
  return EVENTS.filter((e) => isMine(e) && needsAttention(e)).sort(byDateAsc);
}
export function myUpcoming() {
  return EVENTS.filter((e) => isMine(e) && isUpcoming(e) && !e.blocker).sort(byDateAsc);
}
export function myPast() {
  return EVENTS.filter((e) => isMine(e) && isPast(e)).sort(byDateDesc);
}

/* ---------------- Filtering & search ---------------- */

export function matchesText(e: LibraryEvent, q: string, includeBranch: boolean) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [e.title, e.room ?? '', includeBranch ? branchName(e.branch) : ''].join(' ').toLowerCase();
  return hay.includes(needle);
}

export type StatusFilter = 'all' | 'attention' | 'confirmed';
export type YearFilter = 'all' | string;

export interface Filters {
  type: 'all' | EventType;
  status: StatusFilter;
  year: YearFilter;
}
export const DEFAULT_FILTERS: Filters = { type: 'all', status: 'all', year: 'all' };

export function applyFilters(list: LibraryEvent[], f: Filters) {
  return list.filter((e) => {
    if (f.type !== 'all' && e.type !== f.type) return false;
    if (f.status === 'attention' && !needsAttention(e)) return false;
    if (f.status === 'confirmed' && (needsAttention(e) || isPast(e))) return false;
    if (f.year !== 'all' && (e.date === null || String(yearOf(e.date)) !== f.year)) return false;
    return true;
  });
}

/** Years present in a list of past events, newest first. */
export function yearsOf(list: LibraryEvent[]) {
  return Array.from(new Set(list.filter((e) => e.date).map((e) => yearOf(e.date as string)))).sort((a, b) => b - a);
}

export function globalSearch(q: string) {
  const hits = EVENTS.filter((e) => matchesText(e, q, true));
  return {
    upcoming: hits.filter(isUpcoming).sort(byDateAsc),
    past: hits.filter(isPast).sort(byDateDesc),
  };
}

/* ---------------- Dev-time data contract ---------------- */

if (import.meta.env.DEV) {
  const expected: Record<string, [number, number]> = {
    all: [22, 4],
    'west-ashley': [2, 1],
    summerville: [2, 1],
    'bees-ferry': [1, 0],
    'cooper-river': [4, 0],
    'dorchester-road': [0, 0],
    'james-island': [2, 1],
    'main-library': [6, 1],
    mcclellanville: [1, 0],
    'mount-pleasant': [1, 0],
    'north-charleston': [1, 0],
    'st-andrews': [1, 0],
    wando: [1, 0],
  };
  for (const [scope, [week, att]] of Object.entries(expected)) {
    const s = branchSummary(scope as Scope);
    console.assert(s.week === week && s.attention === att, `Data contract broken for ${scope}: ${s.week}/${s.attention}`);
  }
  console.assert(upcomingIn('west-ashley').length === 3 && pastIn('west-ashley').length === 4, 'West Ashley tab counts');
  console.assert(upcomingIn('dorchester-road').length === 0, 'Dorchester Road must have no upcoming events');
}
