# MusicMu - Technical Architecture

**An open-source music player — not affiliated with or endorsed by Google LLC.**

## System Overview

MusicMu is a full-stack ad-free music streaming platform with unlimited skips, no forced recommendations, and complete listener control. The application streams audio-only content directly without storing files, using a client-server architecture with intelligent stream resolution and caching strategies.

**Two Deployment Options Available:**

### 1. Self-Hosted (Traditional)
Full-featured backend with Fastify, running on dedicated servers with systemd/PM2.

### 2. Serverless (Vercel) ⭐ NEW
Auto-scaling serverless functions with zero server management, deployed on Vercel's edge network.

---

## Architecture Diagrams

### Self-Hosted Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   UI Layer   │  │ State Mgmt   │  │   Player Logic      │  │
│  │  (Pages +    │→ │  (Zustand)   │→ │ (Audio/IFrame API)  │  │
│  │  Components) │  │              │  │                     │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (HTTP)
┌────────────────────────────▼────────────────────────────────────┐
│                      Backend (Node.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ Fastify API  │→ │Stream Resolver│→ │  YouTube Libraries  │  │
│  │   Routes     │  │ (youtube.ts)  │  │  (Multi-fallback)   │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  YouTube APIs   │
                    │   (External)    │
                    └─────────────────┘
```

### Serverless Architecture (Vercel)

```
┌─────────────────────────────────────────────────────────────────┐
│              Frontend (React - Static CDN)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   UI Layer   │  │ State Mgmt   │  │   YouTube IFrame    │  │
│  │  (Pages +    │→ │  (Zustand)   │→ │   Player API        │  │
│  │  Components) │  │  LocalStorage│  │   (Global Instance) │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                                                                 │
│  Deployed as: Static files on Vercel Edge Network              │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (HTTPS)
                             │ /api/* proxied to backend
┌────────────────────────────▼────────────────────────────────────┐
│          Backend (Vercel Serverless Functions)                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │api/health.ts │  │api/search.ts │  │ api/track/[id]/*.ts  │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                 │
│  Each endpoint = Separate serverless function                  │
│  Auto-scales from 0 to ∞ based on traffic                      │
│  Cold start: ~1-2s, Warm: <100ms                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  YouTube APIs   │
                    │   (youtubei.js) │
                    └─────────────────┘
```

---

## Backend Architecture

### Self-Hosted Backend (server/)

#### Technology Stack
- **Runtime**: Node.js (v20+)
- **Framework**: Fastify (v4.25+) - High-performance web framework
- **Language**: TypeScript (v5.3+)
- **Build Tool**: tsx (development), tsc (production)
- **Port**: 3001

### Core Components

#### 1. **API Server** (`src/index.ts`)
- **Port**: 3001
- **Features**:
  - CORS enabled for frontend communication
  - Logging with Pino (pretty formatting in dev)
  - Health check endpoint
  - RESTful API design

**Key Endpoints**:
```typescript
GET  /health              // Server health check
GET  /api/search?q=query  // Search YouTube videos
GET  /api/track/:id       // Get track metadata
GET  /api/track/:id/stream // Get audio stream URL
```

#### 2. **Stream Resolution Engine** (`src/lib/youtube.ts`)

**⚠️ UPDATED ARCHITECTURE - Iframe-Only Streaming**

The backend now uses a **simplified, stable approach** with YouTube IFrame Player API instead of complex audio extraction.

**New Architecture (Iframe-Only)**:
```
┌─────────────────────────────────────────────────────────────┐
│                 GET /api/track/:id/stream                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Always Return IFrame Embed URL              │  │
│  │     No extraction, no fallbacks, no complexity       │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Return: {                                            │ │
│  │    mode: 'iframe',                                    │ │
│  │    url: 'https://youtube.com/embed/:id?...',          │ │
│  │    source: 'iframe'                                   │ │
│  │  }                                                    │ │
│  │                                                        │ │
│  │  Response time: <50ms (instant)                       │ │
│  │  No timeout, no extraction, no complexity             │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Why Iframe-Only?**

| Issue with Old Approach | Iframe Solution |
|------------------------|-----------------|
| ❌ Complex fallback chain (5 methods) | ✅ Single, stable method |
| ❌ Frequent extraction failures | ✅ No extraction needed |
| ❌ Rate limiting from YouTube | ✅ Uses user's IP, not server |
| ❌ High server load | ✅ Minimal server processing |
| ❌ Timeouts (5-8 seconds) | ✅ Instant response (<50ms) |
| ❌ Maintenance burden (ytdl-core updates) | ✅ Zero maintenance |
| ❌ Mobile IP blocking | ✅ Works on all devices |
| ❌ Large dependencies (~10MB+) | ✅ Minimal dependencies (~2MB) |

**Implementation**:

```typescript
// Simple and stable - always works
export async function getStreamInfo(videoId: string) {
  return {
    mode: 'iframe',
    url: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&playsinline=1`,
    source: 'iframe',
  };
}
```

**Frontend Player (YouTube IFrame API)**:

```typescript
// Single global YT.Player instance
let ytPlayer: YT.Player | null = null;

// Initialize once on app load
export function initYouTubePlayer() {
  if (!window.YT) {
    // Load YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }
  
  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new YT.Player('youtube-player', {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 1,
        controls: 0,
        playsinline: 1,
      },
      events: {
        onReady: (event) => { /* player ready */ },
        onStateChange: (event) => { /* handle state */ },
        onError: (event) => { /* handle errors */ },
      },
    });
  };
}

