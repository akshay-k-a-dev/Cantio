# Cantio — Vercel Frontend (Vite + React)

![Vercel Frontend](../../docs/images/vercel-frontend.svg)

This directory contains the React + Vite frontend for Cantio and PWA assets. The deployed site is hosted on Vercel (see `VITE_API_URL` for the backend endpoint used by the build).

Releases

- Desktop installers (.AppImage, .deb, .exe) are attached to GitHub Releases for the repository; the frontend repo references those assets for the desktop download pages.

Quick start

```bash
cd vercel-serverless/frontend
npm install
npm run dev
```

Notes
- Do NOT change deployment URLs or environment variables (e.g., `VITE_API_URL`, `VITE_APP_NAME`) in code or documentation without coordinating with the release/CI owner — changing these can break live deployments.
- For details on building PWA assets and service worker behavior, refer to the `public/` directory and `vite.config.ts`.
