import { FastifyInstance } from 'fastify';
import { getMetadata } from '../lib/youtube.js';

export default async function trackRoutes(fastify: FastifyInstance) {
  // Get track metadata
  fastify.get('/track/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const metadata = await getMetadata(id);
      return reply.send(metadata);
    } catch (error) {
      console.error('Metadata error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get track metadata',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Stream endpoint - ALWAYS returns iframe mode
   * No audio extraction, no proxying, no complexity
   */
  fastify.get('/track/:id/stream', async (request, reply) => {
    const { id } = request.params as { id: string };

    // Always return iframe mode - simple and stable
    return reply.send({
      mode: 'iframe',
      url: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&playsinline=1`,
      source: 'iframe',
    });
  });

  // Combined endpoint: get metadata + stream in one request
  fastify.get('/track/:id/full', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const metadata = await getMetadata(id);
      
      return reply.send({
        ...metadata,
        stream: {
          mode: 'iframe',
          url: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&playsinline=1`,
          source: 'iframe',
        },
      });
    } catch (error) {
      console.error('Full track error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get track information',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
