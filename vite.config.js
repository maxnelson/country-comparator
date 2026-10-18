import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// BASE_PATH is set by the deploy workflow (e.g. "/country-comparator/" on
// GitHub Pages). Locally it defaults to "/" so `npm run dev` works unchanged.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    // Web app manifest plus a Workbox service worker that precaches the whole
    // build. The data is bundled into the JS, so the app works offline once it
    // has loaded once. The register call is in src/main.jsx: with autoUpdate a
    // new build installs in the background and reloads the page.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeManifestIcons: false, // the glob below already precaches them
      manifest: {
        name: 'Country Comparator',
        short_name: 'Countries',
        description: 'Compare countries side by side: population, economy, geography and more.',
        theme_color: '#218573', // --teal-600, the header colour
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        // The plugin only sets these itself when it injects the register
        // script; with injectRegister: false they are ours to set. Together
        // they make a new build take over as soon as it has installed.
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
