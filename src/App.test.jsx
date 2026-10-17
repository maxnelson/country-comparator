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

  it('adds the next country when "Add country" is pressed', () => {
    render(<App />)
    expect(screen.queryByText('Brazil')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add country' }))
    expect(screen.getByText('Brazil')).toBeInTheDocument()
  })

  it('reveals another metric when "Add metric" is pressed', () => {
    render(<App />)
    expect(screen.queryByText('CO₂ (tons / capita)')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add metric' }))
    expect(screen.getByText('CO₂ (tons / capita)')).toBeInTheDocument()
  })
})
