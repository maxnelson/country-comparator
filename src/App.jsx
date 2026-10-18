import Header from './components/Header/Header.jsx'
import InstallHint from './components/InstallHint/InstallHint.jsx'
import Footer from './components/Footer/Footer.jsx'
import ComparisonTable from './components/ComparisonTable/ComparisonTable.jsx'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      {/* The page's only scroll container. Header and footer live inside it
          so they scroll away vertically but stay put when the table scrolls
          sideways. */}
      <div className={styles.scroller}>
        <Header />
        <InstallHint />
        <main className={styles.main}>
          <ComparisonTable />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
