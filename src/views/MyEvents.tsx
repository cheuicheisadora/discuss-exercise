import { BRANCHES, CURRENT_USER } from '../data';
import { Button } from '../components/Button';
import { SectionLabel } from '../components/SectionLabel';
import { IconArrowRight, IconPlus } from '../icons';
import { myAttention, myUpcoming } from '../selectors';
import { RowList, actionMessage, type Notify } from './shared';

export function myBranchesText() {
  const names = CURRENT_USER.branches.map((s) => BRANCHES.find((b) => b.slug === s)?.name ?? s);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
}

export function MyEvents({ notify }: { notify: Notify }) {
  const attention = myAttention();
  const upcoming = myUpcoming();
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title">
          <h1 className="page-title t-display" id="page-title" tabIndex={-1}>
            My events
          </h1>
          <p className="page-subtitle t-body">
            Only events you coordinate at {myBranchesText()}. To see everything at a branch, use Branches.
          </p>
        </div>
        <Button style="primary" size="large" label="New event" icon={<IconPlus />} onClick={() => notify(actionMessage('New event'))} />
      </div>

      {attention.length > 0 && (
        <section className="section" aria-labelledby="sec-attention">
          <SectionLabel as="h2" id="sec-attention" label="Needs attention" showCount count={attention.length} />
          <RowList events={attention} showTag onOpen={(e) => notify(actionMessage('Open full event', e))} notify={notify} />
        </section>
      )}

      <section className="section" aria-labelledby="sec-upcoming">
        <SectionLabel as="h2" id="sec-upcoming" label="Upcoming" />
        <RowList events={upcoming} showTag onOpen={(e) => notify(actionMessage('Open full event', e))} notify={notify} />
      </section>

      <a className="text-link" href="#/my-events/past">
        See my past events
        <IconArrowRight />
      </a>
    </div>
  );
}
