import { usePresence } from '../motion';
import './Toast.css';

/** Small message for out-of-scope actions. The live region is always mounted so updates are announced. */
export function Toast({ message }: { message: string | null }) {
  const { item, exiting } = usePresence(message, '--duration-base');
  return (
    <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
      {item && <p className={`toast t-body ${exiting ? 'toast--exiting' : ''}`}>{item}</p>}
    </div>
  );
}
