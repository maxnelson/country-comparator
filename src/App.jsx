import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import ComparisonTable from './components/ComparisonTable/ComparisonTable.jsx'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <ComparisonTable />
      </main>
      <Footer />
    </div>
  )
}

export default App
