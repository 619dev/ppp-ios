import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker } from './api/push'
import { isNativePlatform } from './utils/platform'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for PWA + push notifications (web only, not Capacitor native)
if (!isNativePlatform()) {
  registerServiceWorker()
}

