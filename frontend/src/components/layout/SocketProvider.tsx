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

    // Parse token payload for userId
    let userId = '';
    try {
      const decoded = JSON.parse(atob(user.token.split('.')[1]));
      userId = decoded.userId || decoded.id || '';
    } catch {
      console.error('[SocketProvider] Failed to parse userId from token');
    }

    // Derive the Socket.IO server origin — strip /api suffix if present.
    // In production this is the Render backend URL (e.g. https://xxx.onrender.com).
    const origin = API_ORIGIN || 'http://localhost:5002';

    const socketInstance = io(origin, {
      auth: { token: user.token },
      query: { userId },
      // Prefer WebSocket, fall back to polling if wss:// is blocked
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      console.log('[SocketProvider] Socket.IO connected:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      // Log only — do not throw. The native WS hook handles real-time chat independently.
      console.warn('[SocketProvider] Socket.IO connection error (non-fatal):', err.message);
    });

    // Presence tracking
    socketInstance.on('get_online_users', (users: string[]) => {
      setOnlineUsers(users);
    });

    socketInstance.on('user_online', ({ userId: uid }: { userId: string }) => {
      setOnlineUsers(prev => prev.includes(uid) ? prev : [...prev, uid]);
    });

    socketInstance.on('user_offline', ({ userId: uid }: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(id => id !== uid));
    });

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