// Play a track
export function play(videoId: string) {
  if (ytPlayer && ytPlayerReady) {
    ytPlayer.loadVideoById({
      videoId: videoId,
      startSeconds: 0,
    });
  }
}
```

**Benefits of New Architecture**:

1. **Reliability**: 
   - ✅ No extraction failures
   - ✅ No rate limiting issues
   - ✅ Works on mobile networks
   - ✅ No IP blocking

2. **Performance**:
   - ✅ Instant response (<50ms)
   - ✅ No server-side processing
   - ✅ Minimal backend load
   - ✅ Smooth playback (YouTube's own player)

3. **Maintenance**:
   - ✅ Zero maintenance (YouTube maintains the player)
   - ✅ No library updates needed
   - ✅ No fallback logic to debug
   - ✅ Simple, understandable code

4. **User Experience**:
   - ✅ Fast track switching
   - ✅ Reliable playback
   - ✅ Works everywhere (desktop, mobile, tablets)
   - ✅ YouTube's own quality adaptation

**Old Architecture (Deprecated)**:

The previous multi-fallback approach with audio extraction has been removed due to:
- Frequent failures (30%+ error rate)
- High maintenance burden
- YouTube IP blocking issues
- Complex debugging
- Mobile network incompatibility

See `MIGRATION_GUIDE.md` for details on the architecture change.
- Direct audio-only format extraction
- Signature deciphering built-in
- 5-second timeout
**Benefits of New Architecture**:

1. **Reliability**: 
   - ✅ No extraction failures
   - ✅ No rate limiting issues
   - ✅ Works on mobile networks
   - ✅ No IP blocking

2. **Performance**:
   - ✅ Instant response (<50ms)
   - ✅ No server-side processing
   - ✅ Minimal backend load
   - ✅ Smooth playback (YouTube's own player)

3. **Maintenance**:
   - ✅ Zero maintenance (YouTube maintains the player)
   - ✅ No library updates needed
   - ✅ No fallback logic to debug
   - ✅ Simple, understandable code

4. **User Experience**:
   - ✅ Fast track switching
   - ✅ Reliable playback
   - ✅ Works everywhere (desktop, mobile, tablets)
   - ✅ YouTube's own quality adaptation

**Old Architecture (Deprecated)**:

The previous multi-fallback approach with audio extraction has been removed due to:
- Frequent failures (30%+ error rate)
- High maintenance burden
- YouTube IP blocking issues
- Complex debugging
- Mobile network incompatibility

See `MIGRATION_GUIDE.md` for details on the architecture change.

---

### Serverless Backend (vercelhost/backend/)

#### Technology Stack
- **Platform**: Vercel Serverless Functions
- **Runtime**: Node.js 18+
- **Language**: TypeScript (v5.3+)
- **YouTube Library**: youtubei.js (simplified, no fallbacks)
- **Port (dev)**: 4001

#### Architecture Overview

Instead of a single long-running server, the serverless backend consists of **individual API endpoints** deployed as separate functions that auto-scale based on demand.

**Key Differences from Self-Hosted:**

| Feature | Self-Hosted | Serverless |
|---------|-------------|------------|
| Server Process | Long-running (Fastify) | Per-request functions |
| Scaling | Manual (PM2/systemd) | Automatic (0 to ∞) |
| Rate Limiting | @fastify/rate-limit | Vercel platform |
| Queue Management | p-queue | None (stateless) |
| Cold Start | None | 1-2 seconds |
| Stream Method | Iframe only | Iframe only |
| Deployment | systemd/PM2 | `vercel --prod` |

#### Serverless Function Endpoints

Each file in `api/` becomes a serverless function:

```
vercelhost/backend/api/
├── health.ts              → GET /api/health
├── search.ts              → GET /api/search
├── guest.ts               → GET/POST /api/guest
└── track/
    ├── [id].ts            → GET /api/track/:id
    └── [id]/
        ├── stream.ts      → GET /api/track/:id/stream
        └── full.ts        → GET /api/track/:id/full
