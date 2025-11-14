import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from 'dotenv';
import searchRoutes from './routes/search.js';
import trackRoutes from './routes/track.js';
import guestRoutes from './routes/guest.js';
import { getQueueStats } from './lib/queue.js';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

// Initialize Fastify
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register CORS
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
});

// Register rate limiting (prevent abuse)
await fastify.register(rateLimit, {
  max: 100, // Max 100 requests
  timeWindow: '1 minute', // Per minute
  errorResponseBuilder: (req, context) => {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds`,
    };
  },
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'musicmu-server'
  };
});

// Queue stats endpoint (for monitoring)
fastify.get('/api/stats', async (request, reply) => {
  const stats = getQueueStats();
  return {
    queues: stats,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
});

// Register routes
await fastify.register(searchRoutes, { prefix: '/api' });
await fastify.register(trackRoutes, { prefix: '/api' });
await fastify.register(guestRoutes, { prefix: '/api' });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500,
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`\n🎵 MusicMu Server running on http://${HOST}:${PORT}`);
    console.log(`📡 API available at http://${HOST}:${PORT}/api`);
    console.log(`🏥 Health check: http://${HOST}:${PORT}/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
