import InfoPage from './InfoPage.jsx'
import { SOURCES } from './sources.js'
import { DATA_GENERATED_AT } from '../../data/countries.js'
import { pageHref } from '../../state/page.js'
import styles from './InfoPage.module.css'

function SourcesPage() {
  return (
    <InfoPage title="Data sources">
      <p>
        Every number in Country Comparator comes from one of these public datasets. The data ships
        with the app, so nothing is fetched while you use it. It was last rebuilt on{' '}
        {DATA_GENERATED_AT}. <a href={pageHref('methodology')}>Methodology</a> explains how the
        values are chosen and shown.
      </p>

      {SOURCES.map((source) => (
        <section key={source.id} className={styles.source} aria-labelledby={`source-${source.id}`}>
          <h2 id={`source-${source.id}`}>
            <a href={source.url}>{source.name}</a>
          </h2>
          <p>{source.usage}</p>
          {source.metrics.length > 0 && (
            <p>
              <strong>Metrics:</strong> {source.metrics.map((m) => m.label).join(', ')}
            </p>
          )}
          <p>
            <strong>License:</strong>{' '}
            {source.license.url ? <a href={source.license.url}>{source.license.name}</a> : source.license.name}
          </p>
          <p className={styles.attribution}>{source.attribution}</p>
        </section>
      ))}
    </InfoPage>
  )
}

export default SourcesPage