```

**Function Execution Flow:**

```
┌──────────────────────────────────────────────────────────┐
│  1. Request arrives at Vercel Edge Network               │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────▼────────────┐
         │ Is function warm?      │
         │ (in memory cache)      │
         └───┬────────────────┬───┘
             │ YES            │ NO
             │                │
     ┌───────▼────┐    ┌─────▼──────────┐
     │ Use cached │    │ Cold start:    │
     │ instance   │    │ - Load code    │
     │ (<100ms)   │    │ - Init deps    │
     └─────┬──────┘    │ (~1-2 seconds) │
           │           └────────┬───────┘
           │                    │
           └──────┬─────────────┘
                  │
      ┌───────────▼──────────────┐
      │ Execute function logic   │
      │ - Parse request          │
      │ - Call YouTube API       │
      │ - Return response        │
      └──────────────────────────┘
```

#### Simplified Stream Resolution

Unlike the self-hosted version with multiple fallbacks, the serverless backend uses a **single, stable method**:

```typescript
// api/track/[id]/stream.ts
export default async function handler(req, res) {
  const { id } = req.query;
  
  // Always return iframe mode - simple and stable
  return res.json({
    mode: 'iframe',
    url: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`,
    source: 'iframe',
  });
}
```

**Why iframe-only for serverless?**
- ✅ **No timeouts**: Instant response (<50ms)
- ✅ **No dependencies**: No ytdl-core, play-dl, etc.
- ✅ **Smaller bundle**: Faster cold starts
- ✅ **Stateless**: Perfect for serverless
- ✅ **Reliable**: YouTube's own embed player
- ✅ **No rate limiting**: Uses user's IP, not server's

#### Environment Variables (Serverless)

```typescript
// Loaded via dotenv in dev, Vercel dashboard in production
PORT=4001                          // Dev only
HOST=0.0.0.0                      // Dev only
NODE_ENV=development              // Auto-set by Vercel
CORS_ORIGIN=http://localhost:4173 // Frontend URL
LOG_LEVEL=info                    // Logging verbosity
```

#### Development Server (dev-server.ts)

For local testing, a simple HTTP server mimics Vercel's serverless environment:

```typescript
// dev-server.ts
const server = createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  
  // Route to appropriate serverless function
  if (url.pathname === '/api/health') {
    const handler = await import('./api/health.js');
    await handler.default(vercelReq, vercelRes);
  }
  // ... more routes
});
```

**Benefits:**
- Same code runs locally and in production
- Test serverless functions without deploying
- Fast iteration with hot reload (tsx)

#### Vercel Configuration (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/track/([^/]+)/stream",
      "dest": "/api/track/$1/stream.ts"
    }
  ]
}
```

**Key settings:**
- `builds`: Compiles TypeScript to serverless functions
- `routes`: Maps URL patterns to function files
- `regions`: Deploy to specific edge locations (default: all)

#### Performance Characteristics

**Cold Start Performance:**
- First request: 1-2 seconds (function initialization)
- Cached requests: <100ms (warm function)
- Keep-alive: ~5 minutes of inactivity

**Optimization Strategies:**
1. **Minimal dependencies**: Only youtubei.js
2. **Small bundle size**: ~2MB vs 10MB+ for self-hosted
3. **Edge deployment**: Functions run close to users
4. **Innertube caching**: Reuse instance across invocations

**Scaling:**
- Automatic: 0 to 1000s of concurrent functions
- No configuration needed
- Pay-per-use model (Vercel free tier: 100GB-hours/month)

---

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 (v18.2+)
- **Language**: TypeScript (v5.3+)
- **Build Tool**: Vite (v5.4+)
- **Styling**: TailwindCSS (v3.4+)
- **Animations**: Framer Motion (v11+)
- **State Management**: Zustand (v4.4+)
- **Storage**: localforage (v1.10+) - IndexedDB wrapper
- **Routing**: React Router DOM (v6.21+)

### Application Structure

```
client/src/
├── components/          # Reusable UI components
│   ├── PlayerBar.tsx   # Bottom player controls
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── TrackCard.tsx   # Individual track display
│
├── pages/              # Route pages
│   ├── HomePage.tsx    # Landing page
│   ├── SearchPage.tsx  # Search interface + results
│   ├── LikedPage.tsx   # Saved/liked songs
│   └── QueuePage.tsx   # Playback queue
│
├── services/           # Business logic
│   ├── player.ts       # Player state & logic (Zustand)
│   └── api.ts          # Backend communication
│
├── App.tsx            # Root component + routing
└── main.tsx           # Entry point
```

### State Management (Zustand)

**Player Store** (`services/player.ts`):
```typescript
interface PlayerStore {
  // Current playback
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  
  // Queue management
  queue: Track[];
  
