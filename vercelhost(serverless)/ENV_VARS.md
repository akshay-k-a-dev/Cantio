# Environment Variables Configuration

This document explains all environment variables used in the MusicMu Vercel Serverless application.

## Backend Environment Variables

### Development (.env)

```bash
# Server Configuration
PORT=4001                          # Port for the backend server
HOST=0.0.0.0                      # Host address (0.0.0.0 allows network access)
NODE_ENV=development              # Environment mode

# CORS Configuration
CORS_ORIGIN=http://localhost:4173 # Allowed origin for CORS (frontend URL)

# Logging
LOG_LEVEL=info                    # Logging level: error, warn, info, debug
```

### Production (.env.production)

```bash
# Server Configuration
PORT=4001
HOST=0.0.0.0
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=*                     # Allow all origins (or set specific domain)

# Logging
LOG_LEVEL=error                   # Only log errors in production
```

### Vercel Deployment

When deploying to Vercel, set these environment variables in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = Your frontend URL or `*`
   - `LOG_LEVEL` = `error`

**Note**: `PORT` and `HOST` are managed by Vercel automatically.

## Frontend Environment Variables

### Development (.env)

```bash
# Backend API URL
VITE_API_URL=http://localhost:4001  # Local backend URL

# App Configuration
VITE_APP_NAME=MusicMu               # Application name
VITE_APP_VERSION=1.0.0              # Application version
```

### Production (.env.production)

```bash
# Backend API URL
VITE_API_URL=https://your-backend.vercel.app  # Your deployed backend URL

# App Configuration
VITE_APP_NAME=MusicMu
VITE_APP_VERSION=1.0.0
```

### Vercel Deployment

For frontend deployment to Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `VITE_API_URL` = Your backend Vercel URL (e.g., `https://musicmu-api.vercel.app`)

**Important**: 
- All Vite env vars must be prefixed with `VITE_`
- They are embedded at build time
- Update `VITE_API_URL` before deploying

## How Environment Variables Work

### Backend

The backend uses `dotenv` to load environment variables from `.env` files:

```typescript
import { config } from 'dotenv';
config(); // Loads .env file

const PORT = parseInt(process.env.PORT || '4001');
const HOST = process.env.HOST || '0.0.0.0';
```

### Frontend

Vite automatically loads `.env` files and exposes `VITE_*` variables:

```typescript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';
```

The vite.config.ts uses this for the proxy:

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:4001';
  
  return {
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
```

## Environment Variable Priority

1. `.env.local` (highest priority, not tracked in git)
2. `.env.[mode]` (e.g., `.env.production`)
3. `.env`
4. Default values in code

## Setup Instructions

### First Time Setup

```bash
# Backend
cd vercelhost/backend
cp .env.example .env
# Edit .env if needed

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env if needed
```

### For Production Deployment

**Backend:**
1. Deploy backend to Vercel first
2. Copy the deployment URL (e.g., `https://musicmu-api-xyz.vercel.app`)

**Frontend:**
1. Update `frontend/.env.production`:
   ```bash
   VITE_API_URL=https://musicmu-api-xyz.vercel.app
   ```
2. Update `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://musicmu-api-xyz.vercel.app/api/:path*"
       }
     ]
   }
   ```
3. Deploy frontend to Vercel

## Testing Environment Variables

### Backend
```bash
cd vercelhost/backend
npx tsx dev-server.ts
# Check console output for loaded environment variables
```

### Frontend
```bash
cd vercelhost/frontend
npm run dev
# Check browser console: console.log(import.meta.env.VITE_API_URL)
```

## Security Notes

- ✅ **DO**: Keep `.env` files in `.gitignore`
- ✅ **DO**: Use `.env.example` for documentation
- ✅ **DO**: Use different values for development and production
- ❌ **DON'T**: Commit `.env` files to git
- ❌ **DON'T**: Put secrets in frontend env vars (they're public in the bundle)
- ❌ **DON'T**: Use the same CORS origin in production (use specific domains)

## Common Issues

### 1. Frontend can't connect to backend
- Check `VITE_API_URL` in `.env`
- Verify backend is running on the correct port
- Check CORS settings in backend `.env`

### 2. CORS errors
- Update `CORS_ORIGIN` in backend `.env`
- Make sure it matches your frontend URL
- Use `*` only for testing, not production

### 3. Environment variables not updating
- Restart the development server
- Frontend: Vite requires a restart for env changes
- Backend: tsx watch should auto-reload

### 4. Vercel deployment issues
- Ensure env vars are set in Vercel dashboard
- Check build logs for environment variable errors
- Verify `VITE_API_URL` is correct in production build

## Reference

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
