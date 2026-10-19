import React from 'react';
import { Icon } from './Icon.jsx';
import { useInteraction, focusRing } from './interaction.js';

// The app's text button (toolbar: "Add metric", "Edit" / "Done").
export function Button({ variant = 'default', icon, children, disabled = false, onClick, type = 'button', style, ...rest }) {
  const { hover, press, focus, handlers } = useInteraction();
  const active = variant === 'primary';
  const live = !disabled;
  let bg = 'var(--color-bg)', border = 'var(--color-border)', color = 'var(--color-text)';
  if (active) {
    bg = border = live && (hover || press) ? 'var(--color-brand-stronger)' : 'var(--color-brand-strong)';
    color = 'var(--color-text-inverse)';
  } else if (live && hover) {
    bg = 'var(--color-brand-tint)'; border = 'var(--color-brand-tint-border)'; color = 'var(--color-brand-strong)';
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...handlers}
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
        minHeight: 'var(--touch-target)',
        padding: icon ? '0 var(--space-4) 0 var(--space-3)' : '0 var(--space-4)',
        border: `1px solid ${border}`, borderRadius: 'var(--radius-md)',
        background: bg, color,
        font: 'inherit', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1,
        transition: 'background var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast)',
        ...(focus ? focusRing : null),
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}
