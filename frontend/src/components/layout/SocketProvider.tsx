import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from './AuthProvider';

interface SocketContextProps {
  socket: Socket | null;
  onlineUsers: string[];
  isOnline: (userId: string) => boolean;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthContext();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Resolve socket url by removing api prefix
    const backendBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api').replace('/api', '');

    // Parse token payload for userId or use user.id if available
    let userId = '';
    try {
      const decoded = JSON.parse(atob(user.token.split('.')[1]));
      userId = decoded.userId || decoded.id || '';
    } catch (e) {
      console.error('Failed to parse userId from token');
    }

    const socketInstance = io(backendBaseUrl, {
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
    };
  }, [user]);

  const isOnline = (userId: string) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
