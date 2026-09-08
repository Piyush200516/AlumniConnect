import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse as parseUrl } from 'url';
import { verifyAccessToken, JwtPayloadData } from './utils/jwt';
import { prisma } from './lib/prisma';
import { logger } from './utils/logger';

export interface AuthenticatedWebSocket extends WebSocket {
  user?: JwtPayloadData;
  isAlive?: boolean;
  messageCount?: number;
  lastResetTime?: number;
}

// User connection registry: userId -> Set of WebSockets (supporting multiple tabs/devices)
const userSocketsMap = new Map<string, Set<AuthenticatedWebSocket>>();

let wss: WebSocketServer | null = null;

/**
 * Returns list of currently online user IDs
 */
export const getOnlineUserIds = (): string[] => {
  return Array.from(userSocketsMap.keys());
};

/**
 * Send event payload to a specific user across all their active socket connections
 */
export const sendWsToUser = (userId: string, payload: object): boolean => {
  const sockets = userSocketsMap.get(userId);
  if (!sockets || sockets.size === 0) return false;

  const data = JSON.stringify(payload);
  let sent = false;
  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      sent = true;
    }
  });
  return sent;
};

/**
 * Broadcast event payload to all connected clients (or optional filter)
 */
export const broadcastWs = (payload: object, excludeUserId?: string) => {
  const data = JSON.stringify(payload);
  userSocketsMap.forEach((sockets, userId) => {
    if (excludeUserId && userId === excludeUserId) return;
    sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  });
};

/**
 * Setup WebSocket Server attached to Express HTTP server instance
 */
