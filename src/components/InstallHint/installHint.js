// When to show the "Add to Home Screen" hint. Safari never offers to install
// a web app, so iOS users need telling; Android's Chrome prompts on its own.

const DISMISS_KEY = 'installHintDismissedAt'
export const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000

/**
 * True on iOS (iPhone, iPod, and iPad, which since iPadOS 13 reports itself
 * as a Mac with a touch screen) in a real browser (in-app web views lack the
 * Safari token and have no Share menu), when the app is not already running
 * from the home screen and the hint was not dismissed in the last 30 days.
 */
export function shouldShowInstallHint({ userAgent, platform, maxTouchPoints, standalone, dismissedAt, now }) {
  const isIOS = /iPhone|iPad|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
  if (!isIOS) return false
  if (!/Safari\//.test(userAgent)) return false
  if (standalone) return false
  if (dismissedAt && now - dismissedAt < SNOOZE_MS) return false
  return true
}

// localStorage can throw (private browsing on old Safari, storage disabled);
// then the hint simply shows every visit.
export function readDismissedAt(storage = globalThis.localStorage) {
  try {
    const value = Number(storage.getItem(DISMISS_KEY))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

export function writeDismissedAt(now, storage = globalThis.localStorage) {
  try {
    storage.setItem(DISMISS_KEY, String(now))
  } catch {
    // ignore: the hint will show again next visit
  }
}
