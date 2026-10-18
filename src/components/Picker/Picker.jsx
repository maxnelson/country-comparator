import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { filterItems } from './filter.js'
import styles from './Picker.module.css'

/**
 * Searchable picker built on the native <dialog>: a bottom sheet on phones,
 * a popover anchored to the opening button on wide screens.
 *
 * Imperative API via ref: `open(anchorElement?)` and `close()`. Opening
 * synchronously inside the click handler is what lets phones show the
 * keyboard, so this is not driven by an `open` prop.
 *
 * items: [{ id, label, leading?, hint?, keywords? }]
 */
function Picker({
  ref,
  title,
  placeholder = 'Search',
  emptyMessage = 'No matches',
  items,
  onSelect,
  onClose,
}) {
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [anchor, setAnchor] = useState(null)
  const id = useId()
  const listId = `${id}-list`
  const titleId = `${id}-title`

  const results = useMemo(
    () => (isOpen ? filterItems(items, query) : []),
    [items, query, isOpen],
  )
  const active = results[Math.min(activeIndex, results.length - 1)] ?? null
  const activeId = active ? `${id}-opt-${active.id}` : undefined

  useImperativeHandle(
    ref,
    () => ({
      open(anchorEl) {
        const dialog = dialogRef.current
        if (!dialog || dialog.hasAttribute('open')) return
        if (anchorEl) {
          const r = anchorEl.getBoundingClientRect()
          setAnchor({
            top: Math.round(r.bottom + 8),
            right: Math.round(window.innerWidth - r.right),
          })
        } else {
          setAnchor(null)
        }
        setQuery('')
        setActiveIndex(0)
        setIsOpen(true)
        dialog.showModal()
        inputRef.current?.focus()
      },
      close() {
        dialogRef.current?.close()
      },
    }),
    [],
  )

  // Mirror the dialog's own close (Escape, close button, selection) into state
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => {
      setIsOpen(false)
      onClose?.()
    }
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  // Size the dialog to the visual viewport so the sheet sits above the
  // on-screen keyboard instead of behind it (iOS does not shrink the layout
  // viewport when the keyboard opens).
  useEffect(() => {
    if (!isOpen) return
    const vv = window.visualViewport
    const dialog = dialogRef.current
    if (!vv || !dialog) return
    const apply = () => {
      dialog.style.top = `${vv.offsetTop}px`
      dialog.style.height = `${vv.height}px`
    }
    apply()
    vv.addEventListener('resize', apply)
    vv.addEventListener('scroll', apply)
    return () => {
      vv.removeEventListener('resize', apply)
      vv.removeEventListener('scroll', apply)
      dialog.style.top = ''
      dialog.style.height = ''
    }
  }, [isOpen])

  // Keep the keyboard-highlighted option in view
  useEffect(() => {
    if (!activeId) return
    document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' })
  }, [activeId])

  const choose = (item) => {
    onSelect(item)
    dialogRef.current?.close()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (active) {
        e.preventDefault()
        choose(active)
      }
    }
  }

  const handleDialogClick = (e) => {
    // Clicks on the dialog itself (outside the panel) and on the backdrop
    if (e.target === e.currentTarget) dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClick={handleDialogClick}
      data-anchored={anchor ? '' : undefined}
      style={
        anchor
          ? { '--anchor-top': `${anchor.top}px`, '--anchor-right': `${anchor.right}px` }
          : undefined
      }
    >
      <div className={styles.panel}>
        <div className={styles.grabber} aria-hidden="true" />
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>
        <div className={styles.search}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            role="combobox"
            aria-label={placeholder}
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <ul id={listId} className={styles.list} role="listbox" aria-label={title}>
          {results.map((item, index) => (
            <li
              key={item.id}
              id={`${id}-opt-${item.id}`}
              role="option"
              aria-selected={item === active}
              className={item === active ? `${styles.option} ${styles.active}` : styles.option}
              onMouseMove={() => setActiveIndex(index)}
              onClick={() => choose(item)}
            >
              {item.leading && (
                <span className={styles.leading} aria-hidden="true">
                  {item.leading}
                </span>
              )}
              <span className={styles.label}>{item.label}</span>
              {item.hint && <span className={styles.hint}>{item.hint}</span>}
            </li>
          ))}
        </ul>
        {isOpen && results.length === 0 && <p className={styles.empty}>{emptyMessage}</p>}
      </div>
    </dialog>
  )
}

export default Picker
