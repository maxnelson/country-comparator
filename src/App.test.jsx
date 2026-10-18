import { render, screen, within, fireEvent } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import App from './App.jsx'
import { DEFAULT_METRIC_KEYS } from './state/urlState.js'

const DEFAULT_METRICS = DEFAULT_METRIC_KEYS.join('-')

// Tests share one jsdom window; leave the URL clean for the next one
afterEach(() => window.history.replaceState(null, '', '/'))

const search = (name) => screen.getByRole('combobox', { name })
const button = (name) => screen.getByRole('button', { name })

describe('App', () => {
  it('renders the default comparison', () => {
    render(<App />)
    expect(screen.getByRole('table', { name: 'Country comparison' })).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('Japan')).toBeInTheDocument()
    expect(screen.getByText('Germany')).toBeInTheDocument()
  })

  it('shows each metric label once, with one value per country', () => {
    render(<App />)
    const label = screen.getByText('Population')
    expect(screen.getAllByText('Population')).toHaveLength(1)
    const row = label.closest('[role="row"]')
    expect(within(row).getAllByRole('cell')).toHaveLength(3)
  })

  it('keeps the toolbar row with Add metric as the last row', () => {
    render(<App />)
    const rows = screen.getAllByRole('row')
    expect(within(rows.at(-1)).getByRole('button', { name: 'Add metric' })).toBeInTheDocument()
  })

  describe('URL state', () => {
    it('reads the comparison from the query string', () => {
      window.history.replaceState(null, '', '/?countries=fr-ca&metrics=capital-currency')
      render(<App />)
      const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
      expect(headers.filter((t) => t.includes('France') || t.includes('Canada'))).toHaveLength(2)
      expect(screen.queryByRole('columnheader', { name: /Japan/ })).not.toBeInTheDocument()
      expect(screen.getAllByRole('rowheader').map((r) => r.textContent)).toEqual(['Capital', 'Currency'])
      expect(document.title).toBe('France vs Canada · Country Comparator')
    })

    it('replaces the bare URL with the default comparison', () => {
      render(<App />)
      expect(window.location.search).toBe(`?countries=us-jp-de&metrics=${DEFAULT_METRICS}`)
    })

    it('writes changes back to the URL', () => {
      render(<App />)
      fireEvent.click(button('Add country'))
      fireEvent.click(screen.getByRole('option', { name: /France/ }))
      expect(window.location.search).toBe(`?countries=us-jp-de-fr&metrics=${DEFAULT_METRICS}`)
      fireEvent.click(button('Edit'))
      fireEvent.click(button('Remove Population'))
      expect(window.location.search).toMatch(/^\?countries=us-jp-de-fr&metrics=area_sq_mi-/)
      expect(window.location.search).not.toContain('population')
    })

    it('ignores junk in the URL and falls back to the defaults', () => {
      window.history.replaceState(null, '', '/?countries=xx-yy&metrics=nothing')
      render(<App />)
      expect(screen.getByRole('columnheader', { name: /Japan/ })).toBeInTheDocument()
      expect(screen.getByText('Population')).toBeInTheDocument()
      expect(window.location.search).toBe(`?countries=us-jp-de&metrics=${DEFAULT_METRICS}`)
    })

    it('still opens links in the earlier short format', () => {
      window.history.replaceState(null, '', '/?c=FR,CA&m=capital,currency')
      render(<App />)
      expect(screen.getByRole('columnheader', { name: /France/ })).toBeInTheDocument()
      expect(window.location.search).toBe('?countries=fr-ca&metrics=capital-currency')
    })
  })

  describe('country picker', () => {
    const openPicker = () => {
      fireEvent.click(button('Add country'))
      return screen.getByRole('dialog', { name: 'Add a country' })
    }

    it('lists only the countries not yet shown', () => {
      render(<App />)
      const dialog = openPicker()
      expect(dialog).toHaveAttribute('open')
      expect(within(dialog).getByRole('option', { name: /Brazil/ })).toBeInTheDocument()
      expect(within(dialog).queryByRole('option', { name: /Japan/ })).not.toBeInTheDocument()
    })

    it('filters as you type and adds the chosen country', () => {
      render(<App />)
      const dialog = openPicker()
      fireEvent.change(search('Search countries'), { target: { value: 'fr' } })
      expect(within(dialog).getAllByRole('option')).toHaveLength(1)
      fireEvent.click(within(dialog).getByRole('option', { name: /France/ }))
      expect(screen.getByRole('columnheader', { name: /France/ })).toBeInTheDocument()
      expect(dialog).not.toHaveAttribute('open')
    })

    it('finds a country by alias or code', () => {
      render(<App />)
      const dialog = openPicker()
      fireEvent.change(search('Search countries'), { target: { value: 'uk' } })
      expect(within(dialog).getByRole('option', { name: /United Kingdom/ })).toBeInTheDocument()
      fireEvent.change(search('Search countries'), { target: { value: 'ca' } })
      expect(within(dialog).getByRole('option', { name: /Canada/ })).toBeInTheDocument()
    })

    it('shows an empty state when nothing matches', () => {
      render(<App />)
      const dialog = openPicker()
      fireEvent.change(search('Search countries'), { target: { value: 'zzz' } })
      expect(within(dialog).queryAllByRole('option')).toHaveLength(0)
      expect(within(dialog).getByText('No countries match')).toBeInTheDocument()
    })

    it('adds the highlighted result with the keyboard', () => {
      render(<App />)
      openPicker()
      fireEvent.keyDown(search('Search countries'), { key: 'ArrowDown' })
      fireEvent.keyDown(search('Search countries'), { key: 'Enter' })
      // Remaining countries start Brazil, India; ArrowDown moved to India
      expect(screen.getByRole('columnheader', { name: /India/ })).toBeInTheDocument()
    })
  })

  describe('metric picker', () => {
    const openPicker = () => {
      fireEvent.click(button('Add metric'))
      return screen.getByRole('dialog', { name: 'Add a metric' })
    }

    it('lists only the metrics not yet shown', () => {
      render(<App />)
      const dialog = openPicker()
      expect(within(dialog).getByRole('option', { name: /CO₂/ })).toBeInTheDocument()
      expect(within(dialog).queryByRole('option', { name: /Population/ })).not.toBeInTheDocument()
    })

    it('adds the chosen metric as the last metric row', () => {
      render(<App />)
      const dialog = openPicker()
      fireEvent.change(search('Search metrics'), { target: { value: 'tax' } })
      fireEvent.click(within(dialog).getByRole('option', { name: /Top income tax rate/ }))
      const rows = screen.getAllByRole('row')
      expect(within(rows.at(-2)).getByText('Top income tax rate')).toBeInTheDocument()
      expect(dialog).not.toHaveAttribute('open')
    })
  })

  describe('edit mode', () => {
    it('shows remove buttons only while editing', () => {
      render(<App />)
      expect(screen.queryByRole('button', { name: 'Remove Japan' })).not.toBeInTheDocument()
      fireEvent.click(button('Edit'))
      expect(button('Remove Japan')).toBeInTheDocument()
      expect(button('Remove Population')).toBeInTheDocument()
      fireEvent.click(button('Done'))
      expect(screen.queryByRole('button', { name: 'Remove Japan' })).not.toBeInTheDocument()
    })

    it('removes a country and a metric, and offers them in the pickers again', () => {
      render(<App />)
      fireEvent.click(button('Edit'))
      fireEvent.click(button('Remove Japan'))
      expect(screen.queryByRole('columnheader', { name: /Japan/ })).not.toBeInTheDocument()
      fireEvent.click(button('Remove Population'))
      expect(screen.queryByText('Population')).not.toBeInTheDocument()
      fireEvent.click(button('Add country'))
      expect(screen.getByRole('option', { name: /Japan/ })).toBeInTheDocument()
    })

    it('shows a reorder handle on every metric row and country column while editing', () => {
      render(<App />)
      expect(screen.queryByRole('button', { name: 'Reorder Population' })).not.toBeInTheDocument()
      fireEvent.click(button('Edit'))
      const handles = screen.getAllByRole('button', { name: /^Reorder / })
      expect(handles).toHaveLength(12 + 3)
      expect(button('Reorder Population')).toHaveAttribute('aria-roledescription', 'sortable')
      expect(button('Reorder Japan')).toHaveAttribute('aria-roledescription', 'sortable')
    })

    it('keeps at least one country', () => {
      render(<App />)
      fireEvent.click(button('Edit'))
      fireEvent.click(button('Remove Japan'))
      fireEvent.click(button('Remove Germany'))
      expect(button('Remove United States')).toBeDisabled()
    })
  })
})
