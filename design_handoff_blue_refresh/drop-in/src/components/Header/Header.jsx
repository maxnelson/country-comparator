import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href={import.meta.env.BASE_URL} className={styles.logo}>
          <img src={`${import.meta.env.BASE_URL}mark-bars-white.svg`} alt="" className={styles.mark} />
          Country Comparator
        </a>
      </div>
    </header>
  )
}

export default Header
