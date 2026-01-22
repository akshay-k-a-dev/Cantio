# Cantio Desktop

An Electron wrapper for Cantio that loads the web frontend and packages native installers.

## Features
- Loads the deployed frontend by default: `https://music-mu-lovat.vercel.app/`
- Optionally load a local `vercel-serverless/frontend/dist` build for an offline packaged app
- Targets: Linux AppImage and Windows NSIS installer (.exe)

## Quick start

1. Install dependencies:

```bash
cd desktop-app
npm install
```

2. Run the app (loads remote site by default):

```bash
npm start
```

3. To use a local frontend build (recommended for distributable builds):

```bash
# from the desktop-app directory
npm run build:web
# this will build the frontend with VITE_API_URL set to the deployed backend
# and copy the generated `dist` into `desktop-app/dist`

# run the app locally (loads packaged files if present)
npm start
```

4. Package installers (creates AppImage for Linux and NSIS installer for Windows):

```bash
npm run dist
```

Notes:
- Building Windows installers on Linux usually requires `wine` and related tools. For cross-building consult `electron-builder` docs: https://www.electron.build/
- Add proper icons under `desktop-app/assets/` named `icon.png` (512x512 recommended) and `icon.ico` for Windows for best results. The build process will copy `public/icon.svg` into `assets/` automatically; convert it to PNG/ICO or provide your own.

Environment variables:
- `USE_REMOTE=1` — force the app to load the remote site instead of packaged files
- `CANTIO_REMOTE_URL` — override default remote URL (backwards-compatible with `MUSICMU_REMOTE_URL`)
- `DEBUG=1` — open DevTools on app start

This app is a fully-packaged desktop application that contains the built frontend (bundled into the AppImage / installer) and uses the remote frontend at `https://music-mu-p6h9.vercel.app/` (and the backend at `https://music-mu-lovat.vercel.app/` for API requests). It supports a system tray and single-instance behaviour.

## New native features added 🔧

- **Media keys** — global media key support for Play/Pause, Next, and Previous. The renderer can listen for events with `window.electronAPI.onMediaKey(cb)` and control the player accordingly.
- **Notifications** — renderer can call `window.electronAPI.notify({title, body, icon})` to show native OS notifications. Clicking a notification will show and focus the app. 
- **Auto-updates** — `electron-updater` is integrated and checks for updates on startup. The tray has a "Check for updates" item and will enable "Install Update" when an update has been downloaded. Configure `publish` in `package.json` (GitHub publish provider) and set `GH_TOKEN` for private repos to enable automatic updates. For more advanced setups (private update server, S3), consult https://www.electron.build/auto-update.
- **Icons** — `npm run generate-icons` (run automatically after install) creates `assets/icon.png` (512×512) and `assets/icon.ico`. You can replace these files with custom artwork.
- **Installer customizations** — added `protocols` (`cantio://`) and `fileAssociations` (e.g., `.m3u`) in `package.json` build configuration. Update `publish` owner/repo fields before publishing.

## Notes on auto-updates 🔁
- The auto-update integration uses GitHub Releases by default (see `build.publish` in `package.json`).
- To publish updates using GitHub: create releases via the GitHub UI or `gh`/CI and make sure `GH_TOKEN` (with repo access) is available to the publishing tool.
- Auto-update behavior requires the app to be installed via the packaged installer.

---

## Releases & Assets

- Desktop artifacts (AppImage for Linux, `.deb` packages, and Windows `.exe` installers) are published on GitHub Releases for the repository. The app's auto-update depends on those release assets; do not move or rename release artifacts once published.

**Important:** Do NOT change deployment URLs or environment variables (for example `VITE_API_URL`, `CANTIO_REMOTE_URL`, `MUSICMU_REMOTE_URL`, `VITE_APP_NAME`, etc.) in code or documentation without prior coordination with a release or CI owner — changing these values can break the hosted deployments and update flows.

---

If you'd like, I can run the build steps now and produce an AppImage for Linux and a Windows NSIS installer (Windows build may require `wine`). Which target should I build first?