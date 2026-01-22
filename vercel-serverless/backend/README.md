# Cantio — Vercel Serverless Backend

![Vercel Backend](../../docs/images/vercel-backend.svg)

This directory contains the Fastify serverless backend deployed on Vercel. It provides REST endpoints for search, track metadata, likes, playlists, blends, and other API routes.

Releases and desktop installer artifacts (AppImage, DEB, EXE) are published on the GitHub Releases page for the repo — desktop release assets are not stored inside this backend directory.

Quick start

```bash
cd vercel-serverless/backend
npm install
npm run dev
```

Notes
- Do NOT change deployment URLs or environment variables (e.g., `VITE_API_URL`, `CANTIO_REMOTE_URL`, `MUSICMU_REMOTE_URL`, etc.) in code or documentation without coordinating with the release/CI owner — changing these can break live deployments.
- For full API doc, see the project root `README.md` and `PROJECT_DOCUMENTATION.md`.
