import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

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

  io.on('connection', (socket: Socket) => {
  const userId = socket.handshake.query.userId as string;
  const role = socket.handshake.query.role as string;
  
  // Join user-specific room
  if (userId) {
    const existing = activeUsers.get(userId) || [];
    activeUsers.set(userId, [...existing, socket.id]);
    socket.join(`user_${userId}`);
  }
  // Join role-based room if provided
  if (role) {
    socket.join(`role_${role}`);
  }
  
  // Broadcast online status to everyone
  if (userId) {
    io?.emit('user_online', { userId });
    socket.emit('get_online_users', Array.from(activeUsers.keys()));
    console.log(`User connected: ${userId} (Socket: ${socket.id}) role: ${role}`);
  }

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('join_role_room', (role: string) => {
      socket.join(`role_${role}`);
      console.log(`Socket ${socket.id} joined role room: ${role}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
    });

    socket.on('leave_role_room', (role: string) => {
      socket.leave(`role_${role}`);
      console.log(`Socket ${socket.id} left role room: ${role}`);
    });

    socket.on('typing_start', ({ roomId, userId }: { roomId: string, userId: string }) => {
      socket.to(roomId).emit('typing_start', { roomId, userId });
    });

    socket.on('typing_stop', ({ roomId, userId }: { roomId: string, userId: string }) => {
      socket.to(roomId).emit('typing_stop', { roomId, userId });
    });

    socket.on('message_read', ({ messageId, roomId, userId }: { messageId: string, roomId: string, userId: string }) => {
      socket.to(roomId).emit('message_read', { messageId, roomId, userId });
    });

    socket.on('messages_read', ({ roomId, userId }: { roomId: string, userId: string }) => {
      socket.to(roomId).emit('messages_read', { roomId, userId });
    });

    socket.on('disconnect', () => {
      if (userId) {
        const existing = activeUsers.get(userId) || [];
        const filtered = existing.filter(id => id !== socket.id);
        if (filtered.length > 0) {
          activeUsers.set(userId, filtered);
        } else {
          activeUsers.delete(userId);
          // Broadcast offline status to everyone
          io?.emit('user_offline', { userId });
        }
        console.log(`User disconnected: ${userId} (Socket: ${socket.id})`);
      }
    });
  });
};

export const emitToUser = (userId: string, eventName: string, data: any) => {
  const socketIds = getSocketIdsForUser(userId);
  socketIds.forEach(socketId => {
    io?.to(socketId).emit(eventName, data);
  });
};

export const emitToRole = (role: string, eventName: string, data: any) => {
  io?.to(`role_${role}`).emit(eventName, data);
};
