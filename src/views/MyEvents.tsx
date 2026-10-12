import { useRef, type KeyboardEvent } from 'react';
import { BRANCHES, CURRENT_USER } from '../data';
import { Button } from '../components/Button';
import { SectionLabel } from '../components/SectionLabel';
import { Tab } from '../components/Tab';
import { IconArrowRight, IconPlus } from '../icons';
import { navigate } from '../router';
import { myAttention, myUpcoming, type MyScope } from '../selectors';
import { RowList, actionMessage, type Notify } from './shared';

export function myBranchesText() {
  const names = CURRENT_USER.branches.map((s) => BRANCHES.find((b) => b.slug === s)?.name ?? s);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
}

/** Scope views, like Linear's "My issues" tabs or GitHub's "Authored by me" filters: the scope is a visible control. */
const SCOPES: { value: MyScope; label: string }[] = [
  { value: 'mine', label: 'Coordinated by me' },
  { value: 'branches', label: 'All' }, // all events at your branches (the subtitle above names them)
];

export function MyEvents({ scope, notify }: { scope: MyScope; notify: Notify }) {
  const attention = myAttention(scope);
  const upcoming = myUpcoming(scope);
  const count = (s: MyScope) => myAttention(s).length + myUpcoming(s).length;
  const tabRefs = useRef<Record<MyScope, HTMLButtonElement | null>>({ mine: null, branches: null });
  const select = (s: MyScope, focus = false) => {
    if (s !== scope) navigate({ name: 'my-events', view: s }, { replace: true });
    if (focus) tabRefs.current[s]?.focus();
  };
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = SCOPES.findIndex((x) => x.value === scope);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (i + 1) % SCOPES.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + SCOPES.length) % SCOPES.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = SCOPES.length - 1;
    if (next !== null) {
      e.preventDefault();
      select(SCOPES[next].value, true);
    }
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

      <div className="tabs" role="tablist" aria-label="Which events">
        {SCOPES.map((s) => (
          <Tab
            key={s.value}
            ref={(el) => {
              tabRefs.current[s.value] = el;
            }}
            id={`my-tab-${s.value}`}
            controls={`my-panel-${s.value}`}
            label={s.label}
            count={count(s.value)}
            state={scope === s.value ? 'selected' : 'default'}
            onSelect={() => select(s.value)}
            onKeyDown={onTabKey}
          />
        ))}
      </div>

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

      <a className="text-link" href="#/my-events/past">
        See my past events
        <IconArrowRight />
      </a>
    </div>
  );
}
