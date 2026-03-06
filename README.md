<div align="center">

# Cantio

### Privacy-first open-source music player

**Stream music. Own your data. No account required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://music.akshayka.dev/)

**[🌐 Open Web App](https://music.akshayka.dev/)** · **[📖 Contributing](./CONTRIBUTING.md)** · **[📦 Download Desktop](#-desktop-downloads)**

</div>

---

## What is Cantio?

Most music apps demand an account before you can press play. They track everything you listen to, sell that data to advertisers, and lock features behind paid tiers.

**Cantio doesn't do any of that.**

- Search and play without signing up
- No analytics, no telemetry, no ads
- Create an account *only* if you want to sync across devices
- Fully open source — audit every line

---

## Features

### Playback
- 🎵 Stream from YouTube Music — no ads, no interruptions
- ⏭️ Unlimited skips
- 🔁 Shuffle, repeat-track, repeat-queue modes
- 🕹️ Drag-and-drop queue reorder with auto-scroll
- 📜 Synced lyrics panel

### Library
- ❤️ Liked songs
- 📋 Multiple playlists
- 🔀 Blends — merge your taste with a friend's and get a shared playlist
- ⏳ Play history with reverse-queue (previous button that actually works)

### Privacy & Sync
- 👤 Guest mode — works fully offline, no login ever needed
- ☁️ Optional account sync — liked songs, playlists, history across devices
- 🔓 Open source — no black boxes

### Platforms
- 🌐 Web app (PWA — installable on any device)
- 🖥️ Desktop app (Windows, Linux)
- 📱 Mobile app (in progress)

---

## Try It Now

| Platform | Link |
|---|---|
| Web App | [music.akshayka.dev](https://music.akshayka.dev/) |
| Landing Page | [/landing](https://music.akshayka.dev/landing) |

No sign-up needed. Search a song, click play.

---

## Desktop Downloads

| Platform | File |
|---|---|
| Windows | [Cantio.Setup.1.0.0.exe](https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/Cantio.Setup.1.0.0.exe) |
| Linux — Debian/Ubuntu | [cantio-desktop_1.0.0_amd64.deb](https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/cantio-desktop_1.0.0_amd64.deb) |
| Linux — AppImage | [Cantio-1.0.0.AppImage](https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/Cantio-1.0.0.AppImage) |
| Android | Coming Soon |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Framer Motion |
| Backend | Fastify, TypeScript, Prisma, PostgreSQL |
| Search / Metadata | Innertube (youtubei.js) |
| Playback | YouTube IFrame Player API |
| Desktop | Electron |
| Deployment | Vercel (serverless) |

---

## Project Structure

```
vercel-serverless/
├── backend/          # Fastify API + Prisma ORM
│   ├── src/routes/   # auth, likes, playlists, blends, history, recommendations
│   └── prisma/       # schema + migrations
└── frontend/         # React + Vite client
    └── src/
        ├── pages/    # Home, Search, Queue, Playlists, Blends, Profile …
        ├── components/
        ├── services/ # player service (YouTube IFrame + queue logic)
        └── lib/      # Zustand stores, IndexedDB cache
desktop-app/          # Electron wrapper
mobile-app/           # React Native app (in progress)
```

---

## Local Development

### Frontend

```bash
cd vercel-serverless/frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd vercel-serverless/backend
npm install
# create .env — see below
npx prisma migrate dev
npm run dev        # http://localhost:3000
```

#### Backend `.env`

```env
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
```

#### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

> ⚠️ **Do not change `VITE_API_URL` in production** without coordinating with the deployment owner — it points to the live Vercel backend. Changing it will break the live site.

---

## API Overview

Base URL: `https://music-mu-lovat.vercel.app/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/search?q=&limit=` | — | Search tracks |
| GET | `/track/:id` | — | Track metadata |
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login (returns JWT) |
| GET | `/likes` | ✅ | Get liked tracks |
| POST | `/likes` | ✅ | Like a track |
| GET | `/playlists` | ✅ | List playlists |
| POST | `/playlists` | ✅ | Create playlist |
| GET | `/recommendations` | ✅ | Personalised recommendations |
| POST | `/blends/invite` | ✅ | Send blend invite |
| GET | `/blends` | ✅ | List blends |

---

## Roadmap

- [x] Core playback + queue system
- [x] Liked songs + playlists
- [x] Blends (collaborative playlists)
- [x] Drag-and-drop queue reorder
- [x] Desktop app (Windows + Linux)
- [x] Shuffle / repeat modes
- [x] Lyrics panel
- [x] YT Music search (songs, albums, artists, playlists)
- [ ] Android app
- [ ] macOS desktop build
- [ ] Self-hosted backend support
- [ ] Last.fm scrobbling integration

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, commit style, and PR workflow.

---

## Legal

> ⚠️ Cantio is not affiliated with or endorsed by Google LLC or YouTube.
> Streaming uses the official YouTube IFrame Player API under YouTube's terms of service.
> No copyrighted material is stored or redistributed.

---

## License

MIT — see [LICENSE](./LICENSE).

---

<div align="center">
Made with 💜 for listeners who want control, simplicity, and peace.
</div>
