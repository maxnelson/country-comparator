import React from 'react';
import { Icon } from './Icon.jsx';
import { useInteraction, focusRing } from './interaction.js';

// Round / small icon controls from the app:
//   add    — solid blue circle (Add country), 36px (sm) or 44px (md), 44px hit area
//   remove — red 24px circle with ×, 44px hit area (Edit mode)
//   handle — transparent 28px grip, 44px hit area (Edit mode drag)
//   close  — 44px ghost circle (picker header)
export function IconButton({ variant = 'add', size = 'sm', label, disabled = false, onClick, style, ...rest }) {
  const { hover, press, focus, handlers } = useInteraction();
  const live = !disabled;
  const spec = {
    add: { box: size === 'md' ? 44 : 36, icon: size === 'md' ? 20 : 18, glyph: 'plus', radius: 'var(--radius-full)', hit: size === 'md' ? 0 : -4 },
    remove: { box: 24, icon: 14, glyph: 'remove', radius: 'var(--radius-full)', hit: -10 },
    handle: { box: 28, icon: 16, glyph: 'grip', radius: 'var(--radius-sm)', hit: -8 },
    close: { box: 44, icon: 20, glyph: 'close', radius: 'var(--radius-full)', hit: 0 },
  }[variant];
  let bg = 'transparent', color = 'var(--color-text-muted)', shadow = 'none';
  if (variant === 'add') {
    bg = !live ? 'var(--color-disabled-fill)' : hover ? 'var(--color-brand-stronger)' : 'var(--color-brand-strong)';
    color = 'var(--color-text-inverse)';
    shadow = live ? 'var(--shadow-sm)' : 'none';
  } else if (variant === 'remove') {
    bg = live && (hover || focus) ? 'var(--color-danger-strong)' : 'var(--color-danger)';
    color = 'var(--color-text-inverse)';
  } else if (variant === 'handle') {
    color = hover || focus ? 'var(--color-text-muted)' : 'var(--color-handle)';
    bg = hover || focus ? 'var(--color-bg-subtle)' : 'transparent';
  } else if (variant === 'close') {
    bg = hover ? 'var(--color-bg-subtle)' : 'transparent';
    color = hover ? 'var(--color-text)' : 'var(--color-text-muted)';
  }
  const scale = live && press ? (variant === 'remove' ? 0.92 : variant === 'add' ? 0.94 : 1) : 1;
  return (
    <button
      type="button"
      aria-label={label}
      title={variant === 'add' ? label : undefined}
      disabled={disabled}
      onClick={onClick}
      {...handlers}
      {...rest}
      style={{
        position: 'relative', flex: 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: spec.box, height: spec.box, padding: 0, border: 0,
        borderRadius: spec.radius, background: bg, color, boxShadow: shadow,
        cursor: disabled ? 'default' : variant === 'handle' ? (press ? 'grabbing' : 'grab') : 'pointer',
        opacity: variant === 'remove' && disabled ? 0.35 : 1,
        transform: `scale(${scale})`,
        transition: 'background var(--duration-fast), transform var(--duration-fast)',
        touchAction: variant === 'handle' ? 'none' : undefined,
        ...(focus && variant !== 'remove' ? focusRing : null),
        ...style,
      }}
    >
      {spec.hit ? <span aria-hidden="true" style={{ position: 'absolute', inset: spec.hit }} /> : null}
      <Icon name={spec.glyph} size={spec.icon} />
    </button>
  );
}