  // Liked songs (persisted to IndexedDB)
  likedSongs: Track[];
  
  // Audio elements
  audioElement: HTMLAudioElement | null;
  youtubePlayer: YT.Player | null;
  
  // Actions
  play: (track: Track) => Promise<void>;
  pause: () => void;
  next: () => void;
  prev: () => void;
  addToQueue: (track: Track) => void;
  toggleLike: (track: Track) => void;
}
```

**Key Features**:
- Persistent storage with localforage (IndexedDB)
- Automatic queue management (FIFO)
- Immediate stream termination on track change
- Dual audio handling (HTMLAudioElement + YouTube IFrame)

### Player Logic Flow

```
User clicks Play
       │
       ▼
┌──────────────────────────────────────┐
│  Is stream already playing?          │
│  YES → Terminate current stream      │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Fetch stream URL from backend       │
│  GET /api/track/:id/stream           │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Stream source type?                 │
├──────────────────────────────────────┤
│  ├─ Direct URL → HTMLAudioElement    │
│  └─ IFrame → YouTube IFrame Player   │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Auto-remove from queue (if queued)  │
│  Auto-play next when song ends       │
└──────────────────────────────────────┘
```

### UI Layer

**Pages**:

1. **HomePage** - Landing page with app intro
2. **SearchPage**:
   - Search input with real-time API calls
   - Grid of track results
   - Play + Add to Queue buttons per track
3. **LikedPage**:
   - Reversed order (newest first)
   - Play All → adds entire playlist to queue
   - Click song → adds from that position onward
4. **QueuePage**:
   - Current queue display
   - Remove individual tracks
   - Clear entire queue

**Components**:

1. **PlayerBar** (Bottom sticky):
   - Current track info
   - Play/Pause/Next/Prev controls
   - Volume slider
   - Progress bar
   - Queue badge (shows count)

2. **Sidebar**:
   - Navigation links
   - App branding

3. **TrackCard**:
   - Thumbnail
   - Title/Artist
   - Duration
   - Action buttons

---

## Data Flow

### Search Flow
```
User types query
       │
       ▼
Frontend debounce (500ms)
       │
       ▼
GET /api/search?q=query
       │
       ▼
Backend: youtubei.js.search()
       │
       ▼
YouTube API
       │
       ▼
Backend: Parse & format results
       │
       ▼
Frontend: Display in grid
```

### Playback Flow
```
User clicks Play
       │
       ▼
Frontend: player.play(track)
       │
       ▼
GET /api/track/:id/stream
       │
       ▼
