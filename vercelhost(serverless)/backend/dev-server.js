// Simple dev server for testing serverless functions locally
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 4001;

// Import handlers
const handlers = {
  health: null,
  search: null,
  track: null,
  stream: null,
  full: null,
  guest: null,
};

// Load handlers dynamically
async function loadHandlers() {
  handlers.health = (await import('./api/health.ts')).default;
  handlers.search = (await import('./api/search.ts')).default;
  handlers.track = (await import('./api/track/[id].ts')).default;
  handlers.stream = (await import('./api/track/[id]/stream.ts')).default;
  handlers.full = (await import('./api/track/[id]/full.ts')).default;
  handlers.guest = (await import('./api/guest.ts')).default;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // Mock Vercel request/response objects
  const vercelReq = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: Object.fromEntries(url.searchParams),
    body: null,
  };

  // Parse body for POST requests
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    try {
      vercelReq.body = JSON.parse(Buffer.concat(chunks).toString());
    } catch (e) {
      vercelReq.body = {};
    }
  }

  const vercelRes = {
    status: (code) => {
      res.statusCode = code;
      return vercelRes;
    },
    json: (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
    send: (data) => {
      res.end(data);
    },
    setHeader: (key, value) => {
      res.setHeader(key, value);
    },
    end: () => {
      res.end();
    },
  };

  try {
    // Route to appropriate handler
    if (url.pathname === '/api/health') {
      await handlers.health(vercelReq, vercelRes);
    } else if (url.pathname === '/api/search') {
      await handlers.search(vercelReq, vercelRes);
    } else if (url.pathname === '/api/guest') {
      await handlers.guest(vercelReq, vercelRes);
    } else if (url.pathname.match(/^\/api\/track\/([^/]+)\/stream$/)) {
      const id = url.pathname.match(/^\/api\/track\/([^/]+)\/stream$/)[1];
      vercelReq.query.id = id;
      await handlers.stream(vercelReq, vercelRes);
    } else if (url.pathname.match(/^\/api\/track\/([^/]+)\/full$/)) {
      const id = url.pathname.match(/^\/api\/track\/([^/]+)\/full$/)[1];
      vercelReq.query.id = id;
      await handlers.full(vercelReq, vercelRes);
    } else if (url.pathname.match(/^\/api\/track\/([^/]+)$/)) {
      const id = url.pathname.match(/^\/api\/track\/([^/]+)$/)[1];
      vercelReq.query.id = id;
      await handlers.track(vercelReq, vercelRes);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }));
  }
});

// Start server
await loadHandlers();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎵 MusicMu Serverless Backend (Dev Mode)`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
});
