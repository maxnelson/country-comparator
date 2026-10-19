import React from 'react';
import { Button } from '../core/Button.jsx';
import { IconButton } from '../core/IconButton.jsx';

const LAYOUTS = {
  phone: { colMin: 96, addCol: 48, start: 0, valueRow: 2, padY: 12, valueSize: 'var(--font-size-value-sm)', flag: 28, gutter: 16, headPad: '12px 4px', ctlTop: 8, addSize: 'sm' },
  desktop: { colMin: 160, addCol: 64, start: 1, valueRow: 1, padY: 16, valueSize: 'var(--font-size-value-lg)', flag: 36, gutter: 24, headPad: '24px 4px', ctlTop: 22, addSize: 'md' },
};

// Frozen-panes comparison grid (see ComparisonTable.module.css in the app).
// One CSS grid; each row is a subgrid. Header pins top, labels pin left
// (desktop) or their text pins left (phone), the add lane pins right, the
// toolbar pins bottom — all sticky against the nearest scroll container.
export function ComparisonTable({
  countries = [], metrics = [], getValue = () => '—', layout = 'desktop', editing = false,
  onAddCountry, onAddMetric, onToggleEdit, onRemoveCountry, onRemoveMetric,
  canAddCountry = true, canAddMetric = true, minCountries = 1, minMetrics = 1,
}) {
  const L = LAYOUTS[layout] || LAYOUTS.desktop;
  const phone = layout === 'phone';
  const n = countries.length;
  const cols = `${phone ? '' : 'var(--table-label-col, 220px) '}repeat(${n}, minmax(min-content, 1fr)) ${L.addCol}px`;
  const row = { display: 'grid', gridTemplateColumns: 'subgrid', gridColumn: '1 / -1', padding: phone ? `0 0 0 ${L.gutter}px` : 0 };
  const sideCtl = `calc(50% + ${L.flag / 2}px + 6px)`;
  const canRemoveCountry = n > minCountries;
  const canRemoveMetric = metrics.length > minMetrics;

  return (
    <section role="table" aria-label="Country comparison" style={{ display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--space-2)', width: 'min-content', minWidth: '100%', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
      <div role="row" style={{ ...row, position: 'sticky', top: 0, zIndex: 3, gridTemplateRows: 'auto', alignItems: 'end', background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
        {!phone ? <div role="columnheader" aria-label="Metric" style={{ gridColumn: 1, gridRow: 1, position: 'sticky', left: 0, zIndex: 1, alignSelf: 'stretch', background: 'var(--color-bg-subtle)' }} /> : null}
        {countries.map((c, i) => (
          <div key={c.code} role="columnheader" style={{ gridColumn: L.start + i + 1, gridRow: 1, position: 'relative', minWidth: L.colMin, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)', padding: L.headPad, textAlign: 'center' }}>
            <span role="img" aria-label={`${c.name} flag`} style={{ fontSize: L.flag, lineHeight: 1 }}>{c.flag}</span>
            <span style={{ fontSize: 'var(--font-size-xs)', lineHeight: 'var(--line-height-tight)', color: 'var(--color-text-muted)', overflowWrap: 'break-word', hyphens: 'auto' }}>{c.name}</span>
            {editing ? (
              <>
                <IconButton variant="handle" label={`Reorder ${c.name}`} style={{ position: 'absolute', top: L.ctlTop, right: sideCtl }} />
                <IconButton variant="remove" label={`Remove ${c.name}`} disabled={!canRemoveCountry} onClick={() => onRemoveCountry && onRemoveCountry(c.code)} style={{ position: 'absolute', top: L.ctlTop, left: sideCtl }} />
              </>
            ) : null}
          </div>
        ))}
        <div role="columnheader" style={{ gridColumn: '-2 / -1', gridRow: 1, position: 'sticky', right: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', background: 'var(--color-bg-subtle)' }}>
          <IconButton variant="add" size={L.addSize} label="Add country" disabled={!canAddCountry} onClick={(e) => onAddCountry && onAddCountry(e.currentTarget)} />
        </div>
      </div>

      {metrics.map((m, r) => (
        <div key={m.key} role="row" style={{ ...row, gridTemplateRows: phone ? 'auto auto' : 'auto', alignItems: phone ? undefined : 'center', borderTop: r === 0 ? 0 : '1px solid var(--color-border)' }}>
          <div role="rowheader" style={phone
            ? { gridColumn: '1 / -2', gridRow: 1, display: 'flex', alignItems: 'center', minWidth: 0, paddingTop: L.padY, marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-xs)', lineHeight: 'var(--line-height-tight)', color: 'var(--color-text-muted)' }
            : { gridColumn: 1, gridRow: 1, position: 'sticky', left: 0, zIndex: 1, display: 'flex', alignItems: 'center', alignSelf: 'stretch', padding: `${L.padY}px var(--space-4) ${L.padY}px ${L.gutter}px`, borderRight: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-tight)', color: 'var(--color-text-muted)' }}>
            <span style={{ position: phone ? 'sticky' : 'static', left: L.gutter, display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {editing ? <IconButton variant="handle" label={`Reorder ${m.label}`} style={{ margin: '-6px 0' }} /> : null}
              {m.label}
            </span>
          </div>
          {countries.map((c, i) => (
            <div key={c.code} role="cell" style={{ gridColumn: L.start + i + 1, gridRow: L.valueRow, minWidth: L.colMin, padding: phone ? `0 var(--space-1) ${L.padY}px` : `${L.padY}px var(--space-2)`, textAlign: 'center', fontSize: L.valueSize, fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums', lineHeight: 'var(--line-height-snug)', letterSpacing: 'var(--letter-spacing-tight)', color: 'var(--color-text)', overflowWrap: 'break-word', hyphens: 'auto' }}>
              {getValue(m, c)}
            </div>
          ))}
          <div role="cell" aria-hidden={editing ? undefined : true} style={{ gridColumn: '-2 / -1', gridRow: '1 / -1', position: 'sticky', right: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {editing ? <IconButton variant="remove" label={`Remove ${m.label}`} disabled={!canRemoveMetric} onClick={() => onRemoveMetric && onRemoveMetric(m.key)} /> : null}
          </div>
        </div>
      ))}

      <div role="row" style={{ ...row, position: 'sticky', bottom: 0, zIndex: 3, gridTemplateRows: 'auto', padding: phone ? `var(--space-2) 0 var(--space-2) ${L.gutter}px` : 'var(--space-2) 0', background: 'color-mix(in srgb, var(--color-bg-subtle) 94%, transparent)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderTop: '1px solid var(--color-border)' }}>
        <div role="cell" style={{ gridColumn: '1 / -1', gridRow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          <Button icon="plus" disabled={!canAddMetric} onClick={(e) => onAddMetric && onAddMetric(e.currentTarget)} style={{ position: 'sticky', left: L.gutter }}>Add metric</Button>
          <Button variant={editing ? 'primary' : 'default'} aria-pressed={editing} onClick={onToggleEdit} style={{ position: 'sticky', right: L.gutter }}>{editing ? 'Done' : 'Edit'}</Button>
        </div>
      </div>
    </section>
  );
}
