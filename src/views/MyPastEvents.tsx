import { useEffect, useRef, useState } from 'react';
import { navigate } from '../router';
import { DEFAULT_FILTERS, applyFilters, getEvent, myPast, plural, type Filters as F } from '../selectors';
import { Filters } from './BranchView';
import { myBranchesText } from './MyEvents';
import { EmptyState, RowList, SplitView, type Notify } from './shared';

export function MyPastEvents({ eventId, announce, notify }: { eventId: string | null; announce: (m: string) => void; notify: Notify }) {
  const past = myPast();
  const [filters, setFilters] = useState<F>(DEFAULT_FILTERS);
  const visible = applyFilters(past, filters);
  const selected = getEvent(eventId);
  const select = (id: string | null) => navigate({ name: 'my-past', event: id }, { replace: true });

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    announce(visible.length ? `${visible.length} past ${plural(visible.length, 'event', 'events')}` : 'No events match these filters.');
  }, [filters.type, filters.year]);

  return (
    <div className="page page--split">
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
        <SplitView
          selected={selected}
          onSelect={select}
          notify={notify}
          list={
            visible.length ? (
              <section aria-label="Past events">
                <RowList events={visible} showTag selectedId={eventId} onSelectId={select} notify={notify} />
              </section>
            ) : (
              <EmptyState title="No events match these filters." text="Change the filters above to see more events." />
            )
          }
        />
      </div>
    </div>
  );
}
