# MusicMu Serverless (Vercel Deployment)

This directory contains the Vercel-optimized version of MusicMu with separate frontend and backend deployments.

## 📁 Structure

```
vercelhost/
├── backend/          # Serverless API functions
│   ├── api/         # Vercel serverless functions
│   ├── lib/         # Shared utilities
│   ├── package.json
│   ├── vercel.json
│   └── README.md
├── frontend/        # Static React app
│   ├── src/        # React source code
│   ├── package.json
│   ├── vercel.json
│   └── README.md
└── README.md       # This file
```

## 🚀 Quick Start

### Setup Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env if needed (default values work for local development)
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Edit .env if needed (default values work for local development)
```

### Local Development

**Terminal 1 - Backend (Port 4001):**
```bash
cd backend
npm install
npm run dev
# Backend will run on http://localhost:4001
```

**Terminal 2 - Frontend (Port 4173):**
```bash
cd frontend
npm install
npm run dev
# Frontend will run on http://localhost:4173
```

### Production Deployment

**Step 1: Deploy Backend**
```bash
cd backend
npm install
vercel --prod
# Copy the deployment URL (e.g., https://musicmu-api.vercel.app)
```

**Step 2: Update Frontend API URL**

Edit `frontend/vercel.json` and replace the backend URL:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-actual-backend-url.vercel.app/api/:path*"
    }
  ]
}
```

**Step 3: Deploy Frontend**
```bash
cd frontend
npm install
vercel --prod
```

## 🔧 Configuration

### Backend (Port 4001 in dev)

- **Framework**: Vercel Serverless Functions
- **Language**: TypeScript
- **Dependencies**: youtubei.js only
- **Endpoints**:
  - `GET /api/health` - Health check
  - `GET /api/search?q=query` - Search videos
  - `GET /api/track/:id` - Track metadata
  - `GET /api/track/:id/stream` - Stream info (iframe mode)
  - `GET /api/track/:id/full` - Combined metadata + stream
  - `GET/POST /api/guest` - Guest mode

### Frontend (Port 4173 in dev)

- **Framework**: Vite + React
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Storage**: LocalForage (IndexedDB)
- **Player**: YouTube IFrame API

## 📊 Differences from Self-Hosted

| Feature | Self-Hosted | Vercel Serverless |
|---------|-------------|-------------------|
| Backend | Fastify server | Serverless functions |
| Frontend Server | Express | Static files (CDN) |
| Rate Limiting | @fastify/rate-limit | Vercel platform |
| Queue Management | p-queue | None (stateless) |
| Scaling | Manual | Automatic |
| Cold Start | None | 1-2 seconds |
| Cost | Server costs | Free tier available |
| SSL | Manual setup | Automatic |
| Deployment | systemd/PM2 | `vercel --prod` |

## 🧪 Testing

### Test Backend
```bash
cd backend
npm install

# Start dev server
npm run dev

# In another terminal, test endpoints:
curl http://localhost:4001/api/health
curl http://localhost:4001/api/search?q=test
curl http://localhost:4001/api/track/dQw4w9WgXcQ
curl http://localhost:4001/api/track/dQw4w9WgXcQ/stream
```

### Test Frontend
```bash
cd frontend
npm install
npm run dev

# Open browser to http://localhost:4173
# Test search, play, queue functionality
```

### Test Together
1. Start backend on port 4001
2. Update `frontend/vite.config.ts` proxy to point to `http://localhost:4001`
3. Start frontend on port 4173
4. Test complete workflow

## 🌐 Environment Variables

### Backend
No environment variables required! Works out of the box.

### Frontend
No environment variables required! API URL configured in `vercel.json`.

## 🌐 Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4001` | Backend server port |
| `HOST` | `0.0.0.0` | Backend server host |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | `http://localhost:4173` | Allowed CORS origin |
| `LOG_LEVEL` | `info` | Logging level |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:4001` | Backend API URL |
| `VITE_APP_NAME` | `MusicMu` | Application name |
| `VITE_APP_VERSION` | `1.0.0` | Application version |

## 📦 Dependencies

### Backend
```json
{
  "dependencies": {
    "youtubei.js": "^10.5.0"
  },
  "devDependencies": {
    "@vercel/node": "^3.0.0",
    "typescript": "^5.3.0",
    "vercel": "^33.0.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "zustand": "^4.4.7",
    "localforage": "^1.10.0",
    "lucide-react": "^0.303.0"
  },
  "devDependencies": {
    "vite": "^5.4.21",
    "typescript": "^5.3.3",
    "vercel": "^33.0.0"
  }
}
```

## ⚡ Performance

### Cold Starts
- **First request**: 1-2 seconds
- **Subsequent requests**: <100ms
- **Mitigation**: Vercel Edge Network keeps functions warm

### Caching
- **Static assets**: Cached at edge (1 year)
- **API responses**: No caching (dynamic)
- **Innertube instance**: Cached in function memory

### Optimization
- Minimal dependencies (only youtubei.js for backend)
- Tree-shaking via Vite (frontend)
- Edge deployment (both frontend and backend)
- Single Innertube instance reuse

## 🔒 Security

- **CORS**: Enabled for all origins (configurable)
- **Rate Limiting**: Handled by Vercel platform
- **No API keys**: Uses youtube-innertube (web client mode)
- **No authentication**: Guest mode only (localStorage)

## 💰 Cost Estimation

### Vercel Hobby Plan (Free)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited serverless function invocations
- ✅ 100 GB-hours compute time
- ✅ Automatic SSL certificates
- ✅ DDoS protection

**Estimated capacity**: ~10,000 users/month with moderate usage

### Vercel Pro ($20/month)
- ✅ 1 TB bandwidth
- ✅ 1000 GB-hours compute
- ✅ Advanced analytics
- ✅ Faster builds

## 🐛 Troubleshooting

### Backend not responding
```bash
# Check if dev server is running
lsof -i :4001

# Check Vercel logs
cd backend
vercel logs
```

### Frontend API errors
```bash
# Verify backend URL in vercel.json
cat frontend/vercel.json

# Check browser console for CORS errors
# Update vite.config.ts proxy if needed
```

### Build failures
```bash
# Test build locally first
cd backend && npm run build
cd frontend && npm run build

# Check TypeScript errors
npx tsc --noEmit
```

## 📚 Documentation

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Frontend README](./frontend/README.md) - Detailed frontend documentation
- [Vercel Docs](https://vercel.com/docs) - Official Vercel documentation

## 🎯 Key Features

- ✅ **Serverless Architecture**: Auto-scaling, pay-per-use
- ✅ **Global CDN**: Fast delivery worldwide
- ✅ **Zero Config**: Works out of the box
- ✅ **TypeScript**: Full type safety
- ✅ **Iframe-only**: No audio extraction needed
- ✅ **Guest Mode**: No database required
- ✅ **Free Tier**: Generous limits for personal use

## 🔄 Migration from Self-Hosted

If you're migrating from the self-hosted version:

1. **Data Migration**: Export guest data from localStorage (same format)
2. **API Changes**: None! Same API endpoints
3. **URL Update**: Point frontend to new backend URL
4. **Deploy**: Follow deployment steps above

## 📝 License

Same as main MusicMu project - check LICENSE file in root directory.
