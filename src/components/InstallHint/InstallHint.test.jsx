import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import InstallHint from './InstallHint.jsx'

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

function setUserAgent(value) {
  Object.defineProperty(navigator, 'userAgent', { value, configurable: true })
}

const originalUserAgent = navigator.userAgent
afterEach(() => {
  setUserAgent(originalUserAgent)
  localStorage.clear()
})

describe('InstallHint', () => {
  it('renders nothing outside iOS', () => {
    const { container } = render(<InstallHint />)
    expect(container).toBeEmptyDOMElement()
  })

  it('tells iPhone users how to add the app to the home screen', () => {
    setUserAgent(IPHONE_SAFARI)
    render(<InstallHint />)
    const hint = screen.getByRole('complementary', { name: 'Install the app' })
    expect(hint).toHaveTextContent('Add to Home Screen')
    expect(screen.getByRole('img', { name: 'Share' })).toBeInTheDocument()
  })

  it('hides after Dismiss and stays hidden on the next visit', () => {
    setUserAgent(IPHONE_SAFARI)
    const first = render(<InstallHint />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(localStorage.getItem('installHintDismissedAt')).toMatch(/^\d+$/)
    first.unmount()
    render(<InstallHint />)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
})
