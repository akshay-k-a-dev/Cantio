import type { VercelRequest, VercelResponse } from '@vercel/node';
import app, { initializeApp } from '../src/index.js';

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize app (plugins, routes) - idempotent
  await initializeApp();
  await app.ready();
  app.server.emit('request', req, res);
}
