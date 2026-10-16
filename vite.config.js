import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is set by the deploy workflow (e.g. "/country-comparator/" on
// GitHub Pages). Locally it defaults to "/" so `npm run dev` works unchanged.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
