
# 🎵 Cantio - Ad-Free Open Source Music Streamer

**A free and open-source music streaming application — built for music lovers, not algorithms.**

> ⚠️ **Not affiliated with or endorsed by Google LLC or YouTube.**  
> Cantio streams content using official YouTube embedding policies and does not store or redistribute copyrighted material.

## 🌟 Quick Links

- **Live Demo**: https://music-mu-p6h9.vercel.app/
- **Backend API**: https://music-mu-lovat.vercel.app/api
- **Full Documentation**: See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for detailed architecture, features, and database schema

---

## ✨ What Makes Cantio Special?

### 🎧 Core Playback Features
- 🚫 **Ad-Free Streaming** — Enjoy uninterrupted audio streaming
- ⏭️ **Unlimited Skips** — Skip freely without restrictions
- 🔊 **Audio-Only Mode** — Save bandwidth, focus on sound
- 🎛️ **Full Playback Control** — Seek, play, pause, queue management without limitations
- 🔁 **Smart Queue System** — Dual-queue architecture (forward & history-based)
- 👤 **Dual Mode Support** — Guest mode (localStorage) or authenticated (database)
- 🎵 **Collaborative Blends** — Create shared playlists with friends

### 🏗️ Modern Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS with glassmorphic design
- **Backend**: Fastify serverless on Vercel with PostgreSQL (Prisma)
- **Search**: Innertube (YouTube metadata)
- **Playback**: YouTube IFrame API (official, no copyright violations)
- **Storage**: IndexedDB (guest) + PostgreSQL (authenticated)

### 📱 Pages & Features
- **Home** – Personalized recommendations with artist insights
- **Search** – YouTube-powered track discovery with load-more
- **Liked Songs** – Personal liked tracks collection
- **Queue** – Visual queue management with reverse history
- **Playlists** – Create and manage custom playlists
- **Blends** – Collaborative playlists with friends (invite-based)
- **Profile** – User settings and stats
- **Mobile Navigation** – Full responsive mobile-first design

---

## 🚀 Quick Deploy (Serverless)

**Deployed on Vercel:**
```
Frontend:  https://music-mu-p6h9.vercel.app/
Backend:   https://music-mu-lovat.vercel.app/api
```

**Directory Structure:**
```
./vercel-serverless/
├── backend/              # Fastify serverless API
│   ├── api/              # Vercel serverless endpoints
│   ├── src/
│   │   ├── routes/       # 7 route modules
│   │   ├── lib/          # YouTube, Auth, Validation
│   │   └── index.ts
│   └── prisma/           # Database schema
└── frontend/             # React Vite client
    ├── src/
    │   ├── pages/        # 11 route pages
    │   ├── components/   # UI components
    │   ├── services/     # API & playback logic
    │   └── lib/          # State & cache
    └── public/           # PWA assets
```

---

## 🧠 How It Works (High Level)

### Data Flow Architecture
```
┌─────────────────────────────────────────────────────────┐
│  GUEST MODE (No Login)                                  │
│  IndexedDB ↔ Frontend Store (Zustand) ↔ YouTube IFrame │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  AUTHENTICATED MODE (With Login)                         │
│  ┌───────────────┐         ┌─────────────────┐          │
│  │  Frontend     │ ←JWT→  │  Fastify API    │          │
│  │  Zustand      │        │  PostgreSQL     │          │
│  │  IndexedDB    │ ←──→   │  Prisma ORM     │          │
│  └───────────────┘        └─────────────────┘          │
│         ↓                                                │
│  YouTube IFrame Player API (streaming only)             │
└──────────────────────────────────────────────────────────┘
```

### Search & Metadata Pipeline
```
Search Query → Innertube.search() → Filter (1-10 min duration)
            → YouTube Video ID → YouTube IFrame URL
```

---

## 🔧 Key API Endpoints

> Base URL: `https://music-mu-lovat.vercel.app/api`

### Public Endpoints
```
GET  /health                    Health check
GET  /search?q=query&limit=10   Search tracks (YouTube metadata)
GET  /track/:id                 Get track metadata
GET  /track/:id/stream          Get IFrame embed URL
GET  /guest                     Create guest session
```

### Authentication Routes `/auth`
```
POST /auth/register             Register new user
POST /auth/login                Login user (returns JWT)
GET  /auth/me                   Get current user profile
```

### Likes Routes `/likes` (Protected)
```
GET  /likes                     Get all liked tracks
POST /likes                     Like a track
DELETE /likes/:trackId          Unlike a track
GET  /likes/:trackId            Check if track is liked
```

### Playlists Routes `/playlists` (Protected)
```
GET  /playlists                 Get user playlists
POST /playlists                 Create new playlist
GET  /playlists/:id             Get playlist details + tracks
POST /playlists/:id/tracks      Add track to playlist
DELETE /playlists/:id/tracks/:trackId   Remove track
GET  /playlists/discover/popular   Get popular tracks cache
```

### History Routes `/history` (Protected)
```
GET  /history?limit=50&offset=0     Get play history
POST /history                       Record play
```

### Recommendations Routes `/recommendations` (Protected)
```
GET  /recommendations           Get personalized recommendations
```

### Blends Routes `/blends` (Protected)
```
POST /blends/invite             Send blend invite
GET  /blends/invites            Get pending invites
POST /blends/invites/:id/accept Accept invite
POST /blends/invites/:id/reject Reject invite
GET  /blends                    Get all blends
GET  /blends/:id                Get blend details + tracks
```

---

## 🛠 Tech Stack

- **Frontend:**
  - React 18 + Vite
  - Zustand (State Management)
  - Tailwind CSS (UI)
  - Framer Motion (Animations)
  - Lucide React (Icons)

- **Backend:**
  - Fastify (Serverless optimized)
  - TypeScript
  - YouTube iFrame API (Streaming)
  - Innertube (Metadata search)

---

## 🔐 Environment Variables (Serverless)

Create `.env` files under `vercel-serverless/backend/` and `vercel-serverless/frontend/`.

### Backend `.env`:
```bash
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=*
````

### Frontend `.env`:

```bash
VITE_API_URL=https://music-mu-lovat.vercel.app/api
VITE_APP_NAME=MusicMu
VITE_APP_VERSION=1.0.0
```

---

## 👨‍💻 Developer

**Akshay K A**
📧 [akshayka@mamocollege.org](mailto:akshayka@mamocollege.org)
💻 Contributions welcome!

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.
See the [`LICENSE`](./LICENSE) file for full details.

---

## ⏭️ What's Next?

---

## ⚠️ IMPORTANT: URLs & Environment Variables

Some values (deployment URLs, release asset names, and environment variables) are tied to the live deployments and CI release flow. **Do NOT change `VITE_API_URL`, `CANTIO_REMOTE_URL`, `MUSICMU_REMOTE_URL`, `VITE_APP_NAME`, or similar URL/env references in code or documentation** unless you coordinate the change with the release/CI owner; changing these may break the live sites, desktop auto-updates, or CI/CD pipelines.

We're building a full roadmap of what's coming next. Check it out here:
👉 *[Cantio Roadmap](checklist.md)*

---

**Made with 💜 for listeners who want control, simplicity, and peace.**

