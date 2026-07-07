import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/auth/AuthProvider.jsx'
import { AuthGate } from './features/auth/AuthGate.jsx'

function hideSplash() {
  const splash = document.getElementById('pwa-splash')
  if (!splash) return
  splash.classList.add('pwa-splash--hidden')
  window.setTimeout(() => splash.remove(), 220)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </AuthProvider>
  </StrictMode>,
)

requestAnimationFrame(hideSplash)
