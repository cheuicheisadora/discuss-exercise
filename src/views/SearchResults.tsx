import { SectionLabel } from '../components/SectionLabel';
import { globalSearch, plural } from '../selectors';
import { branchHref } from './MyEvents';
import { EmptyState, RowList, noMatchText, type Notify } from './shared';

export function SearchResults({ q, notify }: { q: string; notify: Notify }) {
  const query = q.trim();
  const { upcoming, past } = globalSearch(query);
  const total = upcoming.length + past.length;
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title">
          <h1 className="page-title t-display" id="page-title" tabIndex={-1}>
            Search results
          </h1>
          <p className="page-subtitle t-body">
            {query ? `${total} ${plural(total, 'event matches', 'events match')} "${query}" across all branches` : 'Search every branch by event title, branch or room.'}
          </p>
        </div>
      </div>

      {!query && <EmptyState title="Type a word in the search box above and press Enter." />}
      {query && total === 0 && <EmptyState title={noMatchText(query)} />}

      {upcoming.length > 0 && (
        <section className="section" aria-labelledby="res-upcoming">
          <SectionLabel as="h2" id="res-upcoming" label={`Upcoming · ${upcoming.length}`} />
          <RowList events={upcoming} showTag hrefFor={branchHref} notify={notify} />
        </section>
      )}
      {past.length > 0 && (
        <section className="section" aria-labelledby="res-past">
          <SectionLabel as="h2" id="res-past" label={`Past · ${past.length}`} />
          <RowList events={past} showTag hrefFor={branchHref} notify={notify} />
        </section>
      )}
    </div>
  );
}
