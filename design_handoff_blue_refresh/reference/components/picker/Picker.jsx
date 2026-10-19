import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
import { SearchInput } from '../forms/SearchInput.jsx';

const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Ranking mirrors src/components/Picker/filter.js: label prefix, exact alias,
// word prefix, alias prefix, substring. Case- and accent-insensitive.
export function filterItems(items, query) {
  const q = fold(query).trim();
  if (!q) return items;
  const scored = [];
  items.forEach((it, i) => {
    const label = fold(it.label);
    const keys = (it.keywords || []).map(fold);
    let rank = -1;
    if (label.startsWith(q)) rank = 0;
    else if (keys.includes(q)) rank = 1;
    else if (label.split(/[\s\-(),]+/).some((w) => w.startsWith(q))) rank = 2;
    else if (keys.some((k) => k.startsWith(q))) rank = 3;
    else if (label.includes(q)) rank = 4;
    if (rank >= 0) scored.push([rank, i, it]);
  });
  return scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((s) => s[2]);
}

// Searchable picker: bottom sheet on phones, popover on wide screens.
// `contained` positions it inside the nearest positioned ancestor instead of
// the viewport (for device frames and specimens).
export function Picker({
  open = true, mode = 'sheet', title, placeholder = 'Search', emptyMessage = 'No matches',
  items = [], onSelect, onClose, anchor, contained = false, initialQuery = '',
}) {
  const [query, setQuery] = React.useState(initialQuery);
  const [active, setActive] = React.useState(0);
  React.useEffect(() => { if (open) { setQuery(initialQuery); setActive(0); } }, [open]);
  if (!open) return null;
  const results = filterItems(items, query);
  const cur = Math.min(active, results.length - 1);
  const sheet = mode === 'sheet';
  const choose = (it) => { onSelect && onSelect(it); onClose && onClose(); };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[cur]) { e.preventDefault(); choose(results[cur]); }
    else if (e.key === 'Escape') { onClose && onClose(); }
  };
  const panelPos = sheet
    ? { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '85%', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', boxShadow: 'var(--shadow-sheet)', animation: 'cc-slide-up var(--duration-sheet) ease-out' }
    : { position: 'absolute', width: 360, maxHeight: 480, top: anchor?.top ?? '10%', left: anchor?.left ?? 'auto', right: anchor?.right ?? 'auto', bottom: anchor?.bottom ?? 'auto', transform: anchor ? 'none' : 'translateX(-50%)', ...(anchor ? null : { left: '50%' }), border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', animation: 'cc-fade-in var(--duration-popover) ease-out' };
  return (
    <div
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}
      style={{ position: contained ? 'absolute' : 'fixed', inset: 0, zIndex: 20, background: sheet ? 'var(--color-backdrop)' : 'var(--color-backdrop-light)' }}
    >
      <div role="dialog" aria-label={title} style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', ...panelPos }}>
        {sheet ? <div aria-hidden="true" style={{ width: 36, height: 4, margin: 'var(--space-2) auto 0', borderRadius: 2, background: 'var(--gray-300)', flex: 'none' }} /> : null}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', padding: `${sheet ? 'var(--space-2)' : 'var(--space-3)'} var(--space-2) 0 var(--space-4)` }}>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>{title}</h2>
          <IconButton variant="close" label="Close" onClick={onClose} />
        </div>
        <div style={{ padding: 'var(--space-2) var(--space-4)' }}>
          <SearchInput value={query} onChange={(v) => { setQuery(v); setActive(0); }} placeholder={placeholder} onKeyDown={onKeyDown} autoFocus />
        </div>
        <ul role="listbox" aria-label={title} style={{ flex: '1 1 auto', minHeight: 0, margin: 0, padding: '0 var(--space-2) var(--space-2)', listStyle: 'none', overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {results.map((it, i) => (
            <li
              key={it.id}
              role="option"
              aria-selected={i === cur}
              onMouseMove={() => setActive(i)}
              onClick={() => choose(it)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minHeight: 48, padding: '0 var(--space-3)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: i === cur ? 'var(--color-brand-tint)' : 'transparent' }}
            >
              {it.leading ? <span aria-hidden="true" style={{ width: 32, fontSize: 'var(--font-size-flag-list)', lineHeight: 1, textAlign: 'center' }}>{it.leading}</span> : null}
              <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--font-size-base)' }}>{it.label}</span>
              {it.hint ? <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{it.hint}</span> : null}
            </li>
          ))}
        </ul>
        {results.length === 0 ? <p style={{ margin: 0, padding: 'var(--space-5) var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{emptyMessage}</p> : null}
      </div>
    </div>
  );
}
