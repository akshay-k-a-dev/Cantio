const { app, BrowserWindow, shell, Tray, Menu, ipcMain, Notification, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Setup auto-updater logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;

// Backwards-compatible env vars: prefer CANTIO_REMOTE_URL, fallback to MUSICMU_REMOTE_URL
const REMOTE_URL = process.env.CANTIO_REMOTE_URL || process.env.MUSICMU_REMOTE_URL || 'https://music-mu-p6h9.vercel.app/';
const USE_REMOTE = process.env.USE_REMOTE === '1';
const LOCAL_INDEX = path.join(__dirname, 'dist', 'index.html');
let tray = null;
let mainWindow = null;
let updateDownloaded = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Prefer local packaged frontend when available; fall back to remote URL
  if (!USE_REMOTE && fs.existsSync(LOCAL_INDEX)) {
    const loadUrl = `file://${LOCAL_INDEX}`;
    mainWindow.loadURL(loadUrl).catch(err => {
      log.error('Failed to load local index, falling back to remote', err);
      mainWindow.loadURL(REMOTE_URL).catch(e => log.error('Failed to load remote URL', e));
    });
  } else {
    mainWindow.loadURL(REMOTE_URL).catch(err => log.error('Failed to load remote URL', err));
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Optionally open devtools when DEBUG env var is set
  if (process.env.DEBUG === '1') mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Register media key shortcuts
  try {
    globalShortcut.register('MediaPlayPause', () => mainWindow && mainWindow.webContents.send('media-key', 'play-pause'));
    globalShortcut.register('MediaNextTrack', () => mainWindow && mainWindow.webContents.send('media-key', 'next'));
    globalShortcut.register('MediaPreviousTrack', () => mainWindow && mainWindow.webContents.send('media-key', 'previous'));
  } catch (err) {
    log.warn('Failed to register global shortcuts', err);
  }
}

function createTray() {
  if (tray) return;
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow && mainWindow.show() },
    { label: 'Check for updates', click: () => autoUpdater.checkForUpdates().catch(e => log.error(e)) },
    { label: 'Install Update', enabled: false, id: 'install-update', click: () => autoUpdater.quitAndInstall() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Cantio');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow && mainWindow.show());
}

function updateTrayInstallEnabled(enabled) {
  if (!tray) return;
  const menu = tray.getContextMenu();
  const item = menu.getMenuItemById('install-update');
  if (item) item.enabled = !!enabled;
}

// Ensure single-instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId('com.cantio.app');

    // Register default protocol handler (support both old and new scheme for compatibility)
    try {
      app.setAsDefaultProtocolClient('cantio');
      // Also attempt to register legacy 'musicmu' scheme for existing users
      try { app.setAsDefaultProtocolClient('musicmu'); } catch (e) { /* ignore */ }
    } catch (err) {
      log.warn('Could not register protocol handler', err);
    }

    createWindow();
    createTray();

    // Check for updates on startup (non-node envs may require configuration)
    autoUpdater.checkForUpdates().catch(e => log.error(e));

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

// IPC handlers
ipcMain.handle('notify', (event, opts) => {
  try {
    const noteOpts = { title: opts.title || 'Cantio', body: opts.body || '' };
    if (opts.icon) noteOpts.icon = opts.icon;
    const note = new Notification(noteOpts);
    note.show();
    note.on('click', () => {
      try {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      } catch (e) {
        log.warn('Failed to focus main window on notification click', e);
      }
    });
    return { ok: true };
  } catch (err) {
    log.error('Notification failed', err);
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const res = await autoUpdater.checkForUpdates();
    return { ok: true, info: res || null };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('install-update', async () => {
  try {
    autoUpdater.quitAndInstall();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

// Auto-updater events
autoUpdater.on('update-available', info => {
  log.info('Update available', info);
  if (mainWindow) mainWindow.webContents.send('update-event', { type: 'update-available', info });
});

autoUpdater.on('update-not-available', info => {
  log.info('No update available', info);
  if (mainWindow) mainWindow.webContents.send('update-event', { type: 'update-not-available', info });
});

autoUpdater.on('error', err => {
  log.error('Update error', err);
  if (mainWindow) mainWindow.webContents.send('update-event', { type: 'error', error: String(err) });
});

autoUpdater.on('download-progress', progress => {
  if (mainWindow) mainWindow.webContents.send('update-event', { type: 'download-progress', progress });
});

autoUpdater.on('update-downloaded', info => {
  log.info('Update downloaded', info);
  updateDownloaded = true;
  updateTrayInstallEnabled(true);
  if (mainWindow) mainWindow.webContents.send('update-event', { type: 'update-downloaded', info });
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  try { globalShortcut.unregisterAll(); } catch (e) { /* ignore */ }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});