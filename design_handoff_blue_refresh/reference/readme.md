# Country Comparator — design system

Country Comparator is a mobile-first web app for comparing countries side by side: pull it up on a phone to settle a question in seconds, or use it in a desktop browser. It has one screen, a frozen-panes table with flags across the top and metrics down the side, and every comparison is a shareable URL (`?countries=us-jp-de&metrics=population-gdp_usd`). It uses real data for 201 countries and territories from the World Bank, the CIA World Factbook (final edition) and mledoze/countries.

This system is a **polish pass, not a redesign**. The layout, density, emoji flags and plain presentation are unchanged. Changes from the app as built:

- **One brand hue.** The teal header and mint buttons are replaced by a single blue ramp (OKLCH, hue 255). `--blue-700` #2569B8 is used for the header, primary fills and the mark. Mint is kept as a backup in `tokens/backup/mint.css`, which is not imported.
- **Primary moves one step darker** (mint-600 to blue-700), so white labels on it pass 4.5:1 contrast.
- **Radii, shadows, motion and table metrics are now named tokens.** In the app they were hard-coded literals.
- **New mark:** two rounded bars, short then tall, taken from the owner's `favicon.svg`. It now sits in the header next to the wordmark.
- **Single rule between the header row and the first metric row.** In the app this is a double 1px line.

## Sources

- GitHub: `maxnelson/country-comparator` (branch `main`): `src/styles/tokens.css`, `src/components/{Header,Footer,ComparisonTable,Picker}`, `src/data/metrics.js`, `src/data/countries.json`.
- Live: https://maxnelson.github.io/country-comparator/
- `Foundations Explorations.dc.html` in this project records the decisions: type 1a–1c, header 1d–1e, mark 1f–1h, palettes 2a–2c. **2a Blue was chosen**, with system-ui type and the solid header.

## Content fundamentals

- **Plain, short, sentence case.** Labels name the thing and its unit: "Life expectancy (years)", "Pop. density (per sq mi)", "CO₂ (tons / capita)". Units go in parentheses after the label, never in the value cell.
- **Verbs on buttons:** "Add metric", "Edit" / "Done". Picker titles use the article ("Add a country", "Add a metric"). Placeholders start with "Search": "Search countries".
- **Empty states state the fact:** "No countries match". No apologies and no exclamation marks.
- **Second person is implied, never written.** There's no "you" or "we" in the UI. The footer uses "About us", "Contact" and "Privacy".
- **Numbers:** comma grouping for counts ("341,784,857"), compact notation for very large money ("$30.77T"), `$` prefix, `%` suffix, one decimal by default, and "—" for missing data.
- **Emoji:** flags only. They are the product's imagery. No other emoji anywhere.
- **Tab title:** "United States vs Japan vs Germany · Country Comparator". With more than three countries it becomes "A vs B and 2 more".

## Visual foundations

- **Color:** mostly ink on white. Pinned panes (header row, toolbar, corner) sit on gray-50. Blue appears in four places: the header bar, the add-country button, the active Done button and focus rings. Blue-50 tints show hover, the selected picker option and a dragged column. Red appears only on Edit-mode remove buttons. There are no gradients.
- **Type:** the platform's own font (`system-ui`) in three weights, 400, 500 and 600. Values are 600 with tabular numerals and −0.01em tracking; labels and country names are muted 12px. The only uppercase is the footer column headings (14px, 0.05em tracking).
- **Imagery:** none beyond emoji flags. No photos and no illustrations.
- **Layout:** full-bleed. The table uses every pixel and there is one breakpoint, at 768px. On phones each metric label spans the row above its values; at 768px and up labels get a pinned 220px column. Columns share the width when they fit and scroll sideways when they don't, with floors of 96px (phone) and 160px (desktop). The document never scrolls; one inner scroller does. Header and footer are `sticky; left: 0`.
- **Fixed elements:** the header row is pinned top, labels pinned left, the add-country lane pinned right, and the Add metric / Edit toolbar pinned bottom. The toolbar is the only translucent element: 94% gray-50 with an 8px backdrop blur.
- **Borders:** 1px gray-200 hairlines between rows and down the label column. Cards are not used; the table is the surface.
- **Corners:** soft — 6px for handles, 10px for buttons, inputs and options, 12px for the popover, 16px for the sheet top, fully round for icon buttons, and 21.875% for the app icon.
- **Elevation:** shadows go only on things that float — `sm` for the add button, `md` for a dragged row or column, `lg` for the popover, `sheet` for the bottom sheet. Backdrops are 40% ink on phones and 12% on desktop.
- **Hover:** outlined buttons get a blue-50 fill, blue-300 border and blue-700 text. Solid controls go one ramp step darker. Links turn blue-700. The wordmark drops to 85% opacity.
- **Press:** the add button scales to .94 and remove to .92. There are no color flashes.
- **Focus:** a 2px blue-500 outline. On inputs it sits inset (offset −1px) and the fill turns white.
- **Motion:** 0.15s color and transform transitions. The sheet slides up 24px in 0.2s ease-out; the popover fades in over 0.12s. Animations are disabled under `prefers-reduced-motion`.
- **Touch:** every control has a 44px hit area. Visible sizes are smaller: 24px for remove, 28px for handles, 36px for add.

## Iconography

- **The full set is four inline stroke SVGs copied from the app:** plus and remove (2.25 stroke), close (2 stroke) and a six-dot grip. They use rounded caps, inherit `currentColor`, and are wrapped by `Icon`.
- **No icon font, sprite or library.** Don't add Lucide or Heroicons; widen the set only when a new control truly needs it.
- **Emoji flags are the only pictorial element:** 28px in the phone header row, 36px on desktop, 24px in the picker.
- **No unicode-character icons.**
- **Brand assets** are in `assets/`:
  - `mark.svg`: the blue tile, also used as the favicon
  - `mark-bars-white.svg`: white bars for the header
  - `mark-bars-blue.svg`: blue bars for light grounds

## Index

- `styles.css`: entry point; `@import`s only.
- `tokens/`
  - `colors.css`: blue and gray ramps, semantic `--color-*`
  - `typography.css`
  - `spacing.css`: space, radii, shadows, layout, motion
  - `base.css`: resets, links, focus, keyframes
  - `backup/mint.css`: not imported
- `components/`
  - `core/`: `Button`, `IconButton`, `Icon`
  - `forms/`: `SearchInput`
  - `picker/`: `Picker` (+ `filterItems`)
  - `navigation/`: `Header`, `Footer`
  - `table/`: `ComparisonTable`
  - `brand/`: `Mark`
- `guidelines/`: foundation specimen cards (Colors, Type, Spacing, Brand).
- `ui_kits/app/`: interactive phone/desktop recreation of the app.
- `assets/`: marks, plus `ds-loader.js`, which resolves the component namespace for cards and kits.
- `Foundations Explorations.dc.html`: the decision canvas.
- `SKILL.md`

### Intentional additions

These aren't separate components in the app:

- `Icon`: wraps the app's inline glyphs.
- `Mark`: the new logo.
- `SearchInput`: split out of `Picker`.
