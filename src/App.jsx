import { useEffect } from 'react'
import Header from './components/Header/Header.jsx'
import InstallHint from './components/InstallHint/InstallHint.jsx'
import Footer from './components/Footer/Footer.jsx'
import ComparisonTable from './components/ComparisonTable/ComparisonTable.jsx'
import MethodologyPage from './components/InfoPage/MethodologyPage.jsx'
import SourcesPage from './components/InfoPage/SourcesPage.jsx'
import { PAGES, pageFromSearch } from './state/page.js'
import styles from './App.module.css'

function App() {
  // Page links are plain navigations, so the page is fixed for this load
  const page = pageFromSearch(window.location.search)

  useEffect(() => {
    if (page) document.title = `${PAGES[page]} · Country Comparator`
  }, [page])

  return (
    <div className={styles.app}>
      {/* The page's only scroll container. Header and footer live inside it
          so they scroll away vertically but stay put when the table scrolls
          sideways. */}
      <div className={styles.scroller}>
        <Header />
        <InstallHint />
        <main className={styles.main}>
          {page === 'methodology' && <MethodologyPage />}
          {page === 'sources' && <SourcesPage />}
          {!page && <ComparisonTable />}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
