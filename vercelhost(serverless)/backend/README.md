# MusicMu Serverless Backend

This is the Vercel-optimized serverless backend for MusicMu.

## Structure

```
backend/
├── api/                  # Serverless functions (Vercel automatically routes these)
│   ├── health.ts        # GET /api/health
│   ├── search.ts        # GET /api/search?q=...&limit=10
│   ├── guest.ts         # GET/POST /api/guest
│   └── track/
│       ├── [id].ts      # GET /api/track/:id (metadata)
│       └── [id]/
│           ├── stream.ts  # GET /api/track/:id/stream
│           └── full.ts    # GET /api/track/:id/full
├── lib/
│   └── youtube.ts       # Shared YouTube utilities
├── package.json
├── tsconfig.json
└── vercel.json          # Vercel configuration
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/search?q=query&limit=10` - Search for videos
- `GET /api/track/:id` - Get track metadata
- `GET /api/track/:id/stream` - Get stream info (always iframe mode)
- `GET /api/track/:id/full` - Get metadata + stream in one call
- `GET /api/guest` - Guest mode health check
- `POST /api/guest` - Validate guest data

## Deployment

```bash
# Install dependencies
npm install

# Deploy to Vercel
npm run deploy

# Or use Vercel CLI directly
vercel --prod
```

## Local Development

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run locally
npm run dev
```

## Features

- ✅ **Serverless Functions**: Each API endpoint is a separate serverless function
- ✅ **Auto-scaling**: Vercel handles scaling automatically
- ✅ **Edge Network**: Functions deployed to edge locations
- ✅ **CORS Enabled**: All endpoints support CORS
- ✅ **TypeScript**: Full type safety
- ✅ **Iframe-only**: No audio extraction, simple and stable

## Environment Variables

No environment variables needed! This backend works out of the box.

## Limitations

- **Cold starts**: First request may be slower (~1-2s)
- **Execution timeout**: 10 seconds on hobby plan, 60s on pro
- **No persistent state**: Each function is stateless
- **No queuing**: Unlike the Express version, this doesn't use p-queue

## Optimizations for Vercel

1. **Single Innertube instance**: Cached across function invocations
2. **No database**: Everything is stateless
3. **No rate limiting**: Vercel handles this at the platform level
4. **Minimal dependencies**: Only `youtubei.js` needed
5. **Fast cold starts**: TypeScript compiled to efficient JS
