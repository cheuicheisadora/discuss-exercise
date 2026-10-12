import { useEffect, useRef, useState } from 'react';
import { DEFAULT_FILTERS, applyFilters, myPast, plural, type Filters as F } from '../selectors';
import { Filters } from './BranchView';
import { myBranchesText } from './MyEvents';
import { EmptyState, RowList, actionMessage, type Notify } from './shared';

export function MyPastEvents({ announce, notify }: { announce: (m: string) => void; notify: Notify }) {
  const past = myPast();
  const [filters, setFilters] = useState<F>(DEFAULT_FILTERS);
  const visible = applyFilters(past, filters);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    announce(visible.length ? `${visible.length} past ${plural(visible.length, 'event', 'events')}` : 'No events match these filters.');
  }, [filters.type, filters.year]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title">
          <h1 className="page-title t-display" id="page-title" tabIndex={-1}>
            My past events
          </h1>
          <p className="page-subtitle t-body">Completed events you coordinated at {myBranchesText()}</p>
        </div>
      </div>
      <div className="tabpanel">
        <Filters tab="past" filters={filters} past={past} onChange={(p) => setFilters((f) => ({ ...f, ...p }))} />
        {visible.length ? (
          <section aria-label="Past events">
            <RowList events={visible} showTag onOpen={(e) => notify(actionMessage('Open full event', e))} notify={notify} />
          </section>
        ) : (
          <EmptyState title="No events match these filters." text="Change the filters above to see more events." />
        )}
      </div>
    </div>
  );
}