Backend: getAudioStream(videoId)
       │
       ├─► Try cached method (if available)
       │   └─► Success → Return URL
       │
       └─► Try fallback chain
           └─► Cache successful method
           └─► Return URL
       │
       ▼
Frontend: 
  ├─ Direct URL → audioElement.src = url
  └─ IFrame → Load YouTube IFrame Player
       │
       ▼
Auto-queue management
Auto-play next on end
```

---

## Caching Strategy

### Server-Side (Session Cache)
```typescript
// In-memory cache (per server instance)
successfulMethod: string | null
methodFailCount: Record<string, number>
```

**Lifecycle**:
- Lives for entire server session
- Resets on server restart
- Resets after 3 consecutive failures
- IFrame locks permanently once used

**Benefits**:
- Minimum latency (single method check)
- No database required
- Auto-recovery
- Privacy (iframe tracking control)

### Client-Side (Browser Cache)

**IndexedDB (via localforage)**:
```typescript
// Persisted data
likedSongs: Track[]  // User's saved tracks
```

**Session Storage**:
```typescript
// In-memory only
currentTrack: Track | null
queue: Track[]
isPlaying: boolean
volume: number
```

**Audio Elements**:
- Browser automatically caches audio chunks
- IFrame player handles its own caching

---

## Performance Optimizations

### Backend
1. **Fast timeouts**: 5-8 seconds max per method
2. **Session caching**: Avoid repeated method discovery
3. **No retries**: Single attempt per method (fast fail)
4. **Parallel fallback**: Instant switch to next method
5. **Cleanup automation**: Background file cleanup (non-blocking)

### Frontend
1. **Code splitting**: Vite automatic chunking
2. **Lazy loading**: React.lazy for routes
3. **Debounced search**: 500ms delay on input
4. **IndexedDB**: Async storage (non-blocking UI)
5. **Framer Motion**: Hardware-accelerated animations
6. **Virtual scrolling**: (Could be added for large lists)

### Network
1. **CORS optimization**: Single origin policy
2. **HTTP/2**: Supported by Fastify
3. **Compression**: Automatic in production build
4. **CDN-ready**: Static assets via Vite build

---

## Error Handling

### Backend
```typescript
try {
  // Try method
  return await method(videoId);
} catch (error) {
  // Log error (console)
  // Try next fallback
  // If all fail, return error response
}
```

**Response Codes**:
- `200`: Success
- `404`: Video not found
- `500`: All methods failed
- `503`: Service temporarily unavailable

### Frontend
```typescript
try {
  // API call
  const data = await fetchStream(trackId);
  // Play audio
} catch (error) {
  // Show user-friendly error message
  // Log to console
  // Keep app functional
}
```

**User Experience**:
- Non-blocking errors (app stays functional)
- Graceful degradation
- Retry options where applicable

---

## Security Considerations

### Backend
1. **No file storage**: Stream URLs only (no copyright issues)
2. **CORS whitelist**: Frontend origin only
3. **Rate limiting**: Could be added via Fastify plugin
4. **Input validation**: URL encoding, query sanitization

### Frontend
1. **XSS prevention**: React's built-in escaping
2. **HTTPS required**: Production deployment
3. **No sensitive data**: No user accounts/passwords
4. **LocalStorage encryption**: Not needed (no sensitive data)

### Privacy
1. **No tracking**: Minimal data collection
2. **IFrame isolation**: Session-locked to prevent excessive tracking
3. **No analytics**: (Can be added optionally)
4. **No external CDNs**: Self-hosted assets

---

## Deployment Architecture

### Development
```
Terminal 1: cd server && npm run dev   (Port 3001)
Terminal 2: cd client && npm run dev   (Port 5173)
```

### Production
```
Backend:
  npm run build  → TypeScript → JavaScript (dist/)
  npm start      → node dist/index.js

Frontend:
  npm run build  → Vite → Optimized bundle (dist/)
  Serve via Nginx/Apache or Vercel/Netlify
