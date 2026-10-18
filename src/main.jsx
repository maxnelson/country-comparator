import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Precaches the build for offline use and instant repeat loads. When a newer
// build is found it takes over and the page reloads; all state lives in the
// URL, so nothing is lost.
registerSW()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
