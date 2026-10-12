import { useEffect, useState } from 'react';

export type Tab = 'upcoming' | 'past';

export type Route =
  | { name: 'my-events' }
  | { name: 'my-past'; event: string | null }
  | { name: 'branch'; slug: string; tab: Tab; event: string | null }
  | { name: 'search'; q: string }
  | { name: 'classic' };

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/my-events';
  const [path, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  const seg = path.split('/').filter(Boolean);

  if (seg[0] === 'my-events' && seg[1] === 'past') return { name: 'my-past', event: params.get('event') };
  if (seg[0] === 'branch' && seg[1]) {
    return {
      name: 'branch',
      slug: decodeURIComponent(seg[1]),
      tab: params.get('tab') === 'past' ? 'past' : 'upcoming',
      event: params.get('event'),
    };
  }
  if (seg[0] === 'search') return { name: 'search', q: params.get('q') ?? '' };
  if (seg[0] === 'classic') return { name: 'classic' };
  return { name: 'my-events' };
}

export function buildHash(r: Route): string {
  switch (r.name) {
    case 'my-events':
      return '#/my-events';
    case 'my-past':
      return r.event ? `#/my-events/past?event=${encodeURIComponent(r.event)}` : '#/my-events/past';
    case 'branch': {
      const p = new URLSearchParams({ tab: r.tab });
      if (r.event) p.set('event', r.event);
      return `#/branch/${r.slug}?${p.toString()}`;
    }
    case 'search':
      return `#/search?q=${encodeURIComponent(r.q)}`;
    case 'classic':
      return '#/classic';
  }
}

const ROUTE_EVENT = 'app:route';

/** Push a new history entry, or replace the current one (used for selection changes). */
export function navigate(r: Route | string, opts: { replace?: boolean } = {}) {
  const hash = typeof r === 'string' ? r : buildHash(r);
  if (opts.replace) {
    history.replaceState(history.state, '', hash);
    window.dispatchEvent(new Event(ROUTE_EVENT));
  } else {
    window.location.hash = hash;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const update = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', update);
    window.addEventListener(ROUTE_EVENT, update);
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener(ROUTE_EVENT, update);
    };
  }, []);
  return route;
}

/** Identity of the "page" (ignores selection and tab), used to move focus on real navigation. */
export function pageKey(r: Route) {
  if (r.name === 'branch') return `branch:${r.slug}`;
  if (r.name === 'search') return `search:${r.q}`;
  return r.name;
}