```

**Recommended Stack**:
- **Backend**: VPS (DigitalOcean, Linode) or Railway
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Domain**: Cloudflare DNS + SSL
- **Monitoring**: PM2 (backend), Sentry (errors)

---

## Key Metrics

### Performance Targets
- **Stream resolution**: <2s (cached method)
- **Search response**: <1s
- **Metadata fetch**: <1s
- **UI responsiveness**: 60fps animations
- **Bundle size**: <500KB gzipped

### Reliability
- **Stream success rate**: >95% (multi-fallback)
- **Uptime**: 99.9% (with proper hosting)
- **Error recovery**: Automatic (method fallback)

---

## Future Enhancements

### Potential Features
1. **Playlist management**: Create/share playlists
2. **User accounts**: Cloud sync of liked songs
3. **Offline mode**: Service Worker caching
4. **Lyrics integration**: Genius API or similar
5. **Radio mode**: Auto-play similar songs
6. **Social features**: Share tracks, collaborative playlists
7. **Mobile app**: React Native conversion
8. **Desktop app**: Electron wrapper
9. **Audio visualization**: Canvas/WebGL visualizer
10. **Equalizer**: Web Audio API controls

### Technical Improvements
1. **Redis caching**: Persistent stream URL cache
2. **WebSocket**: Real-time updates
3. **GraphQL**: More efficient data fetching
4. **CDN integration**: Faster static asset delivery
5. **Docker**: Containerized deployment
6. **Load balancing**: Multi-instance backend
7. **Monitoring**: Prometheus + Grafana
8. **Testing**: Unit + E2E tests

---

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config (can be added)
- **Prettier**: Formatting (can be added)
- **Naming**: camelCase (variables), PascalCase (components)

### Git Workflow
- **Branches**: feature/*, bugfix/*, hotfix/*
- **Commits**: Conventional commits
- **PRs**: Required for main branch

### Testing Strategy (To be implemented)
- **Unit**: Vitest for utilities
- **Integration**: API endpoint tests
- **E2E**: Playwright for user flows
- **Coverage**: 80%+ target

---

## Troubleshooting

### Common Issues

**Issue**: Stream fails to load
- **Solution**: Check backend logs, try different method manually, verify YouTube video availability

**Issue**: Search returns empty
- **Solution**: Check YouTube API quota, verify network connectivity, try different search query

**Issue**: Audio stuttering
- **Solution**: Check network speed, reduce quality in player, clear browser cache

**Issue**: IFrame won't load
- **Solution**: Check CORS settings, verify YouTube embed allowed, disable ad blockers

**Issue**: Player script files accumulating
- **Solution**: Auto-cleanup runs every 5 minutes, or manual: `find . -name "*-player-script.js" -delete`

---

## Technology Choices Rationale

### Why Fastify?
- ✅ Fastest Node.js framework (benchmarked)
- ✅ Built-in schema validation
- ✅ Plugin ecosystem
- ✅ TypeScript support

### Why Zustand?
- ✅ Lightweight (1KB)
- ✅ No boilerplate (vs Redux)
- ✅ React hooks integration
- ✅ Persistent storage support

### Why Vite?
- ✅ Instant HMR (Hot Module Replacement)
- ✅ Fast builds (esbuild)
- ✅ Modern ES modules
- ✅ Plugin ecosystem

### Why localforage?
- ✅ IndexedDB wrapper (better than localStorage)
- ✅ Automatic fallback (localStorage → WebSQL)
- ✅ Promise-based API
- ✅ Large storage capacity

### Why Multiple YouTube Libraries?
- ✅ Redundancy (if one breaks, others work)
- ✅ Coverage (different methods for different videos)
- ✅ Performance (fastest available method)
- ✅ Reliability (>95% success rate)

---

## Conclusion

MusicMu is built with a focus on:
- **Performance**: Fast stream resolution, minimal latency
- **Reliability**: Multi-method fallback, auto-recovery
- **Privacy**: No tracking, minimal data collection
- **Freedom**: No ads, unlimited skips, complete control
- **Simplicity**: Clean code, easy to maintain
- **Scalability**: Ready for enhancements and deployment

The architecture is designed to be **production-ready** while maintaining **developer-friendly** code structure.

---

## Legal Disclaimer

**MusicMu is an open-source project and is not affiliated with, endorsed by, or sponsored by Google LLC or any other content provider.**

This application:
- Uses publicly available APIs and libraries
- Does not store or redistribute copyrighted content
- Streams content directly from original sources
- Is provided for educational and personal use

Users are responsible for ensuring their usage complies with local laws and terms of service of content providers.
