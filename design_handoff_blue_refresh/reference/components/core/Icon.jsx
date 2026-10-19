import React from 'react';

// Glyphs copied from the app source (ComparisonTable.jsx, Picker.jsx).
const PATHS = {
  plus: { vb: '0 0 20 20', d: 'M10 4v12M4 10h12', w: 2.25 },
  remove: { vb: '0 0 20 20', d: 'M6 6l8 8M14 6l-8 8', w: 2.25 },
  close: { vb: '0 0 20 20', d: 'M5 5l10 10M15 5L5 15', w: 2 },
};

export function Icon({ name, size = 20, style }) {
  if (name === 'grip') {
    return (
      <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" style={{ display: 'block', flex: 'none', ...style }}>
        {[[5.5, 3], [10.5, 3], [5.5, 8], [10.5, 8], [5.5, 13], [10.5, 13]].map(([cx, cy]) => (
          <circle key={cx + '-' + cy} cx={cx} cy={cy} r="1.5" />
        ))}
      </svg>
    );
  }
  const p = PATHS[name] || PATHS.plus;
  return (
    <svg viewBox={p.vb} width={size} height={size} aria-hidden="true" focusable="false" style={{ display: 'block', flex: 'none', ...style }}>
      <path d={p.d} stroke="currentColor" strokeWidth={p.w} strokeLinecap="round" fill="none" />
    </svg>
  );
}
