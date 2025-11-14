# MusicMu Serverless Frontend

This is the Vercel-optimized frontend for MusicMu.

## Structure

```
frontend/
├── src/              # React source code
│   ├── components/   # UI components
│   ├── services/     # Player, storage, queue services
│   ├── store/        # Zustand state management
│   ├── App.tsx       # Main app component
│   └── main.tsx      # Entry point
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json       # Vercel configuration
└── README.md
```

## Deployment

### 1. Deploy Backend First

```bash
cd ../backend
npm install
vercel --prod
# Note the deployment URL (e.g., https://musicmu-backend.vercel.app)
```

### 2. Update API URL

Edit `vercel.json` and replace `your-backend-url` with your actual backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://musicmu-backend.vercel.app/api/:path*"
    }
  ]
}
```

### 3. Deploy Frontend

```bash
cd ../frontend
npm install
vercel --prod
```

## Local Development

### Option 1: Connect to Production Backend

```bash
# Update vercel.json with your backend URL
npm run dev
```

### Option 2: Run Both Locally

Terminal 1 (Backend):
```bash
cd ../backend
npm install
vercel dev --listen 3001
```

Terminal 2 (Frontend):
```bash
npm install
npm run dev
```

Update `vercel.json` to point to local backend:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://localhost:3001/api/:path*"
    }
  ]
}
```

## Environment-Specific Configuration

### Production
- Frontend: Deployed to Vercel Edge Network
- Backend: Serverless functions on Vercel
- Static assets: Served from CDN
- API: Proxied through frontend domain

### Development
- Frontend: Vite dev server (HMR enabled)
- Backend: Can use Vercel dev or production backend
- CORS: Handled by Vite proxy

## Features

- ✅ **Static Site Generation**: Pre-built HTML, CSS, JS
- ✅ **Edge Network**: Distributed globally via Vercel CDN
- ✅ **SPA Routing**: All routes serve index.html
- ✅ **Asset Optimization**: Long-term caching for static assets
- ✅ **Fast Builds**: Vite's optimized build process
- ✅ **Hot Module Replacement**: Instant updates in development

## Build Output

After running `npm run build`, the `dist/` directory contains:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── vite.svg
```

This is optimized for Vercel's static hosting.

## Configuration Files

- **vercel.json**: Vercel deployment config
  - API rewrites (proxy to backend)
  - SPA routing (all routes → index.html)
  - Asset caching headers

- **vite.config.ts**: Vite build configuration
  - React plugin
  - Build optimizations
  - Dev server settings

- **package.json**: Dependencies and scripts
  - No Express (unlike self-hosted version)
  - Added Vercel CLI

## Differences from Self-Hosted Version

| Feature | Self-Hosted | Vercel |
|---------|-------------|--------|
| Server | Express | Static files |
| API Proxy | Express middleware | Vercel rewrites |
| Port | 5173/configurable | Auto-assigned |
| SSL | Manual setup | Auto (free) |
| Deploy | systemd/PM2 | `vercel --prod` |

## Cost

- **Hobby Plan (Free)**:
  - 100 GB bandwidth/month
  - Unlimited requests
  - Automatic SSL
  - Global CDN

- **Pro Plan ($20/month)**:
  - 1 TB bandwidth
  - Advanced analytics
  - Faster builds

## Custom Domain

```bash
# Add custom domain via Vercel CLI
vercel domains add musicmu.yourdomain.com

# Or via Vercel dashboard:
# 1. Go to project settings
# 2. Click "Domains"
# 3. Add your domain
# 4. Update DNS records as instructed
```

## Troubleshooting

### API calls failing
- Check backend deployment status
- Verify `vercel.json` has correct backend URL
- Check browser console for CORS errors

### Build errors
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all dependencies are installed

### Routing issues
- Ensure vercel.json has SPA fallback rule
- Check that rewrites are in correct order

## Monitoring

View logs and analytics:
```bash
vercel logs <deployment-url>
```

Or use the Vercel dashboard for:
- Real-time logs
- Analytics
- Performance metrics
- Error tracking
