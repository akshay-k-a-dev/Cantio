import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/auth.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, sendOtpSchema, resetPasswordSchema } from '../lib/validation.js';
import { storeOtp, sendOtpEmail, verifyOtp, checkResendCooldown, EmailError } from '../lib/email.js';

const registerWithOtpSchema = registerSchema.extend({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const body = registerWithOtpSchema.parse(request.body);
      const email = body.email.toLowerCase();

      // Verify OTP before creating account
      const otpValid = verifyOtp(email, body.otp, 'register');
      if (!otpValid) {
        reply.code(400);
        return { error: 'Invalid or expired verification code' };
      }
      
      // Generate username from email if not provided
      const username = body.username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + '_' + Math.random().toString(36).substr(2, 4);
      
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        reply.code(409);
        return { 
          error: existingUser.email === email 
            ? 'Email already registered' 
            : 'Username already taken' 
        };
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(body.password);
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          name: body.name || username,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          createdAt: true,
        }
      });

      // Generate JWT
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
      });

      return { user, token };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400);
        return { error: 'Validation failed', details: error.errors };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Registration failed' };
    }
  });

  // Send OTP (register verification or password reset)
  fastify.post('/send-otp', async (request, reply) => {
    try {
      const body = sendOtpSchema.parse(request.body);
      const email = body.email.toLowerCase();

      if (body.purpose === 'register') {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          reply.code(409);
          return { error: 'Email already registered' };
        }
      } else {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          // Don't reveal whether email exists
          return { success: true, message: 'If that email is registered, an OTP has been sent.' };
        }
      }

      checkResendCooldown(email);
      const otp = storeOtp(email, body.purpose);
      await sendOtpEmail(email, otp, body.purpose);
      return { success: true, message: 'OTP sent to your email' };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400);
        return { error: 'Validation failed', details: error.errors };
      }
      if (error instanceof EmailError) {
        const statusMap: Record<string, number> = {
          RATE_LIMITED:      429,
          QUOTA_EXCEEDED:    503,
          AUTH_FAILED:       500,
          INVALID_RECIPIENT: 422,
          NETWORK_ERROR:     502,
          UNKNOWN:           500,
        };
        reply.code(statusMap[error.code] ?? 500);
        return {
          error: error.message,
          code: error.code,
          ...(error.retryAfterSeconds ? { retryAfter: error.retryAfterSeconds } : {}),
        };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to send OTP' };
    }
  });

  // Reset password via OTP
  fastify.post('/reset-password', async (request, reply) => {
    try {
      const body = resetPasswordSchema.parse(request.body);
      const email = body.email.toLowerCase();

      const otpValid = verifyOtp(email, body.otp, 'reset');
      if (!otpValid) {
        reply.code(400);
        return { error: 'Invalid or expired verification code' };
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        reply.code(404);
        return { error: 'User not found' };
      }

      const hashedPassword = await hashPassword(body.newPassword);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });

      return { success: true, message: 'Password reset successfully' };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400);
        return { error: 'Validation failed', details: error.errors };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to reset password' };
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email: body.email }
      });

      if (!user) {
        reply.code(401);
        return { error: 'Invalid email or password' };
      }

      const isValidPassword = await verifyPassword(body.password, user.password);
      if (!isValidPassword) {
        reply.code(401);
        return { error: 'Invalid email or password' };
      }

      // Generate JWT
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
      });

      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400);
        return { error: 'Validation failed', details: error.errors };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Login failed' };
    }
  });

  // Get current user (protected)
  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: (request.user as any).id },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              likedTracks: true,
              playlists: true,
              playHistory: true
            }
          }
        },
        cacheStrategy: { ttl: 60, swr: 30 }
      });

      if (!user) {
        reply.code(404);
        return { error: 'User not found' };
      }

      return { user };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to fetch user' };
    }
  });

  // Update profile (protected)
  fastify.patch('/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const body = updateProfileSchema.parse(request.body);
      const userId = (request.user as any).id;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: body.name,
          username: body.username,
          avatar: body.avatar,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          updatedAt: true,
        }
      });

      return { user };
    } catch (error: any) {
      if (error.code === 'P2002') {
        reply.code(409);
        return { error: 'Username already taken' };
      }
      if (error.name === 'ZodError') {
        reply.code(400);
        return { error: 'Validation failed', details: error.errors };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to update profile' };
    }
  });

  // Change password (protected)
  fastify.post('/change-password', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const body = changePasswordSchema.parse(request.body);
      const userId = (request.user as any).id;

      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user) {
        reply.code(404);
        return { error: 'User not found' };
      }

      // Verify current password
      const isValid = await verifyPassword(body.currentPassword, user.password);
      if (!isValid) {
        reply.code(401);
        return { error: 'Current password is incorrect' };
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(body.newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400);
        return { error: 'Validation failed', details: error.errors };
      }
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Failed to change password' };
    }
  });
}
