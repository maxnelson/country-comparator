# Handoff: Blue refresh (design system polish)

## Overview
This is a polish pass on Country Comparator. It is **not** a redesign: the layout, density, emoji flags, copy and behavior all stay exactly as they are. Three things change:

1. **One brand hue.** The teal header and mint buttons become a single blue ramp. `--blue-700` (#2569B8) is used for the header, primary fills and the mark.
2. **New mark.** Two rounded bars: a white bars glyph in the header next to the wordmark, and a new blue tile for the favicon and app icon.
3. **Tokenized details.** Radii, shadows and motion become named tokens, and components stop referencing palette steps (`--mint-*`, `--teal-*`) directly.

## About the design files
Two kinds of files are included:

- **`drop-in/`** holds real files that mirror the repo's paths. Copy them over the existing files.
- **`reference/`** holds design references built in HTML. They show the intended look and behavior and are **not** code to ship. Recreate any changes they imply in the existing React + CSS Modules code.

## Fidelity
High fidelity. The colors, sizes and states listed here are final.

## Changes, file by file

### 1. `src/styles/tokens.css` → replace with `drop-in/src/styles/tokens.css`
- The `--mint-*` and `--teal-*` scales are **removed**. `--blue-*` and `--red-600/700` are added; gray is unchanged.
- Existing semantic names keep their names and now point at blue:
  - `--color-brand` = blue-400
  - `--color-brand-strong` = blue-700
  - `--color-accent` = blue-500 (focus ring)
  - `--color-link-hover` = blue-700
  - `--color-header-bg` = blue-700
- New semantic tokens:
  - brand: `--color-brand-stronger` (blue-800), `--color-brand-tint` (blue-50), `--color-brand-tint-border` (blue-300)
  - neutrals: `--color-border-strong`, `--color-handle`, `--color-disabled-fill`, `--color-grabber`
  - overlays: `--color-backdrop`, `--color-backdrop-light`
  - `--radius-sm/md/lg/xl/full`
  - `--shadow-sm/md/lg/sheet`
  - `--duration-fast/sheet/popover`
  - `--font-size-xs`
  - `--touch-target`

### 2. `public/favicon.svg` → replace
The new tile is the same rounded-bars geometry as the current favicon, recolored from #218573 to #2569B8. The footer already shows `favicon.svg`, so it updates automatically.

### 3. `public/mark-bars-white.svg` → add (new)

### 4. `src/components/Header/Header.jsx` and `Header.module.css` → replace
- The header now shows the white bars mark before the wordmark: 20px tall, with an 8px (`--space-2`) gap.
- `.logo` becomes `inline-flex; align-items: center`.
- The image URL is built from `import.meta.env.BASE_URL`, per CLAUDE.md.

### 5. `src/components/ComparisonTable/ComparisonTable.module.css` → edit
Swap every palette reference for a semantic token:

| Rule | Before | After |
|---|---|---|
| `.addColumnButton` background | `var(--color-brand-strong)` | unchanged (now blue-700) |
| `.addColumnButton` box-shadow | `0 1px 2px rgba(0,0,0,.18)` | `var(--shadow-sm)` |
| `.addColumnButton:hover:not(:disabled)` | `var(--mint-700)` | `var(--color-brand-stronger)` |
| `.addColumnButton:disabled` | `var(--gray-300)` | `var(--color-disabled-fill)` |
| `.handle` color | `var(--gray-400)` | `var(--color-handle)` |
| `.handle` border-radius | `6px` | `var(--radius-sm)` |
| `.row[data-dragging]`, `.headerCell[data-dragging]` box-shadow | `0 6px 20px rgba(0,0,0,.16)` | `var(--shadow-md)` |
| `.headerCell[data-dragging]` background | `var(--mint-50)` | `var(--color-brand-tint)` |
| `.headerCell[data-dragging]` border-radius | `10px` | `var(--radius-md)` |
| `.addRowButton, .editButton` border-radius | `10px` | `var(--radius-md)` |
| `.addRowButton:hover…, .editButton:hover…` | `var(--mint-50)` / `var(--mint-300)` / `var(--color-brand-strong)` | `var(--color-brand-tint)` / `var(--color-brand-tint-border)` / `var(--color-brand-strong)` |
| `.editing` (Done) | `var(--color-brand-strong)` | unchanged; **add** `.editing:hover { background: var(--color-brand-stronger); border-color: var(--color-brand-stronger); }` |
| `.removeButton`, `.addColumnButton`, `.addRowButton` transitions | `0.15s` | `var(--duration-fast)` |

Also add this rule to fix the doubled 1px line under the pinned header row:
```css
.headerRow + .row { border-top: 0; }
```

### 6. `src/components/ComparisonTable/ComparisonTable.jsx` → edit one line
In `CountryHeader`, change the dragged column's tint from `'var(--mint-50)'` to `'var(--color-brand-tint)'`.

### 7. `src/components/Picker/Picker.module.css` → edit
| Rule | Before | After |
|---|---|---|
| `.dialog::backdrop` | `rgba(24,24,27,.4)`; at 768px+ `.12` | `var(--color-backdrop)` / `var(--color-backdrop-light)` |
| `.panel` radius / shadow (phone) | `16px 16px 0 0` / `0 -8px 32px …` | `var(--radius-xl) var(--radius-xl) 0 0` / `var(--shadow-sheet)` |
| `.panel` radius / shadow (768px+) | `12px` / `0 12px 32px …` | `var(--radius-lg)` / `var(--shadow-lg)` |
| `.grabber` | `var(--gray-300)` | `var(--color-grabber)` |
| `.close` radius | `50%` | `var(--radius-full)` |
| `.input`, `.option` radius | `10px` | `var(--radius-md)` |
| `.input:focus` outline | `var(--color-accent)` | unchanged (now blue-500) |
| `.active` | `var(--mint-50)` | `var(--color-brand-tint)` |
| animations | `0.2s` / `0.12s` | `var(--duration-sheet)` / `var(--duration-popover)` |

### 8. `index.html`
If it sets `<meta name="theme-color">`, change it to `#2569B8`. If it doesn't, add it; the Phase 1 manifest item will need it anyway.

### 9. Check
- Search the whole repo for `--mint-` and `--teal-`. There must be **zero** hits when you're done.
- `npm run lint`, `npm test` and `npm run build` must all be green.
- Take Playwright screenshots at 1280×900 and 390×844 in both normal and Edit mode.

## Design tokens (final values)
- **Blue:**

  | Step | Hex |
  |---|---|
  | 50 | #F4F8FE |
  | 100 | #E4EFFE |
  | 200 | #CAE0FD |
  | 300 | #B1D2FE |
  | 400 | #98C4FD |
  | 500 | #59A0F9 |
  | 600 | #3D84DB |
  | 700 | #2569B8 |
  | 800 | #124F93 |
  | 900 | #06376C |

- **Gray:** unchanged (zinc 50–900).
- **Red:** 600 #DC2626, 700 #B91C1C.
- **Radii:** 6 / 10 / 12 / 16 / 999 px.
- **Shadows:**
  - sm `0 1px 2px rgba(0,0,0,.18)`
  - md `0 6px 20px rgba(0,0,0,.16)`
  - lg `0 12px 32px rgba(0,0,0,.16)`
  - sheet `0 -8px 32px rgba(0,0,0,.18)`
- **Type:** system-ui, unchanged sizes, weights 400/500/600.

## Interactions
Unchanged, apart from the new hover state on the active Done button (blue-800).

## Assets
- `favicon.svg`: owner-supplied rounded-bars geometry, recolored.
- `mark-bars-white.svg`: the same bars without the tile.
- No other icons change.

## Reference files
- `reference/readme.md`: the full design guide (copy tone, visual rules, iconography).
- `reference/tokens/`: the design system's token files.
- `reference/components/`: React reference versions of Header, Footer, ComparisonTable, Picker, Button and IconButton (inline styles, for visual reference only).
- `reference/ui_kits/app/`: an interactive phone/desktop prototype. Open `index.html` through a local server.
- `reference/guidelines/`: specimen cards for colors, type, spacing and brand.
