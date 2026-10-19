// Country Comparator app shell, composed from the design-system components.
ccLoad('../../').then(({ Header, Footer, ComparisonTable, Picker }) => {
  const COUNTRIES = window.CC_COUNTRIES;
  const METRICS = window.CC_METRICS;
  const byCode = (code) => COUNTRIES.find((c) => c.code === code);
  const byKey = (key) => METRICS.find((m) => m.key === key);

  // Desktop popover placement, as Picker.jsx placementFor(): below the anchor
  // when there is room, else above; left-aligned when there is room, else right.
  function placement(anchorEl, frameEl) {
    const r = anchorEl.getBoundingClientRect(), f = frameEl.getBoundingClientRect();
    const a = {};
    if (r.left - f.left + 360 <= f.width - 24) a.left = Math.round(r.left - f.left);
    else a.right = Math.round(f.right - r.right);
    const below = f.bottom - r.bottom - 8 - 24, above = r.top - f.top - 8 - 24;
    if (below >= 320 || below >= above) a.top = Math.round(r.bottom - f.top + 8);
    else a.bottom = Math.round(f.bottom - r.top + 8);
    return a;
  }

  function App() {
    const [layout, setLayout] = React.useState(() => localStorage.getItem('cc-kit-layout') || 'desktop');
    const [codes, setCodes] = React.useState(window.CC_DEFAULT_CODES);
    const [keys, setKeys] = React.useState(window.CC_DEFAULT_METRIC_KEYS);
    const [editing, setEditing] = React.useState(false);
    const [picker, setPicker] = React.useState(null);
    const frameRef = React.useRef(null);
    React.useEffect(() => { localStorage.setItem('cc-kit-layout', layout); }, [layout]);
    React.useEffect(() => {
      const names = codes.map((c) => byCode(c).name);
      document.title = (names.length <= 3 ? names.join(' vs ') : `${names.slice(0, 2).join(' vs ')} and ${names.length - 2} more`) + ' · Country Comparator';
    }, [codes]);

    const phone = layout === 'phone';
    const countries = codes.map(byCode);
    const metrics = keys.map(byKey);
    const open = (kind) => (el) => setPicker({ kind, anchor: phone ? null : placement(el, frameRef.current) });
    const countryItems = COUNTRIES.filter((c) => !codes.includes(c.code)).map((c) => ({ id: c.code, label: c.name, leading: c.flag, hint: c.code, keywords: [c.code, c.code3, ...c.aliases] }));
    const metricItems = METRICS.filter((m) => !keys.includes(m.key)).map((m) => ({ id: m.key, label: m.label }));

    const frame = phone
      ? { width: 390, height: 844, borderRadius: 40, border: '10px solid #18181B' }
      : { width: 1280, height: 800, borderRadius: 12, border: '1px solid var(--color-border)' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'safe center', gap: 20, padding: '24px 24px 48px', width: 'max-content', minWidth: '100%', boxSizing: 'border-box' }}>
        <div role="radiogroup" aria-label="Viewport" style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--gray-200)', borderRadius: 10 }}>
          {['phone', 'desktop'].map((l) => (
            <button key={l} role="radio" aria-checked={layout === l} onClick={() => { setPicker(null); setLayout(l); }}
              style={{ font: 'inherit', fontSize: 13, fontWeight: 500, padding: '6px 14px', border: 0, borderRadius: 7, cursor: 'pointer', background: layout === l ? '#fff' : 'transparent', color: 'var(--color-text)', boxShadow: layout === l ? 'var(--shadow-sm)' : 'none' }}>
              {l === 'phone' ? 'Phone · 390' : 'Desktop · 1280'}
            </button>
          ))}
        </div>
        <div ref={frameRef} style={{ ...frame, position: 'relative', overflow: 'hidden', background: 'var(--color-bg)', boxShadow: '0 24px 64px rgba(0,0,0,0.14)', flex: 'none' }}>
          <div style={{ height: '100%', overflow: 'auto', overscrollBehaviorX: 'contain', scrollbarWidth: phone ? 'none' : 'auto' }}>
            <Header layout={layout} />
            <main style={{ padding: phone ? '0 0 var(--space-4)' : '0 0 var(--space-6)' }}>
              <ComparisonTable
                layout={layout} countries={countries} metrics={metrics} getValue={window.CC_FORMAT}
                editing={editing} onToggleEdit={() => setEditing((e) => !e)}
                onAddCountry={open('country')} onAddMetric={open('metric')}
                canAddCountry={countryItems.length > 0} canAddMetric={metricItems.length > 0}
                onRemoveCountry={(c) => setCodes((p) => (p.length > 1 ? p.filter((x) => x !== c) : p))}
                onRemoveMetric={(k) => setKeys((p) => (p.length > 1 ? p.filter((x) => x !== k) : p))}
              />
            </main>
            <Footer layout={layout} />
          </div>
          <Picker
            contained open={picker?.kind === 'country'} mode={phone ? 'sheet' : 'popover'} anchor={picker?.anchor}
            title="Add a country" placeholder="Search countries" emptyMessage="No countries match"
            items={countryItems} onSelect={(it) => setCodes((p) => [...p, it.id])} onClose={() => setPicker(null)}
          />
          <Picker
            contained open={picker?.kind === 'metric'} mode={phone ? 'sheet' : 'popover'} anchor={picker?.anchor}
            title="Add a metric" placeholder="Search metrics" emptyMessage="No metrics match"
            items={metricItems} onSelect={(it) => setKeys((p) => [...p, it.id])} onClose={() => setPicker(null)}
          />
        </div>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
});
