import './Preview.css';

export function PreviewEmpty({ message = 'Select an event to see its details here.' }: { message?: string }) {
  return (
    <aside className="preview preview--empty" aria-label="Event preview">
      <h2 className="t-heading preview__empty-title">No event selected</h2>
      <p className="t-body preview__empty-text">{message}</p>
    </aside>
  );
}
