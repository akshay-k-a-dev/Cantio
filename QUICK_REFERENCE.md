# 🎵 MusicMu Quick Reference

## 🚀 Start/Stop Service

```bash
# Start
sudo systemctl start musicmu

# Stop
sudo systemctl stop musicmu

# Restart
sudo systemctl restart musicmu

# Status
sudo systemctl status musicmu

# Logs
journalctl -u musicmu -f
```

## 🧪 Test Backend

```bash
# Quick test
./test-backend.sh

# Manual tests
curl http://localhost:3001/health
curl http://localhost:3001/api/track/dQw4w9WgXcQ/stream
curl http://localhost:3001/api/search?q=test
```

## 🏗️ Build & Deploy

```bash
# Build backend
cd server && npm run build

# Build frontend
cd client && npm run build

# Build both
cd server && npm run build && cd ../client && npm run build

# Deploy
sudo systemctl restart musicmu
```

## 🧹 Cleanup

```bash
# Run cleanup script
./cleanup.sh

# Manual cleanup
cd server && npm prune
rm -f *-player-script.js
```

## 📊 Monitor

```bash
# Service status
systemctl status musicmu

# Queue stats
curl http://localhost:3001/api/stats

# Health check
curl http://localhost:3001/health

# Memory usage
ps aux | grep node
```

## 🔧 Configuration

### Backend (.env)
```env
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=*
NODE_ENV=production
```

### Piped Instance
Edit: `server/src/lib/piped.ts`
```typescript
const PIPED_INSTANCE = 'https://piped.in.projectsegfau.lt';
```

### Rate Limits
Edit: `server/src/index.ts`
```typescript
max: 100,          // requests per minute
timeWindow: 60000  // 1 minute
```

## 🌐 Access Points

```bash
Frontend: http://musicmu.local:5173
Backend:  http://localhost:3001
Health:   http://localhost:3001/health
Stats:    http://localhost:3001/api/stats
```

## 📝 API Endpoints

```bash
# Metadata
GET /api/track/:id

# Stream (Piped + fallback)
GET /api/track/:id/stream

# Search
GET /api/search?q=query&limit=10

# Health
GET /health

# Stats
GET /api/stats
```

## ⚠️ Troubleshooting

### Service won't start
```bash
sudo systemctl status musicmu
tail -50 /var/log/syslog | grep musicmu
```

### Frontend not accessible
```bash
lsof -i :5173
curl http://musicmu.local:5173
```

### Backend errors
```bash
tail -50 server.log
tail -50 client.log
```

### Piped not working
- Check: `curl https://piped.in.projectsegfau.lt`
- Fallback to iframe works automatically
- Change instance in `piped.ts` if needed

## 🎯 Common Tasks

### Add new Piped instance
```typescript
// server/src/lib/piped.ts
const PIPED_INSTANCE = 'https://new-instance.com';
```

### Adjust concurrency
```typescript
// server/src/lib/queue.ts
const STREAM_CONCURRENCY = 15;  // was 10
const SEARCH_CONCURRENCY = 8;   // was 5
```

### Change port
```env
# server/.env
PORT=8080  # was 3001
```

### Desktop shortcut
```bash
# Located at:
~/Desktop/MusicMu.desktop
~/.local/share/applications/musicmu.desktop
```

## 📚 Documentation

- `BACKEND_ARCHITECTURE.md` - Full technical docs
- `REFACTORING_COMPLETE.md` - What changed
- `SELF_HOSTED.md` - Deployment guide
- `NETWORK_ACCESS.md` - Network setup

## 🆘 Emergency Recovery

```bash
# Full restart
sudo systemctl stop musicmu
cd ~/Videos/musicplayer/musicmu
cd server && npm run build
cd ../client && npm run build
sudo systemctl start musicmu

# Reset to working state
cd ~/Videos/musicplayer/musicmu
git stash  # if using git
./test-backend.sh
```

## ✅ Health Checklist

- [ ] Service running: `systemctl is-active musicmu`
- [ ] Frontend accessible: `curl http://musicmu.local:5173`
- [ ] Backend healthy: `curl http://localhost:3001/health`
- [ ] Streams working: `./test-backend.sh`
- [ ] No old dependencies: `./cleanup.sh`

---

**Need help?** Check the documentation files or run `./test-backend.sh`
