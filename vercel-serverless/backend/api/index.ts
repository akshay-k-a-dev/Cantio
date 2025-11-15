import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index.js';

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await app.ready();
  app.server.emit('request', req, res);
}
