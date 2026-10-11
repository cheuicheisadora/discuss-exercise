/**
 * Single source of truth for the prototype.
 * Every number in the UI is computed from this file (see selectors.ts).
 */

/** "Today" is fixed. Never use the system date. */
export const TODAY = '2026-10-12'; // Monday
export const THIS_WEEK_END = '2026-10-18';
export const NEXT_WEEK_END = '2026-10-25';

export type BranchSlug =
  | 'west-ashley'
  | 'summerville'
  | 'bees-ferry'
  | 'cooper-river'
  | 'dorchester-road'
  | 'james-island'
  | 'main-library'
  | 'mcclellanville'
  | 'mount-pleasant'
  | 'north-charleston'
  | 'st-andrews'
  | 'wando';

export interface Branch {
  slug: BranchSlug;
  name: string;
}

export const BRANCHES: Branch[] = [
  { slug: 'west-ashley', name: 'West Ashley' },
  { slug: 'summerville', name: 'Summerville' },
  { slug: 'bees-ferry', name: 'Bees Ferry' },
  { slug: 'cooper-river', name: 'Cooper River' },
  { slug: 'dorchester-road', name: 'Dorchester Road' },
  { slug: 'james-island', name: 'James Island' },
  { slug: 'main-library', name: 'Main Library' },
  { slug: 'mcclellanville', name: 'McClellanville' },
  { slug: 'mount-pleasant', name: 'Mount Pleasant' },
  { slug: 'north-charleston', name: 'North Charleston' },
  { slug: 'st-andrews', name: 'St. Andrews' },
  { slug: 'wando', name: 'Wando' },
];

export const CURRENT_USER = {
  name: 'Ana R.',
  role: 'Events coordinator',
  initials: 'AR',
  branches: ['west-ashley', 'summerville'] as BranchSlug[],
};

export type EventType = 'kids' | 'talks' | 'workshops' | 'clubs' | 'community';

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'kids', label: 'Kids & teens' },
  { value: 'talks', label: 'Talks' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'clubs', label: 'Clubs' },
  { value: 'community', label: 'Community' },
];

/** A blocker makes an upcoming event "Needs attention". */
export type Blocker = 'needs-room' | 'not-scheduled';

export interface LibraryEvent {
  id: string;
  branch: BranchSlug;
  title: string;
  type: EventType;
  /** ISO date (YYYY-MM-DD). null = not scheduled yet. */
  date: string | null;
  time?: string;
  room?: string;
  coordinator: string;
  blocker?: Blocker;
  /** Undated events only: e.g. "Target: late October" and the month shown on the empty date tile. */
  target?: string;
  targetMonth?: string;
  /** Upcoming details */
  registrations?: string;
  ageGroup?: string;
  /** Past details */
  attended?: number;
  capacity?: string;
  notes?: string;
}

const ANA = 'Ana R.';

