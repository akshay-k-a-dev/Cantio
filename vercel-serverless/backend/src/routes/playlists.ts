import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { createPlaylistSchema, addToPlaylistSchema } from '../lib/validation.js';

export default async function playlistsRoutes(fastify: FastifyInstance) {
  // Get all user playlists
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const playlists = await prisma.playlist.findMany({
        where: { userId },
        include: {
          _count: {
            select: { tracks: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        cacheStrategy: { ttl: 60, swr: 30 }
      });

      return { playlists };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch playlists' };
    }
  });

  // Create playlist
  fastify.post('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const body = createPlaylistSchema.parse(request.body);
      const userId = (request.user as any).id;

      const playlist = await prisma.playlist.create({
        data: {
          userId,
          name: body.name,
          description: body.description,
          isPublic: body.isPublic,
        },
        include: {
          _count: {
            select: { tracks: true }
          }
        }
      });

      return { playlist };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400);
        return { error: 'Validation failed', details: error.errors };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to create playlist' };
    }
  });

  // Get playlist by ID
  fastify.get('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      const playlist = await prisma.playlist.findFirst({
        where: {
          id,
          OR: [
            { userId },
            { isPublic: true }
          ]
        },
        include: {
          tracks: {
            orderBy: { position: 'asc' }
          },
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          }
        },
        cacheStrategy: { ttl: 60, swr: 30 }
      });

      if (!playlist) {
        reply.code(404);
        return { error: 'Playlist not found' };
      }

      return { playlist };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch playlist' };
    }
  });

  // Add track to playlist
  fastify.post('/:id/tracks', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = addToPlaylistSchema.parse(request.body);
      const userId = (request.user as any).id;

      // Verify playlist ownership
      const playlist = await prisma.playlist.findFirst({
        where: { id, userId }
      });

      if (!playlist) {
        reply.code(404);
        return { error: 'Playlist not found' };
      }

      // Shift all existing tracks down (increment their positions)
      await prisma.playlistTrack.updateMany({
        where: { playlistId: id },
        data: { position: { increment: 1 } }
      });

      // Add new track at position 0 (top of playlist)
      const track = await prisma.playlistTrack.create({
        data: {
          playlistId: id,
          trackId: body.trackId,
          title: body.title,
          artist: body.artist,
          thumbnail: body.thumbnail,
          duration: body.duration,
          position: 0
        }
      });

      return { track };
    } catch (error: any) {
      if (error.code === 'P2002') {
        reply.code(409);
        return { error: 'Track already in playlist' };
      }
      if (error.name === 'ZodError') {
        reply.code(400);
        return { error: 'Validation failed', details: error.errors };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to add track to playlist' };
    }
  });

  // Remove track from playlist
  fastify.delete('/:id/tracks/:trackId', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id, trackId } = request.params as { id: string; trackId: string };
      const userId = (request.user as any).id;

      // Verify playlist ownership
      const playlist = await prisma.playlist.findFirst({
        where: { id, userId }
      });

      if (!playlist) {
        reply.code(404);
        return { error: 'Playlist not found' };
      }

      await prisma.playlistTrack.delete({
        where: {
          playlistId_trackId: {
            playlistId: id,
            trackId
          }
        }
      });

      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Track not found in playlist' };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to remove track from playlist' };
    }
  });

  // Update playlist
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const userId = (request.user as any).id;

      const playlist = await prisma.playlist.update({
        where: {
          id,
          userId
        },
        data: {
          name: body.name,
          description: body.description,
          isPublic: body.isPublic,
        }
      });

      return { playlist };
    } catch (error: any) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Playlist not found' };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to update playlist' };
    }
  });

  // Delete playlist
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      await prisma.playlist.delete({
        where: {
          id,
          userId
        }
      });

      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Playlist not found' };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to delete playlist' };
    }
  });

  // Get popular tracks from other users' public playlists (cached weekly)
  fastify.get('/discover/popular', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

      // Check if we need to refresh the cache
      const cacheInfo = await prisma.systemCache.findUnique({
        where: { key: 'popular_tracks_updated' }
      });

      const lastUpdate = cacheInfo ? new Date(cacheInfo.value).getTime() : 0;
      const needsRefresh = Date.now() - lastUpdate > ONE_WEEK_MS;

      if (needsRefresh) {
        fastify.log.info('Refreshing popular tracks cache...');
        
        // Run aggregation in background to not block response
        // For first-time users, we'll still return fresh data
        const freshTracks = await prisma.$queryRaw`
          SELECT 
            pt."trackId",
            pt.title,
            pt.artist,
            pt.thumbnail,
            pt.duration,
            COUNT(DISTINCT p.id)::integer as "playlistCount"
          FROM playlist_tracks pt
          INNER JOIN playlists p ON pt."playlistId" = p.id
          WHERE p."isPublic" = true
          GROUP BY pt."trackId", pt.title, pt.artist, pt.thumbnail, pt.duration
          ORDER BY "playlistCount" DESC
          LIMIT 50
        ` as any[];

        // Update cache in background (don't await)
        (async () => {
          try {
            // Clear old cache
            await prisma.cachedPopularTracks.deleteMany();
            
            // Insert new cached tracks
            if (freshTracks.length > 0) {
              await prisma.cachedPopularTracks.createMany({
                data: freshTracks.map((t: any) => ({
                  trackId: t.trackId,
                  title: t.title,
                  artist: t.artist,
                  thumbnail: t.thumbnail,
                  duration: t.duration,
                  playlistCount: t.playlistCount
                }))
              });
            }

            // Update timestamp
            await prisma.systemCache.upsert({
              where: { key: 'popular_tracks_updated' },
              update: { value: new Date().toISOString() },
              create: { key: 'popular_tracks_updated', value: new Date().toISOString() }
            });
            
            fastify.log.info('Popular tracks cache refreshed successfully');
          } catch (err) {
            fastify.log.error({ err }, 'Failed to refresh popular tracks cache');
          }
        })();

        // Return fresh data immediately (excluding user's own tracks)
        const filtered = freshTracks.filter((t: any) => true); // All tracks for now
        return { tracks: filtered.slice(0, 20) };
      }

      // Return cached data
      const cachedTracks = await prisma.cachedPopularTracks.findMany({
        orderBy: { playlistCount: 'desc' },
        take: 20
      });

      return { tracks: cachedTracks };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch popular tracks' };
    }
  });
}
