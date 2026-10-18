#!/usr/bin/env node
// Renders the app icon to every size the web app manifest and iOS need, and
// rewrites public/favicon.svg from the same drawing. Run after changing the
// icon; the PNGs are committed.
//
//   node scripts/make-icons.mjs
//
// Rendering uses Playwright's Chromium so the PNGs match what browsers draw.
// Cloud sessions have Playwright installed globally; locally run
// `npm i -g playwright && npx playwright install chromium` first.

import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url))

// Brand colours, mirroring src/styles/tokens.css. The background is the header
// colour (--teal-600), which is also the manifest's theme_color. Solid, not a
// gradient: the PNGs are precached, and a gradient makes them ten times larger.
const TEAL_600 = '#218573'
const WHITE = '#FFFFFF'

// The glyph: two pill-shaped bars of different heights, two things compared.
// Drawn on a 512 box; the group is centred at (256, 256).
const BARS = [
  { x: 132, y: 206, w: 96, h: 200 },
  { x: 284, y: 106, w: 96, h: 300 },
]

// bleed: the background fills the whole square (iOS and maskable icons) instead
//   of a rounded square with transparent corners (favicon and "any" icons).
// scale: glyph scale about the centre. Maskable icons use 0.8 so the glyph stays
//   inside the 80% safe circle that launchers may crop to.
const TARGETS = [
  { file: 'pwa-192x192.png', size: 192, bleed: false, scale: 1 },
  { file: 'pwa-512x512.png', size: 512, bleed: false, scale: 1 },
  { file: 'maskable-icon-512x512.png', size: 512, bleed: true, scale: 0.8 },
  { file: 'apple-touch-icon-180x180.png', size: 180, bleed: true, scale: 1 },
]

function iconSvg({ bleed, scale }, size) {
  const dim = size ? ` width="${size}" height="${size}"` : ''
  const rx = bleed ? 0 : 112
  const bars = BARS.map(
    (b) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.w / 2}" fill="${WHITE}"/>`,
  ).join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"${dim}>` +
    `<rect width="512" height="512" rx="${rx}" fill="${TEAL_600}"/>` +
    `<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${bars}</g>` +
    `</svg>`
  )
}

async function loadPlaywright() {
  try {
    return await import('playwright')
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim()
    return createRequire(path.join(globalRoot, 'index.js'))('playwright')
  }
}

const { chromium } = await loadPlaywright()
const executablePath = ['/opt/pw-browsers/chromium'].find((p) => existsSync(p))
const browser = await chromium.launch({ executablePath })
const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const target of TARGETS) {
  await page.setViewportSize({ width: target.size, height: target.size })
  await page.setContent(
    `<!doctype html><style>body{margin:0;background:transparent}svg{display:block}</style>` +
      iconSvg(target, target.size),
  )
  const png = await page.screenshot({ omitBackground: true, type: 'png' })
  writeFileSync(path.join(PUBLIC, target.file), png)
  console.log(`${target.file}  ${png.length} bytes`)
}
await browser.close()

writeFileSync(path.join(PUBLIC, 'favicon.svg'), iconSvg({ bleed: false, scale: 1 }) + '\n')
console.log('favicon.svg')
