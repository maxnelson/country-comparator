import styles from './Footer.module.css'

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Compare countries', href: '#' },
      { label: 'Browse all', href: '#' },
      { label: 'Methodology', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Data sources', href: '#' },
      { label: 'API', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'About us', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy', href: '#' },
    ],
  },
]

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.columns} aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.heading} className={styles.column}>
              <h2 className={styles.heading}>{col.heading}</h2>
              <ul className={styles.list}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.bottom}>
          <span className={styles.spacer} aria-hidden="true" />
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Country Comparator
          </p>
          <img src="/favicon.svg" alt="" className={styles.mark} />
        </div>
      </div>
    </footer>
  )
}

export default Footer