export const setupWebSocketServer = (httpServer: HttpServer): WebSocketServer => {
  wss = new WebSocketServer({ noServer: true });

  // Handle HTTP upgrade requests manually for authentication & CORS checking
  httpServer.on('upgrade', (request, socket, head) => {
    try {
      const { pathname, query } = parseUrl(request.url || '', true);

      // Only upgrade ws path or root ws connection
      if (pathname !== '/ws' && pathname !== '/') {
        // Continue if path is not ws endpoint
      }

      // Extract token from query params or Authorization header or Sec-WebSocket-Protocol
      let token = query.token as string | undefined;
      if (!token && request.headers.authorization) {
        const authHeader = request.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.slice(7);
        } else {
          token = authHeader;
        }
      }

      // Also check sec-websocket-protocol if passed
      if (!token && request.headers['sec-websocket-protocol']) {
        token = request.headers['sec-websocket-protocol'].split(',')[0].trim();
      }

      if (!token) {
        logger.warn('[WS] Upgrade rejected: Token missing');
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const decoded = verifyAccessToken(token);

      wss?.handleUpgrade(request, socket, head, (ws) => {
        const authWs = ws as AuthenticatedWebSocket;
        authWs.user = decoded;
        authWs.isAlive = true;
        authWs.messageCount = 0;
        authWs.lastResetTime = Date.now();
        wss?.emit('connection', authWs, request);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Auth Error';
      logger.warn(`[WS] Upgrade rejected: ${msg}`);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  // Connection Handler
  wss.on('connection', async (ws: AuthenticatedWebSocket) => {
    const user = ws.user;
    if (!user || !user.userId) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const userId = user.userId;
    logger.info(`[WS] Client connected: userId=${userId} role=${user.role}`);

    // Track socket in Map
    let userSockets = userSocketsMap.get(userId);
    const isFirstConnection = !userSockets || userSockets.size === 0;

    if (!userSockets) {
      userSockets = new Set();
      userSocketsMap.set(userId, userSockets);
    }
    userSockets.add(ws);

    // Update database status & broadcast user_online if this is user's first connection
    if (isFirstConnection) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: true },
        });
      } catch (err) {
        logger.error(`[WS] Failed to update DB isOnline status for ${userId}: ${err}`);
      }

      broadcastWs({
        type: 'user_online',
        payload: { userId },
      }, userId);
    }

    // Send connection initialization payload to the client
    ws.send(
      JSON.stringify({
        type: 'connection_ack',
        payload: {
          userId,
          onlineUsers: getOnlineUserIds(),
        },
      })
    );

    // Setup Ping/Pong Heartbeat Listener
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Inbound Message Handling
    ws.on('message', async (data: Buffer) => {
      try {
        // Rate limiting check (max 10 messages per 5 seconds window)
        const now = Date.now();
        if (now - (ws.lastResetTime || 0) > 5000) {
          ws.messageCount = 0;
          ws.lastResetTime = now;
        }
        ws.messageCount = (ws.messageCount || 0) + 1;
        if (ws.messageCount > 10) {
          ws.send(
            JSON.stringify({
              type: 'error',
              payload: { message: 'Rate limit exceeded. Please wait before sending more messages.' },
            })
          );
          return;
        }

        const rawMessage = data.toString();
        const parsed = JSON.parse(rawMessage);
        const { type, payload } = parsed;

        if (!type) {
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid payload structure: missing type' } }));
          return;
        }

        switch (type) {
          case 'send_message': {
            const { receiverId, conversationId, content, fileUrl, fileType, isResumeReview } = payload || {};
            if (!receiverId || (!content && !fileUrl)) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  payload: { message: 'Missing recipient or content' },
                })
              );
              return;
            }

            // Sanitize content
            const sanitizedContent = String(content || '').trim();

            // Find mentorship connection / conversation
            const connection = await prisma.mentorshipConnection.findFirst({
              where: {
                OR: [
                  { studentId: userId, alumniId: receiverId },
                  { studentId: receiverId, alumniId: userId },
                ],
              },
              include: { conversation: true },
            });

            if (!connection) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  payload: { message: 'Mentorship connection not found' },
                })
              );
              return;
            }

            let targetConvId = conversationId || connection.conversation?.id;
            if (!targetConvId) {
              const conv = await prisma.conversation.create({
                data: { connectionId: connection.id },
              });
              targetConvId = conv.id;
            }

            // Persist message to PostgreSQL via Prisma
            const savedMessage = await prisma.message.create({
              data: {
                conversationId: targetConvId,
                senderId: userId,
                message: sanitizedContent,
                fileUrl: fileUrl || null,
                fileType: fileType || null,
                isResumeReview: isResumeReview || false,
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    email: true,
                    studentProfile: { select: { fullName: true, profileImage: true } },
                    alumniProfile: { select: { fullName: true, profileImageUrl: true } },
                  },
                },
              },
            });

            // Update conversation updatedAt
            await prisma.conversation.update({
              where: { id: targetConvId },
              data: { updatedAt: new Date() },
            });

            const eventData = {
              type: 'receive_message',
              payload: {
                message: savedMessage,
                conversationId: targetConvId,
              },
            };

            // Forward message to receiver if online
            sendWsToUser(receiverId, eventData);

            // Send confirmation back to sender
            ws.send(
              JSON.stringify({
                type: 'message_sent',
                payload: {
                  message: savedMessage,
                  conversationId: targetConvId,
                },
              })
            );
            break;
          }

          case 'typing_start': {
            const { receiverId, conversationId } = payload || {};
            if (receiverId) {
              sendWsToUser(receiverId, {
                type: 'typing_start',
                payload: { senderId: userId, conversationId },
              });
            }
            break;
          }

          case 'typing_stop': {
            const { receiverId, conversationId } = payload || {};
            if (receiverId) {
              sendWsToUser(receiverId, {
                type: 'typing_stop',
                payload: { senderId: userId, conversationId },
              });
            }
            break;
          }

          case 'mark_read': {
            const { conversationId, senderId } = payload || {};
            if (conversationId) {
              await prisma.message.updateMany({
                where: {
                  conversationId,
                  senderId: { not: userId },
                  isRead: false,
                },
                data: { isRead: true },
              });

              if (senderId) {
                sendWsToUser(senderId, {
                  type: 'messages_read',
                  payload: { conversationId, readerId: userId },
                });
              }
            }
            break;
          }

          case 'ping': {
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          }

          default:
            logger.warn(`[WS] Unknown message type: ${type}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to process message';
        logger.error(`[WS] Message handling error: ${msg}`);
        ws.send(
          JSON.stringify({
            type: 'error',
            payload: { message: msg },
          })
        );
      }
    });

    // Handle Disconnect
    ws.on('close', async () => {
      logger.info(`[WS] Client disconnected: userId=${userId}`);
      const sockets = userSocketsMap.get(userId);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
          userSocketsMap.delete(userId);

          // Update database: isOnline = false, lastSeen = now
          const lastSeen = new Date();
          try {
            await prisma.user.update({
              where: { id: userId },
              data: { isOnline: false, lastSeen },
            });
          } catch (err) {
            logger.error(`[WS] Failed to update offline status for ${userId}: ${err}`);
          }

          // Broadcast user_offline event to all remaining connected users
          broadcastWs({
            type: 'user_offline',
            payload: { userId, lastSeen: lastSeen.toISOString() },
          });
        }
      }
    });

    ws.on('error', (err) => {
      logger.error(`[WS] Socket error for user ${userId}: ${err.message}`);
    });
  });

  // Heartbeat interval to purge dead connections (every 30 seconds)
  const interval = setInterval(() => {
    wss?.clients.forEach((client) => {
      const authWs = client as AuthenticatedWebSocket;
      if (authWs.isAlive === false) {
        logger.warn(`[WS] Terminating unresponsive socket for user ${authWs.user?.userId}`);
        return authWs.terminate();
      }
      authWs.isAlive = false;
      authWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  logger.info('🚀 WebSocket Server initialized alongside HTTP server');
  return wss;
};
