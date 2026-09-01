import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';

export interface SocketContextProps {
  socket: Socket | null;
  onlineUsers: string[];
  isOnline: (userId: string) => boolean;
}

export const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
