import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useAuthContext } from '../components/layout/AuthProvider';
import type { RootState } from '../store/store';
import {
  addIncomingMessage,
  setUserOnline,
  setUserOffline,
  setInitialOnlineUsers,
  setTypingStatus,
  markConversationAsRead,
} from '../store/chatSlice';

export const useWebSocket = () => {
  const { user } = useAuthContext();
  const dispatch = useDispatch();
  const activeConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef<number>(1000);
  const activeConvIdRef = useRef<string | null>(activeConversationId);

  // Keep ref updated to avoid stale closures inside event listeners
  useEffect(() => {
    activeConvIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const connect = useCallback(() => {
    const token = user?.token || localStorage.getItem('token');
    if (!token) return;

    // Prevent duplicate connections if socket is already open or connecting
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5002';
    // Clean trailing slash
    const formattedBaseUrl = baseUrl.replace(/\/$/, '');
    const wsUrl = `${formattedBaseUrl}/ws?token=${encodeURIComponent(token)}`;

    console.log('[WS Hook] Connecting to:', formattedBaseUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS Hook] WebSocket connection established successfully');
      setIsConnected(true);
      reconnectDelayRef.current = 1000; // Reset exponential backoff
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { type, payload } = parsed;

        switch (type) {
          case 'connection_ack': {
            if (payload?.onlineUsers) {
              dispatch(setInitialOnlineUsers(payload.onlineUsers));
            }
            break;
          }

          case 'user_online': {
            if (payload?.userId) {
              dispatch(setUserOnline(payload.userId));
            }
            break;
          }

          case 'user_offline': {
            if (payload?.userId) {
              dispatch(setUserOffline(payload.userId));
            }
            break;
          }

          case 'receive_message': {
            const { message, conversationId } = payload || {};
            if (message && conversationId) {
              dispatch(addIncomingMessage({ conversationId, message }));

              // Trigger React Toastify notification if message is from another conversation
              if (activeConvIdRef.current !== conversationId) {
                const senderName =
                  message.sender?.studentProfile?.fullName ||
                  message.sender?.alumniProfile?.fullName ||
                  'New Connection';
                toast.info(`🔔 ${senderName}: ${message.message || 'Sent an attachment'}`, {
                  toastId: `msg-${message.id}`,
                });
              }
            }
            break;
          }

          case 'message_sent': {
            const { message, conversationId } = payload || {};
            if (message && conversationId) {
              dispatch(addIncomingMessage({ conversationId, message }));
            }
            break;
          }

          case 'typing_start': {
            if (payload?.conversationId) {
              dispatch(setTypingStatus({ conversationId: payload.conversationId, isTyping: true }));
            }
            break;
          }

          case 'typing_stop': {
            if (payload?.conversationId) {
              dispatch(setTypingStatus({ conversationId: payload.conversationId, isTyping: false }));
            }
            break;
          }

          case 'messages_read': {
            if (payload?.conversationId) {
              dispatch(markConversationAsRead(payload.conversationId));
            }
            break;
          }

          case 'error': {
            console.error('[WS Hook Error]', payload?.message);
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('[WS Hook] Failed to parse inbound WS message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log(`[WS Hook] Socket closed (code: ${event.code}). Scheduling reconnect...`);
      setIsConnected(false);
      wsRef.current = null;

      // Exponential Backoff Reconnection Strategy
      if (user?.token || localStorage.getItem('token')) {
        const nextDelay = reconnectDelayRef.current;
        console.log(`[WS Hook] Reconnecting in ${nextDelay}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
          connect();
        }, nextDelay);
      }
    };

    ws.onerror = (err) => {
      console.error('[WS Hook] Socket error:', err);
      ws.close();
    };
  }, [user, dispatch]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Outbound message helper functions
  const sendMessage = useCallback(
    (params: {
      receiverId: string;
      conversationId?: string;
      content: string;
      fileUrl?: string;
      fileType?: string;
      isResumeReview?: boolean;
    }) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'send_message',
            payload: params,
          })
        );
        return true;
      }
      return false;
    },
    []
  );

  const startTyping = useCallback((receiverId: string, conversationId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'typing_start',
          payload: { receiverId, conversationId },
        })
      );
    }
  }, []);

  const stopTyping = useCallback((receiverId: string, conversationId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'typing_stop',
          payload: { receiverId, conversationId },
        })
      );
    }
  }, []);

  const markAsRead = useCallback((conversationId: string, senderId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'mark_read',
          payload: { conversationId, senderId },
        })
      );
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
};
