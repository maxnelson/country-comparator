import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          Country Comparator
        </a>
      </div>
    </header>
  )
}

export default Header
