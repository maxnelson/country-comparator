import { describe, it, expect } from 'vitest'
import { shouldShowInstallHint, readDismissedAt, writeDismissedAt, SNOOZE_MS } from './installHint.js'

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.109 Mobile/15E148 Safari/604.1'
const IPHONE_WEBVIEW =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/430.0.0]'
const IPAD_AS_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'

const NOW = 1_800_000_000_000
const base = { platform: 'iPhone', maxTouchPoints: 5, standalone: false, dismissedAt: null, now: NOW }

describe('shouldShowInstallHint', () => {
  it('shows on iPhone Safari', () => {
    expect(shouldShowInstallHint({ ...base, userAgent: IPHONE_SAFARI })).toBe(true)
  })

  it('shows on Chrome for iOS, which has the same share menu', () => {
    expect(shouldShowInstallHint({ ...base, userAgent: IPHONE_CHROME })).toBe(true)
  })

  it('shows on an iPad that reports itself as a Mac with a touch screen', () => {
    expect(
      shouldShowInstallHint({ ...base, userAgent: IPAD_AS_MAC, platform: 'MacIntel', maxTouchPoints: 5 }),
    ).toBe(true)
  })

  it('does not show on a real Mac', () => {
    expect(
      shouldShowInstallHint({ ...base, userAgent: IPAD_AS_MAC, platform: 'MacIntel', maxTouchPoints: 0 }),
    ).toBe(false)
  })

  it('does not show in an in-app web view, which has no Share menu', () => {
    expect(shouldShowInstallHint({ ...base, userAgent: IPHONE_WEBVIEW })).toBe(false)
  })

  it('does not show on Android, where the browser prompts on its own', () => {
    expect(shouldShowInstallHint({ ...base, userAgent: ANDROID_CHROME, platform: 'Linux armv8l' })).toBe(false)
  })

  it('does not show once the app runs from the home screen', () => {
    expect(shouldShowInstallHint({ ...base, userAgent: IPHONE_SAFARI, standalone: true })).toBe(false)
  })

  it('stays hidden for 30 days after a dismissal', () => {
    expect(shouldShowInstallHint({ ...base, userAgent: IPHONE_SAFARI, dismissedAt: NOW - SNOOZE_MS + 1 })).toBe(false)
    expect(shouldShowInstallHint({ ...base, userAgent: IPHONE_SAFARI, dismissedAt: NOW - SNOOZE_MS })).toBe(true)
  })
})

describe('dismissal storage', () => {
  it('round-trips a timestamp', () => {
    const store = new Map()
    const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) }
    expect(readDismissedAt(storage)).toBeNull()
    writeDismissedAt(NOW, storage)
    expect(readDismissedAt(storage)).toBe(NOW)
  })

  it('treats a throwing storage as never dismissed', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    expect(readDismissedAt(broken)).toBeNull()
    expect(() => writeDismissedAt(NOW, broken)).not.toThrow()
  })
})
