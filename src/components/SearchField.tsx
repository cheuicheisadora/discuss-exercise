import { forwardRef, type InputHTMLAttributes } from 'react';
import { IconSearch } from '../icons';
import './SearchField.css';

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  placeholder: string;
  /** Shows the "/" shortcut hint (top bar only). */
  showShortcut?: boolean;
  /** Accessible name. Defaults to the placeholder. */
  label?: string;
  variant?: 'global' | 'page' | 'menu';
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { placeholder, showShortcut = false, label, variant = 'page', className, ...input },
  ref,
) {
  return (
    <div className={`search-field search-field--${variant} ${className ?? ''}`}>
      <IconSearch className="search-field__icon" />
      <input
        ref={ref}
        type="search"
        className="search-field__input t-body-regular"
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        autoComplete="off"
        spellCheck={false}
        {...input}
      />
      {showShortcut && (
        <kbd className="search-field__shortcut t-label" aria-hidden="true">
          /
        </kbd>
      )}
    </div>
  );
});
