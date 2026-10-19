import React from 'react';

// The rounded-bars mark (assets/mark.svg), drawn from the same 512 geometry
// so it can take any token color.
//   tile  — bars on a blue rounded square (app icon, favicon)
//   bars  — bars only (inside the header, on any ground)
export function Mark({ variant = 'tile', size = 32, color, barColor, title }) {
  const tile = variant === 'tile';
  const fill = barColor || (tile ? '#FFFFFF' : color || 'var(--color-brand-strong)');
  return (
    <svg
      viewBox={tile ? '0 0 512 512' : '132 106 248 300'}
      width={tile ? size : (size * 248) / 300}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: 'block', flex: 'none' }}
    >
      {tile ? <rect width="512" height="512" rx="112" fill={color || 'var(--color-brand-strong)'} /> : null}
      <rect x="132" y="206" width="96" height="200" rx="48" fill={fill} />
      <rect x="284" y="106" width="96" height="300" rx="48" fill={fill} />
    </svg>
  );
}
