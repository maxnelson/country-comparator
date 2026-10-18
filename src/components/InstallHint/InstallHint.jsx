import { useState } from 'react'
import styles from './InstallHint.module.css'
import { shouldShowInstallHint, readDismissedAt, writeDismissedAt } from './installHint.js'

function detect() {
  if (typeof navigator === 'undefined') return false
  const displayMode = window.matchMedia?.('(display-mode: standalone)')
  return shouldShowInstallHint({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    standalone: navigator.standalone === true || !!displayMode?.matches,
    dismissedAt: readDismissedAt(),
    now: Date.now(),
  })
}

// The iOS share glyph: an arrow rising out of an open-topped box.
function ShareIcon() {
  return (
    <svg
      className={styles.share}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Share"
    >
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </svg>
  )
}

function InstallHint() {
  const [visible, setVisible] = useState(detect)
  if (!visible) return null

  const dismiss = () => {
    writeDismissedAt(Date.now())
    setVisible(false)
  }

  return (
    <aside className={styles.hint} aria-label="Install the app">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className={styles.icon} />
      <p className={styles.text}>
        <strong>Install this app:</strong> tap <ShareIcon /> then <strong>Add to Home Screen</strong>. It opens full
        screen and works offline.
      </p>
      <button type="button" className={styles.dismiss} onClick={dismiss} aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </aside>
  )
}

export default InstallHint
