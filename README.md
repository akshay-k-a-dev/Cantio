# 🎵 MusicMu - Ad-Free Open Source Music Streamer

**An open-source music player — not affiliated with or endorsed by Google LLC.**

A modern, full-stack music streaming platform with **unlimited skips**, **no ads**, **no forced recommendations**, and complete listener control. Stream audio-only content with intelligent fallback streaming and a beautiful UI.

## ✨ Features

### 🎧 Core Playback
- **Ad-Free Streaming** - No interruptions, no forced ads
- **Unlimited Skips** - Skip as much as you want, whenever you want
- **Audio-Only Mode** - Pure audio, no video bandwidth waste
- **Intelligent Fallback Chain** - Automatically switches between multiple providers for maximum reliability
- **Complete Control** - Seek anywhere, play anything, no algorithm manipulation
- **Smart Queue Management** - Build your perfect playlist

### 🎨 Guest Mode (Current Implementation)
- ✅ Full player features without login
- ✅ Local storage with IndexedDB
- ✅ Playlists, liked songs, queue persistence
- ✅ 30-day cache with auto-expiry
- ✅ Offline-first architecture

### 🌟 User Experience
- Beautiful glassmorphic UI with Tailwind CSS
- Smooth animations with Framer Motion
- Responsive design (mobile-first)
- Multiple pages:
  - **Home** - Main player card
  - **Search** - Find and play music
  - **Liked Songs** - Your favorites collection
  - **Queue** - Manage playback queue
- Natural, relaxing color scheme (purple/pink gradients)

---

## 💡 Why MusicMu Exists

**MusicMu was born from a simple frustration: streaming platforms have forgotten the listener.**

90-second ad blocks, unskippable tracks, and AI-injected recommendations don't serve music — they serve algorithms.

**MusicMu is a free, open-source project built for those who just want to:**
- ▶️ Play what they love
- ⏩ Seek where they want
- 🎵 Listen without manipulation
- 🚫 No ads, no tracking, no forced content

**It's not about replacing Spotify — it's about restoring control, simplicity, and respect for the listener.**

---

## 🚀 Quick Start

**MusicMu offers two deployment options:**

### Option 1: Self-Hosted (Traditional)
Full control, runs on your own server with systemd/PM2.

### Option 2: Serverless (Vercel) ⭐ NEW
Auto-scaling, zero server management, free tier available.

---

### Self-Hosted Deployment

#### Prerequisites
- Node.js 18+ (or Bun)
- npm/yarn/pnpm/bun

#### 1. Clone & Setup

```bash
cd musicmu
```

#### 2. Backend Setup

```bash
cd server
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env and add your YouTube API key (optional for MVP)

# Start server
npm run dev
```

Backend runs on **http://localhost:3001**

#### 3. Frontend Setup

```bash
cd ../client
npm install

# Start development server
npm run dev
```

Frontend runs on **http://localhost:5173**

#### Quick Start (Both servers)

```bash
# From project root
./start.sh
```

This script starts both backend and frontend in tmux (or background if tmux not available).

---

### Serverless Deployment (Vercel)

#### Prerequisites
- Vercel account (free tier available)
- Vercel CLI: `npm install -g vercel`

#### 1. Deploy Backend

```bash
cd vercelhost/backend
cp .env.example .env
npm install
vercel --prod
# Copy the deployment URL
```

#### 2. Deploy Frontend

```bash
cd ../frontend
cp .env.example .env
# Edit .env and update VITE_API_URL with your backend URL
npm install
vercel --prod
```

#### Local Development (Serverless)

```bash
cd vercelhost
./start.sh  # Starts both on ports 4001 (backend) and 4173 (frontend)
```

📖 **See [vercelhost/README.md](./vercelhost/README.md) for detailed serverless setup.**

---

## 📁 Project Structure

```
musicmu/
├── server/                 # Backend (Fastify) - Self-Hosted
│   ├── src/
│   │   ├── index.ts       # Main server
│   │   ├── lib/
│   │   │   ├── youtube.ts # Stream resolver with fallbacks
│   │   │   └── queue.ts   # Request queue management
│   │   └── routes/
│   │       ├── search.ts  # Search endpoint
│   │       ├── track.ts   # Track metadata & streams
│   │       └── guest.ts   # Guest mode helpers
│   ├── package.json
│   └── .env
│
├── client/                 # Frontend (React + Vite) - Self-Hosted
│   ├── src/
│   │   ├── main.tsx       # Entry point
│   │   ├── App.tsx        # Router & navigation
│   │   ├── components/
│   │   │   └── MusicPlayerCard.tsx  # Main player UI
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Home page
│   │   │   ├── SearchPage.tsx       # Search interface
│   │   │   └── LikedPage.tsx        # Liked songs
│   │   ├── services/
│   │   │   └── player.ts  # Zustand player state
│   │   └── lib/
│   │       └── cache.ts   # IndexedDB cache manager
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── vercelhost/             # Serverless Deployment (Vercel) ⭐ NEW
    ├── backend/            # Serverless API Functions
    │   ├── api/           # Vercel serverless functions
    │   │   ├── health.ts
    │   │   ├── search.ts
    │   │   ├── guest.ts
    │   │   └── track/
    │   │       ├── [id].ts
    │   │       └── [id]/
    │   │           ├── stream.ts
    │   │           └── full.ts
    │   ├── lib/
    │   │   └── youtube.ts # YouTube utilities
    │   ├── dev-server.ts  # Local development server
    │   ├── package.json
    │   ├── vercel.json    # Vercel configuration
    │   └── .env
    │
    ├── frontend/          # Static React App for Vercel
    │   ├── src/          # Same as client/src
    │   ├── package.json
    │   ├── vercel.json   # Vercel configuration
    │   └── .env
    │
    ├── start.sh          # Start both servers (dev)
    ├── stop.sh           # Stop both servers
    ├── README.md         # Serverless deployment guide
    └── ENV_VARS.md       # Environment variables guide
```

