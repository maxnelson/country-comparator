import React from 'react';

// The picker's search field: 44px, subtle fill, blue focus outline.
export function SearchInput({ value, onChange, placeholder = 'Search', autoFocus, inputRef, onKeyDown, forceFocus = false, style, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const on = focused || forceFocus;
  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      autoFocus={autoFocus}
      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
      onChange={(e) => onChange && onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...rest}
      style={{
        width: '100%', height: 'var(--touch-target)', padding: '0 var(--space-3)',
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
        background: on ? 'var(--color-bg)' : 'var(--color-bg-subtle)',
        color: 'var(--color-text)', font: 'inherit', fontSize: 'var(--font-size-base)',
        outline: on ? '2px solid var(--color-accent)' : 'none', outlineOffset: '-1px',
        ...style,
      }}
    />
  );
}
