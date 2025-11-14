import { createServer, IncomingMessage, ServerResponse } from 'http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '4001');
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Mock Vercel request/response wrapper
function createVercelRequest(req: IncomingMessage): Partial<VercelRequest> {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  return {
    method: req.method,
    url: req.url,
    headers: req.headers as any,
    query: Object.fromEntries(url.searchParams),
    body: null,
  };
}

function createVercelResponse(res: ServerResponse): Partial<VercelResponse> {
  return {
    status: (code: number) => {
      res.statusCode = code;
      return createVercelResponse(res) as any;
    },
    json: (data: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return createVercelResponse(res) as any;
    },
    send: (data: any) => {
      res.end(data);
      return createVercelResponse(res) as any;
    },
    setHeader: (key: string, value: string) => {
      res.setHeader(key, value);
      return createVercelResponse(res) as any;
    },
    end: () => {
      res.end();
      return createVercelResponse(res) as any;
    },
  };
}

async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString();
        resolve(body ? JSON.parse(body) : null);
      } catch (e) {
        resolve(null);
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  try {
    const vercelReq = createVercelRequest(req) as VercelRequest;
    const vercelRes = createVercelResponse(res) as VercelResponse;

    // Parse body for POST requests
    if (req.method === 'POST') {
      vercelReq.body = await parseBody(req);
    }

    // Route to appropriate handler
    if (url.pathname === '/api/health') {
      const handler = (await import('./api/health.js')).default;
      await handler(vercelReq, vercelRes);
    } else if (url.pathname === '/api/search') {
      const handler = (await import('./api/search.js')).default;
      await handler(vercelReq, vercelRes);
    } else if (url.pathname === '/api/guest') {
      const handler = (await import('./api/guest.js')).default;
      await handler(vercelReq, vercelRes);
    } else if (url.pathname.match(/^\/api\/track\/([^/]+)\/stream$/)) {
      const id = url.pathname.match(/^\/api\/track\/([^/]+)\/stream$/)![1];
      vercelReq.query = { ...vercelReq.query, id };
      const handler = (await import('./api/track/[id]/stream.js')).default;
      await handler(vercelReq, vercelRes);
    } else if (url.pathname.match(/^\/api\/track\/([^/]+)\/full$/)) {
      const id = url.pathname.match(/^\/api\/track\/([^/]+)\/full$/)![1];
      vercelReq.query = { ...vercelReq.query, id };
      const handler = (await import('./api/track/[id]/full.js')).default;
      await handler(vercelReq, vercelRes);
    } else if (url.pathname.match(/^\/api\/track\/([^/]+)$/)) {
      const id = url.pathname.match(/^\/api\/track\/([^/]+)$/)![1];
      vercelReq.query = { ...vercelReq.query, id };
      const handler = (await import('./api/track/[id].js')).default;
      await handler(vercelReq, vercelRes);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error: any) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n🎵 MusicMu Serverless Backend (Dev Mode)`);
  console.log(`📡 Running on http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS Origin: ${CORS_ORIGIN}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
