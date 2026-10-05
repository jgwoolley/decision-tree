import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedDefaultTreeIfNeeded } from './lib/seedDefaultTree'

// This app's own service worker is registered separately (by vite-plugin-pwa's
// injected script) as /sw.js. If a *different* worker from a previously served
// app is still controlling this origin (common when dev ports get reused),
// unregister it so it stops intercepting (and potentially breaking) our requests.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      const scriptUrl =
        registration.active?.scriptURL ??
        registration.waiting?.scriptURL ??
        registration.installing?.scriptURL ??
        '';
      if (!scriptUrl.endsWith('/sw.js')) registration.unregister();
    }
  });
}

void seedDefaultTreeIfNeeded();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
