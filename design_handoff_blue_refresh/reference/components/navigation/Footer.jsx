import React from 'react';
import { Mark } from '../brand/Mark.jsx';

const DEFAULT_COLUMNS = [
  { heading: 'Product', links: [{ label: 'Compare countries', href: '#' }, { label: 'Browse all', href: '#' }, { label: 'Methodology', href: '#' }] },
  { heading: 'Resources', links: [{ label: 'Data sources', href: '#' }, { label: 'API', href: '#' }, { label: 'FAQ', href: '#' }] },
  { heading: 'About', links: [{ label: 'About us', href: '#' }, { label: 'Contact', href: '#' }, { label: 'Privacy', href: '#' }] },
];

function FooterLink({ href, children }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ color: hover ? 'var(--color-link-hover)' : 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--font-size-sm)' }}>
      {children}
    </a>
  );
}

export function Footer({ columns = DEFAULT_COLUMNS, layout, year = new Date().getFullYear() }) {
  const narrow = layout === 'phone';
  const pad = layout === 'phone' ? '16px' : layout === 'desktop' ? '24px' : 'var(--layout-gutter)';
  return (
    <footer style={{ position: 'sticky', left: 0, borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', padding: 'var(--space-8) 0 calc(var(--space-6) + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ maxWidth: 'var(--layout-max-width)', margin: '0 auto', padding: `0 ${pad}` }}>
        <nav aria-label="Footer" style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'repeat(3, 1fr)', gap: narrow ? 'var(--space-5)' : 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {columns.map((col) => (
            <div key={col.heading} style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-caps)', color: 'var(--color-text)', margin: '0 0 var(--space-3)' }}>{col.heading}</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {col.links.map((l) => <li key={l.label}><FooterLink href={l.href}>{l.label}</FooterLink></li>)}
              </ul>
            </div>
          ))}
        </nav>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
          <span aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>© {year} Country Comparator</p>
          <span style={{ justifySelf: 'end' }}><Mark variant="tile" size={24} /></span>
        </div>
      </div>
    </footer>
  );
}
