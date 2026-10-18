import { render, screen, within, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App.jsx'

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

  describe('country picker', () => {
    const openPicker = () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add country' }))
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
      fireEvent.change(screen.getByRole('combobox', { name: 'Search countries' }), {
        target: { value: 'fr' },
      })
      expect(within(dialog).getAllByRole('option')).toHaveLength(1)
      fireEvent.click(within(dialog).getByRole('option', { name: /France/ }))
      expect(screen.getByRole('columnheader', { name: /France/ })).toBeInTheDocument()
      expect(dialog).not.toHaveAttribute('open')
    })

    it('finds a country by alias or code', () => {
      render(<App />)
      const dialog = openPicker()
      const input = screen.getByRole('combobox', { name: 'Search countries' })
      fireEvent.change(input, { target: { value: 'uk' } })
      expect(within(dialog).getByRole('option', { name: /United Kingdom/ })).toBeInTheDocument()
      fireEvent.change(input, { target: { value: 'ca' } })
      expect(within(dialog).getByRole('option', { name: /Canada/ })).toBeInTheDocument()
    })

    it('shows an empty state when nothing matches', () => {
      render(<App />)
      const dialog = openPicker()
      fireEvent.change(screen.getByRole('combobox', { name: 'Search countries' }), {
        target: { value: 'zzz' },
      })
      expect(within(dialog).queryAllByRole('option')).toHaveLength(0)
      expect(within(dialog).getByText('No countries match')).toBeInTheDocument()
    })

    it('adds the highlighted result with the keyboard', () => {
      render(<App />)
      openPicker()
      const input = screen.getByRole('combobox', { name: 'Search countries' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'Enter' })
      // Remaining countries start Brazil, India; ArrowDown moved to India
      expect(screen.getByRole('columnheader', { name: /India/ })).toBeInTheDocument()
    })
  })

  it('keeps the add-metric row as the last row', () => {
    render(<App />)
    const rows = screen.getAllByRole('row')
    expect(within(rows.at(-1)).getByRole('button', { name: 'Add metric' })).toBeInTheDocument()
  })

  it('reveals another metric when "Add metric" is pressed', () => {
    render(<App />)
    expect(screen.queryByText('CO₂ (tons / capita)')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add metric' }))
    expect(screen.getByText('CO₂ (tons / capita)')).toBeInTheDocument()
  })
})
