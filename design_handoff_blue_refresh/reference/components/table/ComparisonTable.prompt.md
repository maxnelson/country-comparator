The frozen-panes comparison grid: flags across the top, metrics down the side, an add-country lane pinned right and an Add metric / Edit toolbar pinned bottom.

```jsx
<div style={{ height: '100%', overflow: 'auto' }}>   {/* the only scroller */}
  <ComparisonTable
    layout="phone"
    countries={[{ code: 'US', name: 'United States', flag: '🇺🇸' }, …]}
    metrics={[{ key: 'population', label: 'Population' }, …]}
    getValue={(m, c) => format(m, c)}
    editing={editing} onToggleEdit={() => setEditing(e => !e)}
    onAddCountry={openCountryPicker} onAddMetric={openMetricPicker}
    onRemoveCountry={remove} onRemoveMetric={removeMetric}
  />
</div>
```

- Pinning is `position: sticky`; nothing between the scroller and the table may set `overflow` (other than visible/clip).
- Values: 15px (phone) / 20px (desktop) semibold, tabular numerals, centered. Labels and country names muted, 12px (14px desktop labels).
- Columns share the width when they fit and scroll sideways when they don't (`width: min-content; min-width: 100%`).
- Drag-to-reorder is not wired in the design-system version — handles render, reordering is the app's dnd-kit.
