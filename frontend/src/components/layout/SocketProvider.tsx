import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from './AuthProvider';
import { SocketContext } from './SocketContext';
import { API_ORIGIN } from '../../services/api';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthContext();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Parse token payload for userId or use user.id if available
    let userId = '';
    try {
      const decoded = JSON.parse(atob(user.token.split('.')[1]));
      userId = decoded.userId || decoded.id || '';
    } catch {
      console.error('Failed to parse userId from token');
    }

    const socketInstance = io(API_ORIGIN, {
      auth: { token: user.token },
      query: { userId },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Socket client connected. Handshake ID:', socketInstance.id);
    });

    // Handle online statuses
    socketInstance.on('get_online_users', (users: string[]) => {
      setOnlineUsers(users);
    });

    socketInstance.on('user_online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
    });

    socketInstance.on('user_offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    // Catch initial setup if any or request query response
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket((currentSocket) => currentSocket === socketInstance ? null : currentSocket);
      setOnlineUsers([]);
    };
  }, [user]);

  const isOnline = (userId: string) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};
