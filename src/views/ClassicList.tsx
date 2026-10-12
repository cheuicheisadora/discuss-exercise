import { useState } from 'react';
import { EVENTS, type LibraryEvent } from '../data';
import { StatusBadge } from '../components/StatusBadge';
import { branchName, byDateAsc, longDate, statusOf } from '../selectors';
import { actionMessage, type Notify } from './shared';
import './ClassicList.css';

type Col = 'date' | 'title' | 'branch' | 'room' | 'status';
const COLS: { key: Col; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'title', label: 'Title' },
  { key: 'branch', label: 'Branch' },
  { key: 'room', label: 'Room' },
  { key: 'status', label: 'Status' },
];

const STATUS_ORDER = ['Needs room', 'Not scheduled', 'Confirmed', 'Completed'];

function compare(col: Col, a: LibraryEvent, b: LibraryEvent) {
  switch (col) {
    case 'date':
      return byDateAsc(a, b);
    case 'title':
      return a.title.localeCompare(b.title) || byDateAsc(a, b);
    case 'branch':
      return branchName(a.branch).localeCompare(branchName(b.branch)) || byDateAsc(a, b);
    case 'room': {
      if (!a.room !== !b.room) return a.room ? -1 : 1; // no room last
      return (a.room ?? '').localeCompare(b.room ?? '') || byDateAsc(a, b);
    }
    case 'status':
      return STATUS_ORDER.indexOf(statusOf(a).label) - STATUS_ORDER.indexOf(statusOf(b).label) || byDateAsc(a, b);
  }
}

export function ClassicList({ announce, notify }: { announce: (m: string) => void; notify: Notify }) {
  const [sort, setSort] = useState<{ col: Col; dir: 1 | -1 }>({ col: 'date', dir: 1 });
  const rows = [...EVENTS].sort((a, b) => sort.dir * compare(sort.col, a, b));

  const toggle = (col: Col) => {
    const next = { col, dir: (sort.col === col ? -sort.dir : 1) as 1 | -1 };
    setSort(next);
    const label = COLS.find((c) => c.key === col)?.label;
    announce(`Sorted by ${label}, ${next.dir === 1 ? 'ascending' : 'descending'}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title">
          <h1 className="page-title t-display" id="page-title" tabIndex={-1}>
            Classic list
          </h1>
          <p className="page-subtitle t-body">All {rows.length} events at every branch in one table. Select a column to sort.</p>
        </div>
      </div>
      <div className="classic">
        <table className="classic__table" role="table">
          <caption className="sr-only">All events, sorted by {COLS.find((c) => c.key === sort.col)?.label}</caption>
          <thead role="rowgroup">
            <tr role="row">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  role="columnheader"
                  scope="col"
                  aria-sort={sort.col === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                >
                  <button type="button" className="classic__sort t-overline" onClick={() => toggle(c.key)}>
                    {c.label}
                    <span className="classic__arrow" aria-hidden="true">
                      {sort.col === c.key ? (sort.dir === 1 ? '▲' : '▼') : ''}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {rows.map((e) => {
              const s = statusOf(e);
              return (
                <tr key={e.id} role="row">
                  <td role="cell" data-label="Date" className="classic__date t-body">{e.date ? longDate(e.date) : e.target ?? 'No date yet'}</td>
                  <td role="cell" data-label="Title" className="classic__title-cell">
                    <button
                      type="button"
                      className="classic__title t-button"
                      onClick={() => notify(actionMessage('Open full event', e))}
                    >
                      {e.title}
                    </button>
                  </td>
                  <td role="cell" data-label="Branch" className="t-body">{branchName(e.branch)}</td>
                  <td role="cell" data-label="Room" className="t-body">{e.room ?? '—'}</td>
                  <td role="cell" data-label="Status">
                    <StatusBadge tone={s.tone} label={s.label} showIcon={s.showIcon} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
