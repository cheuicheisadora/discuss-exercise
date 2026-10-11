import './DateTile.css';

export interface DateTileProps {
  state?: 'default' | 'empty';
  month: string;
  day?: string;
}

export function DateTile({ state = 'default', month, day }: DateTileProps) {
  return (
    <span className={`date-tile date-tile--${state}`}>
      <span className="date-tile__month t-overline">{month}</span>
      <span className="date-tile__day t-date" aria-hidden={state === 'empty' || undefined}>
        {state === 'empty' ? '–' : day}
      </span>
      {state === 'empty' && <span className="sr-only">No date yet</span>}
    </span>
  );
}
