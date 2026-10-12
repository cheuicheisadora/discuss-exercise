import { BRANCHES, CURRENT_USER } from '../data';
import { Button } from '../components/Button';
import { SectionLabel } from '../components/SectionLabel';
import { IconArrowRight, IconPlus } from '../icons';
import { navigate } from '../router';
import { myAttention, myUpcoming, type MyScope } from '../selectors';
import { ScopeTabs } from './ScopeTabs';
import { RowList, actionMessage, type Notify } from './shared';

export function myBranchesText() {
  const names = CURRENT_USER.branches.map((s) => BRANCHES.find((b) => b.slug === s)?.name ?? s);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
}

export function MyEvents({ scope, notify }: { scope: MyScope; notify: Notify }) {
  const attention = myAttention(scope);
  const upcoming = myUpcoming(scope);
  const count = (s: MyScope) => myAttention(s).length + myUpcoming(s).length;
  const select = (s: MyScope) => {
    if (s !== scope) navigate({ name: 'my-events', view: s }, { replace: true });
  };
  const open = (e: Parameters<typeof actionMessage>[1]) => notify(actionMessage('Open full event', e));

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title">
          <h1 className="page-title t-display" id="page-title" tabIndex={-1}>
            My events
          </h1>
          <p className="page-subtitle t-body">Your branches: {myBranchesText()}</p>
        </div>
        <Button style="primary" size="large" label="New event" icon={<IconPlus />} onClick={() => notify(actionMessage('New event'))} />
      </div>

      <ScopeTabs scope={scope} counts={{ mine: count('mine'), branches: count('branches') }} onSelect={select} idPrefix="my" />

      <div key={scope} className="my-events__panel" role="tabpanel" id={`my-panel-${scope}`} aria-labelledby={`my-tab-${scope}`}>
        {attention.length > 0 && (
          <section className="section" aria-labelledby="sec-attention">
            <SectionLabel as="h2" id="sec-attention" label="Needs attention" showCount count={attention.length} />
            <RowList events={attention} showTag onOpen={open} notify={notify} />
          </section>
        )}

        <section className="section" aria-labelledby="sec-upcoming">
          <SectionLabel as="h2" id="sec-upcoming" label="Upcoming" />
          <RowList events={upcoming} showTag onOpen={open} notify={notify} />
        </section>
      </div>

      {/* The past-events link follows the tab: your own past events, or all past events at your branches. */}
      <a className="text-link" href={scope === 'branches' ? '#/my-events/past?view=branches' : '#/my-events/past'}>
        {scope === 'branches' ? 'See all past events' : 'See my past events'}
        <IconArrowRight />
      </a>
    </div>
  );
}
