import { useState } from 'react';
import { EVENTS, type LibraryEvent } from '../data';
import { StatusBadge } from '../components/StatusBadge';
import { branchName, byDateAsc, longDate, statusOf } from '../selectors';
import { branchHref } from './MyEvents';
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

export function ClassicList({ announce }: { announce: (m: string) => void }) {
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
        <table className="classic__table">
          <caption className="sr-only">All events, sorted by {COLS.find((c) => c.key === sort.col)?.label}</caption>
          <thead>
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.key}
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
          <tbody>
            {rows.map((e) => {
              const s = statusOf(e);
              return (
                <tr key={e.id}>
                  <td className="t-body">{e.date ? longDate(e.date) : e.target ?? 'No date yet'}</td>
                  <td>
                    <a className="classic__title t-button" href={branchHref(e)}>
                      {e.title}
                    </a>
                  </td>
                  <td className="t-body">{branchName(e.branch)}</td>
                  <td className="t-body">{e.room ?? '—'}</td>
                  <td>
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