export const EVENTS: LibraryEvent[] = [
  /* ---------------- West Ashley ---------------- */
  {
    id: 'wa-kids-story-hour', branch: 'west-ashley', title: 'Kids story hour', type: 'kids',
    date: '2026-10-14', time: '10:00 am', room: 'Room A', coordinator: ANA,
    registrations: '18 of 25 spots', ageGroup: 'Ages 3 to 6',
    notes: 'Bring the felt board. Maria (volunteer) helps with check-in.',
  },
  {
    id: 'wa-author-talk-local-history', branch: 'west-ashley', title: 'Author talk: local history', type: 'talks',
    date: '2026-10-15', time: '6:00 pm', coordinator: ANA, blocker: 'needs-room',
    registrations: '27 of 50 spots',
    notes: 'Speaker is confirmed. We still need a room for about 50 people.',
  },
  {
    id: 'wa-resume-workshop', branch: 'west-ashley', title: 'Resume workshop', type: 'workshops',
    date: '2026-10-24', time: '2:00 pm', room: 'Room B', coordinator: ANA,
    registrations: '9 of 16 spots', ageGroup: 'Adults',
    notes: 'Book the laptop cart the day before.',
  },
  {
    id: 'wa-author-talk-poetry', branch: 'west-ashley', title: 'Author talk: poetry', type: 'talks',
    date: '2026-09-18', time: '6:00 pm', room: 'Room B', coordinator: ANA,
    attended: 21, capacity: '40 spots', registrations: '26',
    notes: 'Good turnout from the high school poetry club.',
  },
  {
    id: 'wa-kids-story-hour-sep', branch: 'west-ashley', title: 'Kids story hour', type: 'kids',
    date: '2026-09-09', time: '10:00 am', room: 'Room A', coordinator: ANA,
    attended: 15, capacity: '25 spots', registrations: '19',
  },
  {
    id: 'wa-community-meeting', branch: 'west-ashley', title: 'Community meeting', type: 'community',
    date: '2026-08-27', time: '6:30 pm', room: 'Main hall', coordinator: ANA,
    attended: 40, capacity: '80 spots', registrations: 'No registration',
    notes: 'Neighbors asked for more evening programs.',
  },
  {
    id: 'wa-halloween-crafts', branch: 'west-ashley', title: 'Halloween crafts', type: 'kids',
    date: '2025-10-30', time: '4:00 pm', room: 'Room A', coordinator: ANA,
    attended: 34, capacity: '30 spots + walk-ins', registrations: '41 (11 on waitlist)',
    notes: 'Sold out in 2 days. Next year, add a second session and a bigger room.',
  },

  /* ---------------- Summerville ---------------- */
  {
    id: 'sv-digital-skills-webinar', branch: 'summerville', title: 'Digital skills webinar', type: 'workshops',
    date: null, target: 'Target: late October', targetMonth: 'Oct', coordinator: ANA, blocker: 'not-scheduled',
    registrations: 'Not open yet',
    notes: 'Waiting for the presenter to confirm a date.',
  },
  {
    id: 'sv-teen-game-night', branch: 'summerville', title: 'Teen game night', type: 'kids',
    date: '2026-10-23', time: '6:30 pm', room: 'Room C', coordinator: ANA,
    registrations: '14 of 20 spots', ageGroup: 'Ages 13 to 18',
  },
  {
    id: 'sv-chess-club', branch: 'summerville', title: 'Chess club', type: 'clubs',
    date: '2026-10-13', time: '4:00 pm', room: 'Room 2', coordinator: 'Marcus T.',
    registrations: '11 of 16 spots',
  },
  {
    id: 'sv-book-club-mystery', branch: 'summerville', title: 'Book club: mystery night', type: 'clubs',
    date: '2026-10-15', time: '7:00 pm', room: 'Reading room', coordinator: 'Jen L.',
    registrations: '12 of 15 spots', ageGroup: 'Adults',
  },
  {
    id: 'sv-teen-movie-afternoon', branch: 'summerville', title: 'Teen movie afternoon', type: 'kids',
    date: '2026-09-26', time: '2:00 pm', room: 'Room C', coordinator: ANA,
    attended: 18, capacity: '30 spots', registrations: '22',
  },
  {
    id: 'sv-chess-club-sep', branch: 'summerville', title: 'Chess club', type: 'clubs',
    date: '2026-09-29', time: '4:00 pm', room: 'Room 2', coordinator: 'Marcus T.',
    attended: 12, capacity: '16 spots', registrations: '14',
  },
  {
    id: 'sv-book-club-sep', branch: 'summerville', title: 'Book club: historical fiction', type: 'clubs',
    date: '2026-09-17', time: '7:00 pm', room: 'Reading room', coordinator: 'Jen L.',
    attended: 13, capacity: '15 spots', registrations: '15',
  },

  /* ---------------- Bees Ferry ---------------- */
  {
    id: 'bf-toddler-time', branch: 'bees-ferry', title: 'Toddler time', type: 'kids',
    date: '2026-10-16', time: '10:30 am', room: 'Story room', coordinator: 'Priya S.',
    registrations: '12 of 20 spots', ageGroup: 'Ages 1 to 3',
  },
  {
    id: 'bf-garden-talk', branch: 'bees-ferry', title: 'Fall garden talk', type: 'talks',
    date: '2026-10-28', time: '6:00 pm', room: 'Meeting room', coordinator: 'Priya S.',
    registrations: '8 of 30 spots',
  },
  {
    id: 'bf-seed-swap', branch: 'bees-ferry', title: 'Seed swap', type: 'community',
    date: '2026-09-12', time: '11:00 am', room: 'Meeting room', coordinator: 'Priya S.',
    attended: 26, capacity: 'Drop-in', registrations: 'No registration',
  },
  {
    id: 'bf-toddler-time-sep', branch: 'bees-ferry', title: 'Toddler time', type: 'kids',
    date: '2026-09-18', time: '10:30 am', room: 'Story room', coordinator: 'Priya S.',
    attended: 14, capacity: '20 spots', registrations: '17',
  },

  /* ---------------- Cooper River ---------------- */
  {
    id: 'cr-esl-conversation', branch: 'cooper-river', title: 'English conversation group', type: 'clubs',
    date: '2026-10-12', time: '5:30 pm', room: 'Room 1', coordinator: 'David K.',
    registrations: '10 of 12 spots', ageGroup: 'Adults',
  },
  {
    id: 'cr-lego-lab', branch: 'cooper-river', title: 'Lego lab', type: 'kids',
    date: '2026-10-14', time: '3:30 pm', room: 'Room 2', coordinator: 'David K.',
    registrations: '16 of 16 spots', ageGroup: 'Ages 6 to 10',
  },
  {
    id: 'cr-tax-help', branch: 'cooper-river', title: 'Tax help for seniors', type: 'workshops',
    date: '2026-10-16', time: '11:00 am', room: 'Study room 3', coordinator: 'Lena M.',
    registrations: '5 of 8 spots', ageGroup: 'Ages 60 and up',
  },
  {
    id: 'cr-knitting-circle', branch: 'cooper-river', title: 'Knitting circle', type: 'clubs',
    date: '2026-10-17', time: '2:00 pm', room: 'Room 1', coordinator: 'Lena M.',
    registrations: 'Drop-in, no registration',
  },
  {
    id: 'cr-esl-conversation-2', branch: 'cooper-river', title: 'English conversation group', type: 'clubs',
    date: '2026-10-19', time: '5:30 pm', room: 'Room 1', coordinator: 'David K.',
    registrations: '7 of 12 spots', ageGroup: 'Adults',
  },
  {
    id: 'cr-lego-lab-sep', branch: 'cooper-river', title: 'Lego lab', type: 'kids',
    date: '2026-09-30', time: '3:30 pm', room: 'Room 2', coordinator: 'David K.',
    attended: 17, capacity: '16 spots + waitlist', registrations: '20 (4 on waitlist)',
  },
  {
    id: 'cr-job-fair', branch: 'cooper-river', title: 'Job fair', type: 'community',
    date: '2026-08-20', time: '10:00 am', room: 'Main hall', coordinator: 'Lena M.',
    attended: 62, capacity: '100 spots', registrations: '71',
  },

  /* ---------------- Dorchester Road (no upcoming events) ---------------- */
  {
    id: 'dr-family-movie-night', branch: 'dorchester-road', title: 'Family movie night', type: 'community',
    date: '2026-09-25', time: '6:00 pm', room: 'Meeting room', coordinator: 'Rosa G.',
    attended: 38, capacity: '50 spots', registrations: '41',
  },
  {
    id: 'dr-craft-hour', branch: 'dorchester-road', title: 'Craft hour', type: 'kids',
    date: '2026-08-14', time: '3:00 pm', room: 'Room A', coordinator: 'Rosa G.',
    attended: 16, capacity: '20 spots', registrations: '18',
  },
  {
    id: 'dr-photo-workshop', branch: 'dorchester-road', title: 'Phone photography workshop', type: 'workshops',
    date: '2025-11-08', time: '1:00 pm', room: 'Meeting room', coordinator: 'Rosa G.',
    attended: 11, capacity: '15 spots', registrations: '13',
  },

  /* ---------------- James Island ---------------- */
  {
    id: 'ji-baby-rhymes', branch: 'james-island', title: 'Baby rhymes', type: 'kids',
    date: '2026-10-13', time: '10:00 am', room: 'Story room', coordinator: 'Tom B.',
    registrations: '15 of 20 spots', ageGroup: 'Ages 0 to 2',
  },
  {
    id: 'ji-local-authors-fair', branch: 'james-island', title: 'Local authors fair', type: 'talks',
    date: '2026-10-17', time: '1:00 pm', coordinator: 'Tom B.', blocker: 'needs-room',
    registrations: 'Drop-in, no registration',
    notes: '12 authors confirmed. Needs a room with tables for each author.',
  },
  {
    id: 'ji-poetry-open-mic', branch: 'james-island', title: 'Poetry open mic', type: 'talks',
    date: '2026-11-05', time: '7:00 pm', room: 'Meeting room', coordinator: 'Tom B.',
    registrations: '6 of 20 readers',
  },
  {
    id: 'ji-poetry-open-mic-sep', branch: 'james-island', title: 'Poetry open mic', type: 'talks',
    date: '2026-09-03', time: '7:00 pm', room: 'Meeting room', coordinator: 'Tom B.',
    attended: 24, capacity: '40 spots', registrations: '14 readers',
  },
  {
    id: 'ji-baby-rhymes-sep', branch: 'james-island', title: 'Baby rhymes', type: 'kids',
    date: '2026-09-22', time: '10:00 am', room: 'Story room', coordinator: 'Tom B.',
    attended: 19, capacity: '20 spots', registrations: '20',
  },

  /* ---------------- Main Library (long list) ---------------- */
  {
    id: 'ml-tech-help-desk', branch: 'main-library', title: 'Tech help desk', type: 'workshops',
    date: '2026-10-12', time: '1:00 pm', room: 'Tech lab', coordinator: 'Rosa G.',
    registrations: 'Drop-in, no registration',
  },
  {
    id: 'ml-genealogy-basics', branch: 'main-library', title: 'Genealogy basics', type: 'workshops',
    date: '2026-10-13', time: '6:00 pm', room: 'Local history room', coordinator: 'Rosa G.',
    registrations: '18 of 24 spots', ageGroup: 'Adults',
  },
  {
    id: 'ml-bilingual-storytime', branch: 'main-library', title: 'Bilingual storytime', type: 'kids',
    date: '2026-10-14', time: '10:30 am', room: "Children's room", coordinator: 'Sam W.',
    registrations: '22 of 30 spots', ageGroup: 'Ages 2 to 6',
  },
  {
    id: 'ml-film-screening', branch: 'main-library', title: 'Documentary screening', type: 'community',
    date: '2026-10-15', time: '6:30 pm', coordinator: 'Sam W.', blocker: 'needs-room',
    registrations: '64 of 90 spots',
    notes: 'Auditorium is double booked. Needs a room with a projector.',
  },
  {
    id: 'ml-writers-group', branch: 'main-library', title: 'Writers group', type: 'clubs',
    date: '2026-10-16', time: '5:00 pm', room: 'Room 3', coordinator: 'Rosa G.',
    registrations: '9 of 12 spots', ageGroup: 'Adults',
  },
  {
    id: 'ml-saturday-science', branch: 'main-library', title: 'Saturday science', type: 'kids',
    date: '2026-10-17', time: '11:00 am', room: "Children's room", coordinator: 'Sam W.',
    registrations: '20 of 24 spots', ageGroup: 'Ages 7 to 12',
  },
  {
    id: 'ml-tech-help-desk-2', branch: 'main-library', title: 'Tech help desk', type: 'workshops',
    date: '2026-10-19', time: '1:00 pm', room: 'Tech lab', coordinator: 'Rosa G.',
    registrations: 'Drop-in, no registration',
  },
  {
    id: 'ml-citizenship-class', branch: 'main-library', title: 'Citizenship test prep', type: 'workshops',
    date: '2026-10-20', time: '6:00 pm', room: 'Room 3', coordinator: 'Rosa G.',
    registrations: '11 of 15 spots', ageGroup: 'Adults',
  },
  {
    id: 'ml-teen-anime-club', branch: 'main-library', title: 'Teen anime club', type: 'kids',
    date: '2026-10-22', time: '4:00 pm', room: 'Teen zone', coordinator: 'Sam W.',
    registrations: '13 of 25 spots', ageGroup: 'Ages 13 to 18',
  },
  {
    id: 'ml-author-talk-jazz', branch: 'main-library', title: 'Author talk: Charleston jazz', type: 'talks',
    date: '2026-10-29', time: '6:30 pm', room: 'Auditorium', coordinator: 'Sam W.',
    registrations: '48 of 120 spots',
  },
  {
    id: 'ml-halloween-party', branch: 'main-library', title: 'Halloween party', type: 'kids',
    date: '2026-10-31', time: '3:00 pm', room: "Children's room", coordinator: 'Sam W.',
    registrations: '40 of 40 spots', ageGroup: 'Ages 3 to 10',
  },
  {
    id: 'ml-medicare-workshop', branch: 'main-library', title: 'Medicare basics', type: 'workshops',
    date: '2026-11-04', time: '2:00 pm', room: 'Room 3', coordinator: 'Rosa G.',
    registrations: '10 of 30 spots', ageGroup: 'Ages 60 and up',
  },
  {
    id: 'ml-chess-tournament', branch: 'main-library', title: 'Chess tournament', type: 'clubs',
    date: '2026-11-07', time: '10:00 am', room: 'Auditorium', coordinator: 'Rosa G.',
    registrations: '24 of 48 players',
  },
  {
    id: 'ml-holiday-concert', branch: 'main-library', title: 'Holiday concert', type: 'community',
    date: '2026-12-05', time: '4:00 pm', room: 'Auditorium', coordinator: 'Sam W.',
    registrations: '35 of 120 spots',
  },
  {
    id: 'ml-banned-books-talk', branch: 'main-library', title: 'Banned books talk', type: 'talks',
    date: '2026-10-02', time: '6:00 pm', room: 'Auditorium', coordinator: 'Sam W.',
    attended: 55, capacity: '120 spots', registrations: '63',
  },
  {
    id: 'ml-tech-help-desk-oct', branch: 'main-library', title: 'Tech help desk', type: 'workshops',
    date: '2026-10-05', time: '1:00 pm', room: 'Tech lab', coordinator: 'Rosa G.',
    attended: 9, capacity: 'Drop-in', registrations: 'No registration',
  },
  {
    id: 'ml-writers-group-sep', branch: 'main-library', title: 'Writers group', type: 'clubs',
    date: '2026-09-18', time: '5:00 pm', room: 'Room 3', coordinator: 'Rosa G.',
    attended: 10, capacity: '12 spots', registrations: '12',
  },
  {
    id: 'ml-summer-reading-finale', branch: 'main-library', title: 'Summer reading finale', type: 'kids',
    date: '2026-08-08', time: '11:00 am', room: 'Auditorium', coordinator: 'Sam W.',
    attended: 120, capacity: '120 spots + lawn', registrations: '134',
  },

  /* ---------------- Smaller branches (1 this week each) ---------------- */
  {
    id: 'mc-coastal-history', branch: 'mcclellanville', title: 'Coastal history talk', type: 'talks',
    date: '2026-10-15', time: '6:00 pm', room: 'Community room', coordinator: 'Tom B.',
    registrations: '14 of 35 spots',
  },
  {
    id: 'mc-quilting', branch: 'mcclellanville', title: 'Quilting bee', type: 'clubs',
    date: '2026-09-10', time: '1:00 pm', room: 'Community room', coordinator: 'Tom B.',
    attended: 9, capacity: '12 spots', registrations: '10',
  },
  {
    id: 'mp-tai-chi', branch: 'mount-pleasant', title: 'Tai chi in the morning', type: 'community',
    date: '2026-10-14', time: '9:00 am', room: 'Program room', coordinator: 'Lena M.',
    registrations: '17 of 20 spots', ageGroup: 'Adults',
  },
  {
    id: 'mp-teen-coding', branch: 'mount-pleasant', title: 'Teen coding club', type: 'kids',
    date: '2026-10-21', time: '4:30 pm', room: 'Program room', coordinator: 'Lena M.',
    registrations: '8 of 12 spots', ageGroup: 'Ages 12 to 17',
  },
  {
    id: 'mp-book-sale', branch: 'mount-pleasant', title: 'Friends of the library book sale', type: 'community',
    date: '2026-09-19', time: '9:00 am', room: 'Program room', coordinator: 'Lena M.',
    attended: 85, capacity: 'Drop-in', registrations: 'No registration',
  },
  {
    id: 'nc-homework-help', branch: 'north-charleston', title: 'Homework help', type: 'kids',
    date: '2026-10-13', time: '4:00 pm', room: 'Study room', coordinator: 'David K.',
    registrations: 'Drop-in, no registration', ageGroup: 'Ages 8 to 14',
  },
  {
    id: 'nc-anime-club', branch: 'north-charleston', title: 'Anime club', type: 'clubs',
    date: '2026-09-24', time: '4:00 pm', room: 'Teen room', coordinator: 'David K.',
    attended: 21, capacity: '25 spots', registrations: '23',
  },
  {
    id: 'sa-craft-night', branch: 'st-andrews', title: 'Adult craft night', type: 'workshops',
    date: '2026-10-15', time: '6:00 pm', room: 'Craft room', coordinator: 'Priya S.',
    registrations: '15 of 18 spots', ageGroup: 'Adults',
  },
  {
    id: 'sa-movie-matinee', branch: 'st-andrews', title: 'Movie matinee', type: 'community',
    date: '2026-09-27', time: '2:00 pm', room: 'Meeting room', coordinator: 'Priya S.',
    attended: 30, capacity: '45 spots', registrations: 'No registration',
  },
  {
    id: 'wd-robotics-club', branch: 'wando', title: 'Robotics club', type: 'kids',
    date: '2026-10-16', time: '4:00 pm', room: 'Makerspace', coordinator: 'Sam W.',
    registrations: '10 of 12 spots', ageGroup: 'Ages 10 to 14',
  },
  {
    id: 'wd-maker-faire', branch: 'wando', title: 'Mini maker faire', type: 'community',
    date: '2026-09-12', time: '10:00 am', room: 'Makerspace', coordinator: 'Sam W.',
    attended: 70, capacity: 'Drop-in', registrations: 'No registration',
  },
];
