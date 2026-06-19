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
    
    if (userId) {
      const existing = activeUsers.get(userId) || [];
      activeUsers.set(userId, [...existing, socket.id]);
      
      // Broadcast online status to everyone
      io?.emit('user_online', { userId });
      // Send the current list of online users to the newly connected user
      socket.emit('get_online_users', Array.from(activeUsers.keys()));
      console.log(`User connected: ${userId} (Socket: ${socket.id})`);
    }

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
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
