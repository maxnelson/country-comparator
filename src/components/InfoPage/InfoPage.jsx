import styles from './InfoPage.module.css'

// Back to the comparison the reader came from when there is one in this tab's
// history, otherwise to the default comparison
function goBack(event) {
  if (document.referrer.startsWith(window.location.origin + import.meta.env.BASE_URL)) {
    event.preventDefault()
    window.history.back()
  }
}

function InfoPage({ title, children }) {
  return (
    <article className={styles.page}>
      <a href={import.meta.env.BASE_URL} className={styles.back} onClick={goBack}>
        ← Back to the comparison
      </a>
      <h1 className={styles.title}>{title}</h1>
      {children}
    </article>
  )
}

export default InfoPage
