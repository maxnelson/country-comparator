import { DATA_SOURCES } from '../../data/countries.js'
import { METRICS, metricSource } from '../../data/metrics.js'

// Display details for each source in DATA_SOURCES, in the order the Data
// sources page lists them. Names and links come from the generated data so
// they match what the refresh script fetched; licenses and attribution
// wording are the ones each license asks for.
const DETAILS = {
  worldbank: {
    short: 'World Bank',
    license: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
    attribution: 'Data from World Bank Open Data (Indicators API), licensed under CC BY 4.0.',
    usage:
      'The most recent value each country has reported, with the year it was reported for. Refreshed whenever the data is rebuilt.',
  },
  catalog: {
    short: 'Country catalog',
    license: { name: 'ODbL 1.0', url: 'https://opendatacommons.org/licenses/odbl/1-0/' },
    attribution:
      'Country names, codes, flags, capitals, currencies and regions from mledoze/countries, made available under the Open Database License (ODbL) 1.0.',
    usage:
      'Which countries are listed, their names and flags, regions, and the alternative spellings search understands.',
  },
  factbook: {
    short: 'CIA World Factbook',
    license: { name: 'Public domain' },
    attribution: 'CIA World Factbook, final edition, via the factbook/factbook.json archive. Public domain.',
    usage:
      'Mostly 2024 and 2025 estimates. The CIA stopped publishing the Factbook in February 2026, so these values are frozen at its final edition and will not refresh.',
  },
  codes: {
    short: 'Country codes',
    license: { name: 'Public domain (ODC-PDDL)', url: 'https://opendatacommons.org/licenses/pddl/1-0/' },
    attribution: 'Code mappings from datasets/country-codes, public domain under the ODC-PDDL.',
    usage: "Matches each country's ISO code to the Factbook's own country code. No values come from it directly.",
  },
}

export const SOURCES = Object.entries(DETAILS).map(([id, details]) => ({
  id,
  name: DATA_SOURCES[id].name,
  url: DATA_SOURCES[id].url,
  ...details,
  metrics: METRICS.filter((m) => metricSource(m).id === id),
}))

export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s]))
