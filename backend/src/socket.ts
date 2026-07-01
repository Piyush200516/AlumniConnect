import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from './utils/jwt';
import { prisma } from './lib/prisma';
import { logger } from './utils/logger';

// Map to track active user socket connections: userId -> socketId[]
const activeUsers = new Map<string, string[]>();

export let io: Server | null = null;

export const getOnlineUsers = () => {
  return Array.from(activeUsers.keys());
};

export const getSocketIdsForUser = (userId: string): string[] => {
  return activeUsers.get(userId) || [];
};

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // ─── JWT Authentication Middleware ───────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      // Accept token from: auth object, Authorization header, or query param
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (Array.isArray(token)) token = token[0];

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      // Strip "Bearer " prefix if present
      if (typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7);
      }

      // Verify and decode the JWT
      const decoded = verifyAccessToken(token as string);

      // If role is missing from the token payload, fetch it from DB
      // (handles old tokens signed before role was added to payload)
      if (!decoded.role) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { role: true },
        });
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }
        decoded.role = user.role;
      }

      socket.data.user = decoded;
      next();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.warn(`[Socket] Auth failed: ${message}`);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // ─── Connection Handler ───────────────────────────────────────────────────────
  io.on('connection', (socket: Socket) => {
    const user = socket.data?.user;
    const userId = user?.userId as string | undefined;
    const role = user?.role as string | undefined;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // Track socket in activeUsers map
    const existing = activeUsers.get(userId) || [];
    activeUsers.set(userId, [...existing, socket.id]);

    // Join personal and role rooms
    socket.join(`user_${userId}`);
    if (role) socket.join(`role_${role}`);

    // Broadcast online status
    io?.emit('user_online', { userId });
    socket.emit('get_online_users', Array.from(activeUsers.keys()));

    logger.info(`[Socket] Connected: userId=${userId} role=${role ?? 'none'} socketId=${socket.id}`);

    // ── Room management ──────────────────────────────────────────────────────
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      logger.info(`[Socket] ${socket.id} joined room: ${roomId}`);
    });

    socket.on('join_role_room', (r: string) => {
      socket.join(`role_${r}`);
      logger.info(`[Socket] ${socket.id} joined role room: ${r}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('leave_role_room', (r: string) => {
      socket.leave(`role_${r}`);
    });

    // ── Typing indicators ────────────────────────────────────────────────────
    socket.on('typing_start', ({ roomId, userId: uid }: { roomId: string; userId: string }) => {
      socket.to(roomId).emit('typing_start', { roomId, userId: uid });
    });

    socket.on('typing_stop', ({ roomId, userId: uid }: { roomId: string; userId: string }) => {
      socket.to(roomId).emit('typing_stop', { roomId, userId: uid });
    });

    // ── Message read receipts ────────────────────────────────────────────────
    socket.on(
      'message_read',
      ({ messageId, roomId, userId: uid }: { messageId: string; roomId: string; userId: string }) => {
        socket.to(roomId).emit('message_read', { messageId, roomId, userId: uid });
      }
    );

    socket.on('messages_read', ({ roomId, userId: uid }: { roomId: string; userId: string }) => {
      socket.to(roomId).emit('messages_read', { roomId, userId: uid });
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const remaining = (activeUsers.get(userId) || []).filter((id) => id !== socket.id);
      if (remaining.length > 0) {
        activeUsers.set(userId, remaining);
      } else {
        activeUsers.delete(userId);
        io?.emit('user_offline', { userId });
      }
      logger.info(`[Socket] Disconnected: userId=${userId} socketId=${socket.id}`);
    });
  });
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
export const emitToUser = (userId: string, eventName: string, data: unknown) => {
  // Use the named room (more reliable than tracking socketIds manually)
  io?.to(`user_${userId}`).emit(eventName, data);
};

export const emitToRole = (role: string, eventName: string, data: unknown) => {
  io?.to(`role_${role}`).emit(eventName, data);
};
