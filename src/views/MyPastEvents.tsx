import { useEffect, useRef, useState } from 'react';
import { navigate } from '../router';
import { DEFAULT_FILTERS, applyFilters, myPast, plural, type Filters as F, type MyScope } from '../selectors';
import { Filters } from './BranchView';
import { myBranchesText } from './MyEvents';
import { ScopeTabs } from './ScopeTabs';
import { EmptyState, RowList, actionMessage, type Notify } from './shared';

export function MyPastEvents({ scope, announce, notify }: { scope: MyScope; announce: (m: string) => void; notify: Notify }) {
  const past = myPast(scope);
  const [filters, setFilters] = useState<F>(DEFAULT_FILTERS);
  const visible = applyFilters(past, filters);
  const select = (s: MyScope) => {
    if (s !== scope) navigate({ name: 'my-past', view: s }, { replace: true });
  };

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    announce(visible.length ? `${visible.length} past ${plural(visible.length, 'event', 'events')}` : 'No events match these filters.');
  }, [filters.type, filters.year, scope]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title">
          <h1 className="page-title t-display" id="page-title" tabIndex={-1}>
            My past events
          </h1>
          <p className="page-subtitle t-body">Your branches: {myBranchesText()}</p>
        </div>
      </div>
      <ScopeTabs scope={scope} counts={{ mine: myPast('mine').length, branches: myPast('branches').length }} onSelect={select} idPrefix="past" />
      <div key={scope} className="tabpanel" role="tabpanel" id={`past-panel-${scope}`} aria-labelledby={`past-tab-${scope}`}>
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
