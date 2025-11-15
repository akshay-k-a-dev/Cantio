# MusicMu Vercel Serverless

Clean Fastify serverless backend and React frontend setup for Vercel deployment.

## Directory Structure

```
vercel-serverless/
├── backend/          # Fastify serverless backend
│   ├── src/
│   │   ├── index.ts  # Main Fastify app
│   │   └── lib/
│   │       └── youtube.ts
│   ├── api/
│   │   └── index.ts  # Vercel serverless handler
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json
└── frontend/         # React + Vite frontend
    ├── src/
    ├── package.json
    └── vercel.json
```

## Backend

### Local Development
```bash
cd vercel-serverless/backend
npm install
npm run dev
```

Server runs on `http://localhost:4001`

### Endpoints
- `GET /` - Homepage with service info and health status
- `GET /api/health` - Health check
- `GET /api/search?q=query` - Search YouTube
- `GET /api/guest` - Get guest session
- `GET /api/track/:id` - Get track metadata
- `GET /api/track/:id/stream` - Get stream URL (iframe mode)
- `GET /api/track/:id/full` - Get metadata + stream

### Deploy to Vercel
```bash
cd vercel-serverless/backend
vercel --prod
```

## Frontend

### Local Development
```bash
cd vercel-serverless/frontend
npm install
npm run dev
```

Server runs on `http://localhost:4173`

### Deploy to Vercel
```bash
cd vercel-serverless/frontend
vercel --prod
```

After deploying backend, update `frontend/.env.production` with the backend URL.

## Features

✅ **Clean Fastify App** - Unified serverless backend
✅ **Homepage Health Check** - Root endpoint shows service status
✅ **No Crashes** - Proper error handling on all endpoints
✅ **iframe Streaming** - YouTube embed-only approach
✅ **TypeScript** - Full type safety
✅ **Environment Variables** - Separate dev/prod configs
