import { render, screen, fireEvent } from '@testing-library/react'
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

  it('adds the next country when "Add country" is pressed', () => {
    render(<App />)
    expect(screen.queryByText('Brazil')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add country' }))
    expect(screen.getByText('Brazil')).toBeInTheDocument()
  })
})
