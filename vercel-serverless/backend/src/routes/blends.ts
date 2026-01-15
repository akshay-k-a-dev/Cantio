import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export default async function blendsRoutes(fastify: FastifyInstance) {
  // Send blend invite
  fastify.post('/invite', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { email } = request.body as { email: string };
      const senderId = (request.user as any).id;

      // Find receiver by email
      const receiver = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true }
      });

      if (!receiver) {
        reply.code(404);
        return { error: 'User not found with that email' };
      }

      if (receiver.id === senderId) {
        reply.code(400);
        return { error: 'Cannot send blend invite to yourself' };
      }

      // Check for existing invite
      const existing = await prisma.blendInvite.findFirst({
        where: {
          OR: [
            { senderId, receiverId: receiver.id },
            { senderId: receiver.id, receiverId: senderId }
          ]
        }
      });

      if (existing) {
        reply.code(409);
        return { error: 'Blend invite already exists between these users' };
      }

      // Create invite
      const invite = await prisma.blendInvite.create({
        data: {
          senderId,
          receiverId: receiver.id
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          receiver: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      return { invite };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to send blend invite' };
    }
  });

  // Get my invites (received)
  fastify.get('/invites', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const invites = await prisma.blendInvite.findMany({
        where: {
          receiverId: userId,
          status: 'pending'
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { invites };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch invites' };
    }
  });

  // Accept blend invite
  fastify.post('/invites/:id/accept', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      // Verify invite
      const invite = await prisma.blendInvite.findFirst({
        where: { id, receiverId: userId, status: 'pending' }
      });

      if (!invite) {
        reply.code(404);
        return { error: 'Invite not found or already processed' };
      }

      // Update invite status
      await prisma.blendInvite.update({
        where: { id },
        data: { status: 'accepted', respondedAt: new Date() }
      });

      // Create blend
      const blend = await createBlend(invite.senderId, invite.receiverId);

      return { blend };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to accept invite' };
    }
  });

  // Reject blend invite
  fastify.post('/invites/:id/reject', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      const invite = await prisma.blendInvite.findFirst({
        where: { id, receiverId: userId, status: 'pending' }
      });

      if (!invite) {
        reply.code(404);
        return { error: 'Invite not found or already processed' };
      }

      await prisma.blendInvite.update({
        where: { id },
        data: { status: 'rejected', respondedAt: new Date() }
      });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to reject invite' };
    }
  });

  // Get my blends
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const blends = await prisma.blend.findMany({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        },
        include: {
          user1: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          user2: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          _count: {
            select: { tracks: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { blends };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch blends' };
    }
  });

  // Get blend details
  fastify.get('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      const blend = await prisma.blend.findFirst({
        where: {
          id,
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        },
        include: {
          user1: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          user2: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          tracks: {
            orderBy: { position: 'asc' }
          }
        }
      });

      if (!blend) {
        reply.code(404);
        return { error: 'Blend not found' };
      }

      return { blend };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch blend' };
    }
  });

  // Regenerate blend (refresh tracks)
  fastify.post('/:id/regenerate', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      const blend = await prisma.blend.findFirst({
        where: {
          id,
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!blend) {
        reply.code(404);
        return { error: 'Blend not found' };
      }

      // Delete existing tracks
      await prisma.blendTrack.deleteMany({
        where: { blendId: id }
      });

      // Regenerate tracks
      await generateBlendTracks(id, blend.user1Id, blend.user2Id);

      const updatedBlend = await prisma.blend.findUnique({
        where: { id },
        include: {
          user1: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          user2: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          tracks: {
            orderBy: { position: 'asc' }
          }
        }
      });

      return { blend: updatedBlend };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to regenerate blend' };
    }
  });

  // Leave blend (delete blend when either user leaves)
  fastify.delete('/:id/leave', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      const blend = await prisma.blend.findFirst({
        where: {
          id,
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!blend) {
        reply.code(404);
        return { error: 'Blend not found' };
      }

      // Delete blend tracks first
      await prisma.blendTrack.deleteMany({
        where: { blendId: id }
      });

      // Delete the blend
      await prisma.blend.delete({
        where: { id }
      });

      return { success: true, message: 'Blend closed successfully' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to leave blend' };
    }
  });
}

// Helper function to create blend
async function createBlend(user1Id: string, user2Id: string) {
  const [user1, user2] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user1Id },
      select: { name: true }
    }),
    prisma.user.findUnique({
      where: { id: user2Id },
      select: { name: true }
    })
  ]);

  const blendName = `${user1?.name || 'User'} x ${user2?.name || 'User'} Blend`;

  const blend = await prisma.blend.create({
    data: {
      name: blendName,
      user1Id,
      user2Id
    },
    include: {
      user1: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      user2: {
        select: { id: true, name: true, email: true, avatar: true }
      }
    }
  });

  // Generate blend tracks
  await generateBlendTracks(blend.id, user1Id, user2Id);

  return blend;
}

// Helper function to generate blend tracks
async function generateBlendTracks(blendId: string, user1Id: string, user2Id: string) {
  // Get liked tracks and most played for both users
  const [user1Liked, user2Liked, user1MostPlayed, user2MostPlayed] = await Promise.all([
    prisma.likedTrack.findMany({
      where: { userId: user1Id },
      orderBy: { likedAt: 'desc' },
      take: 15
    }),
    prisma.likedTrack.findMany({
      where: { userId: user2Id },
      orderBy: { likedAt: 'desc' },
      take: 15
    }),
    prisma.playHistory.findMany({
      where: { userId: user1Id },
      distinct: ['trackId'],
      orderBy: { playedAt: 'desc' },
      take: 10
    }),
    prisma.playHistory.findMany({
      where: { userId: user2Id },
      distinct: ['trackId'],
      orderBy: { playedAt: 'desc' },
      take: 10
    })
  ]);

  // Combine and deduplicate tracks
  const trackMap = new Map<string, { track: any; userId: string }>();

  user1Liked.forEach(t => trackMap.set(t.trackId, { track: t, userId: user1Id }));
  user2Liked.forEach(t => {
    if (!trackMap.has(t.trackId)) trackMap.set(t.trackId, { track: t, userId: user2Id });
  });
  user1MostPlayed.forEach(t => {
    if (!trackMap.has(t.trackId)) trackMap.set(t.trackId, { track: t, userId: user1Id });
  });
  user2MostPlayed.forEach(t => {
    if (!trackMap.has(t.trackId)) trackMap.set(t.trackId, { track: t, userId: user2Id });
  });

  // Convert to array and shuffle
  const tracks = Array.from(trackMap.values());
  for (let i = tracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
  }

  // Limit to 50 tracks
  const finalTracks = tracks.slice(0, 50);

  // Create blend tracks
  const blendTracks = finalTracks.map((item, index) => ({
    blendId,
    trackId: item.track.trackId,
    title: item.track.title,
    artist: item.track.artist,
    thumbnail: item.track.thumbnail,
    duration: item.track.duration,
    sourceUserId: item.userId,
    position: index
  }));

  await prisma.blendTrack.createMany({
    data: blendTracks
  });
}