---

## 🔧 API Endpoints

### Search
```
GET /api/search?q=query&limit=10
```

### Track Metadata
```
GET /api/track/:id
```

### Audio Stream
```
GET /api/track/:id/stream
```

### Full Track Info (metadata + stream)
```
GET /api/track/:id/full
```

### Guest Health Check
```
GET /api/guest/health
```

---

## 🎯 How It Works

### 1. **Stream Resolution**
The backend tries multiple sources in order:

```typescript
youtubei.js (Innertube)
  ↓ (if fails)
play-dl
  ↓ (if fails)
ytdl-core
  ↓ (if fails)
yt-stream
  ↓ (last resort)
YouTube IFrame Embed
```

Each provider attempts to extract the highest quality audio-only stream.

### 2. **Guest Cache**
All user data stored locally using `localforage` (IndexedDB):

```json
{
  "playlists": [...],
  "liked": [...],
  "queue": [...],
  "lastPlayed": {...},
  "version": 1
}
```

Cache auto-expires after 30 days or on version change.

### 3. **Player State**
Managed with Zustand for predictable state transitions:

```
IDLE → LOADING → PLAYING ⇄ PAUSED
                    ↓
                 ERROR
```

---

## 🎨 UI/UX Design

### Color Palette
- **Primary**: Purple (500-700)
- **Accent**: Pink (400-600)
- **Background**: Dark gradients (gray-900 → purple-900)
- **Glass Effects**: Semi-transparent overlays with backdrop blur

### Animations
- **Page Transitions**: Fade + slide
- **Player Controls**: Scale on hover
- **Progress Bar**: Smooth width transitions
- **Navigation**: Sliding active indicator

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🛠️ Tech Stack

### Backend

**Self-Hosted (server/):**
- **Framework**: Fastify (fast, low-overhead)
- **Language**: TypeScript
- **Rate Limiting**: @fastify/rate-limit
- **Queue Management**: p-queue
- **YouTube Libraries**:
  - `youtubei.js` - Primary (Innertube API)

**Serverless (vercelhost/backend/):**
- **Platform**: Vercel Serverless Functions
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **YouTube Library**: `youtubei.js` only
- **Features**: Auto-scaling, edge deployment, zero config

### Frontend

**Self-Hosted (client/):**
- **Framework**: React 18
- **Build Tool**: Vite
- **Server**: Express (static file serving)
- **Port**: 5173

**Serverless (vercelhost/frontend/):**
- **Framework**: React 18
- **Build Tool**: Vite
- **Deployment**: Static site on Vercel CDN
- **Port**: 4173 (dev)

**Common Frontend Stack:**
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State**: Zustand
- **Storage**: LocalForage (IndexedDB)
- **Router**: React Router v6

---

## 📝 Environment Variables

### Self-Hosted

**Server (.env)**
```bash
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=*
NODE_ENV=development
YT_API_KEY=your_youtube_api_key  # Optional for MVP
```

### Serverless (Vercel)

**Backend (vercelhost/backend/.env)**
```bash
PORT=4001
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=http://localhost:4173
LOG_LEVEL=info
```

**Frontend (vercelhost/frontend/.env)**
```bash
VITE_API_URL=http://localhost:4001
VITE_APP_NAME=MusicMu
VITE_APP_VERSION=1.0.0
```

📖 **See [vercelhost/ENV_VARS.md](./vercelhost/ENV_VARS.md) for complete environment variables guide.**

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check Node.js version (18+)
- Verify all dependencies installed: `npm install`
- Check port 3001 isn't in use

### Frontend Can't Connect
- Ensure backend is running on port 3001
- Check Vite proxy configuration in `vite.config.ts`
- Clear browser cache

### Audio Won't Play
- Check browser console for CORS errors
- Try different tracks (some may be region-locked)
- Verify backend logs for fallback attempts

### Search Not Working
- YouTube API rate limits may apply
- Check backend logs for errors
- Try again in a few minutes

---

## 🚧 Future Enhancements (Not in MVP)

- [ ] User authentication & login
- [ ] Prisma + PostgreSQL integration
- [ ] Sync guest data to database
- [ ] Social features (share playlists)
- [ ] Lyrics integration
- [ ] Advanced queue (shuffle, repeat modes)
- [ ] Keyboard shortcuts
- [ ] PWA support (offline playback)
- [ ] Desktop app (Electron/Tauri)

---

## 📜 License

MIT License - Feel free to use for personal and commercial projects

---

## 🙏 Credits

- Open-source streaming libraries: youtubei.js, play-dl, ytdl-core
- UI Framework: Tailwind CSS
- Icons: Lucide React
- Animations: Framer Motion

---

## 🤝 Contributing

This is an MVP. Contributions welcome for:
- Bug fixes
- UI/UX improvements
- Additional streaming providers
- Performance optimizations

---

## ⚖️ Legal Disclaimer

**MusicMu is an open-source project and is not affiliated with, endorsed by, or sponsored by Google LLC or YouTube.**

This application:
- Uses publicly available APIs and libraries
- Does not store or redistribute copyrighted content
- Streams content directly from original sources
- Is provided for educational and personal use

Users are responsible for ensuring their usage complies with local laws and terms of service of content providers.

---

**Built with ❤️ for music lovers who deserve better**
