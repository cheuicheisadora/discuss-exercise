import './Toast.css';

/** Small message for out-of-scope actions. The live region is always mounted so updates are announced. */
export function Toast({ message }: { message: string | null }) {
  return (
    <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
      {message && <p className="toast t-body">{message}</p>}
    </div>
  );
}
