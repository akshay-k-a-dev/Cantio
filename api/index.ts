import type { VercelRequest, VercelResponse } from '@vercel/node';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { search, getMetadata } from '../lib/youtube.js';

let app: FastifyInstance | null = null;

// Initialize Fastify instance
async function getApp() {
  if (app) return app;

  app = Fastify({
    logger: process.env.NODE_ENV === 'development'
  });

  // Register CORS
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS']
  });

  // Health check
  app.get('/api/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'musicmu-serverless',
      mode: 'fastify-vercel'
    };
  });

  // Search endpoint
  app.get('/api/search', async (request, reply) => {
    const { q } = request.query as { q?: string };
    
    if (!q) {
      reply.code(400);
      return { error: 'Missing search query parameter "q"' };
    }

    try {
      const results = await search(q);
      return { results };
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return { error: 'Search failed' };
    }
  });

  // Guest session endpoint
  app.get('/api/guest', async (request, reply) => {
    return {
      sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresIn: 3600000,
      createdAt: new Date().toISOString()
    };
  });

  // Track metadata endpoint
  app.get('/api/track/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const metadata = await getMetadata(id);
      return metadata;
    } catch (error) {
      request.log.error(error);
      reply.code(404);
      return { error: 'Track not found' };
    }
  });

  // Track streaming endpoint - iframe only
  app.get('/api/track/:id/stream', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    return {
      mode: 'iframe',
      url: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`
    };
  });

  // Full track info (metadata + stream)
  app.get('/api/track/:id/full', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const metadata = await getMetadata(id);
      const stream = {
        mode: 'iframe',
        url: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`
      };

      return {
        metadata,
        stream
      };
    } catch (error) {
      request.log.error(error);
      reply.code(404);
      return { error: 'Track not found' };
    }
  });

  await app.ready();
  return app;
}

// Export handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getApp();
  fastify.server.emit('request', req, res);
}
