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
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('ℹ️ SW update found, installing...');
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available - manual update only
                console.log('ℹ️ SW update available (manual apply only)');
              }
            });
          }
        };

        // Expose manual update trigger for optional UI wiring
        (window as any).__APPLY_PWA_UPDATE__ = () => {
          if (registration.waiting) {
            console.log('ℹ️ Applying waiting SW update (no auto reload)');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          } else {
            console.log('ℹ️ No waiting SW update to apply');
          }
        };
      })
      .catch((error) => {
        console.error('❌ SW registration failed:', error);
      });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('ℹ️ SW controller changed (no auto reload)');
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
      api.notify({ title: 'Update available', body: 'A new version of Cantio is available.' });
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

