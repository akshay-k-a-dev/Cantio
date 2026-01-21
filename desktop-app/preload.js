const { contextBridge, shell, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => shell.openExternal(url),
  // Media key events: 'play-pause', 'next', 'previous'
  onMediaKey: (cb) => ipcRenderer.on('media-key', (event, key) => cb(key)),
  // Show a native notification from renderer
  notify: (opts) => ipcRenderer.invoke('notify', opts),
  // Auto-updater controls
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateEvent: (cb) => ipcRenderer.on('update-event', (e, data) => cb(data))
});