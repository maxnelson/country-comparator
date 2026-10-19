import React from 'react';
import { Mark } from '../brand/Mark.jsx';

// App header: solid blue bar, white bars mark + wordmark. Sticky left so it
// never scrolls sideways with the table.
export function Header({ title = 'Country Comparator', href = '#', layout, showMark = true }) {
  const [hover, setHover] = React.useState(false);
  const h = layout === 'phone' ? 56 : layout === 'desktop' ? 64 : 'var(--layout-header-height)';
  const pad = layout === 'phone' ? 16 : layout === 'desktop' ? 24 : 'var(--layout-gutter)';
  return (
    <header style={{ position: 'sticky', left: 0, background: 'var(--color-header-bg)', color: 'var(--color-header-text)' }}>
      <div style={{ maxWidth: 'var(--layout-max-width)', margin: '0 auto', padding: typeof pad === 'number' ? `0 ${pad}px` : `0 ${pad}`, height: h, display: 'flex', alignItems: 'center' }}>
        <a
          href={href}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-header-text)', textDecoration: 'none', letterSpacing: 'var(--letter-spacing-tight)', opacity: hover ? 0.85 : 1 }}
        >
          {showMark ? <Mark variant="bars" size={20} color="#FFFFFF" /> : null}
          {title}
        </a>
      </div>
    </header>
  );
}
