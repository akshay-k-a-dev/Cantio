import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ SW registered:', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                if (confirm('New version available! Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ SW registration failed:', error);
      });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}

import { usePlayer } from './services/player';

if (typeof window !== 'undefined' && (window as any).electronAPI) {
  const api = (window as any).electronAPI;

  api.onMediaKey((key: string) => {
    const player = usePlayer.getState();
    try {
      if (key === 'play-pause') player.togglePlay();
      else if (key === 'next') player.next();
      else if (key === 'previous') player.prev();
    } catch (e) {
      console.warn('Media key handler error', e);
    }
  });

  api.onUpdateEvent((ev: any) => {
    if (!ev || !ev.type) return;
    if (ev.type === 'update-available') {
      api.notify({ title: 'Update available', body: 'A new version of MusicMu is available.' });
    } else if (ev.type === 'update-downloaded') {
      api.notify({ title: 'Update ready', body: 'Update downloaded. Restart to install.' });
    } else if (ev.type === 'error') {
      api.notify({ title: 'Update error', body: (ev.error || 'Failed to check for updates') });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

