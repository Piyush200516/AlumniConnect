import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { MessageService } from '../services/message.service';
import { responseSuccess } from '../utils/response';
import { ApiError } from '../utils/error';
import { io } from '../socket';

const messageService = new MessageService();

export class MessageController {
  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const senderId = req.user.id;
      const message = await messageService.sendMessage(senderId, req.body);
      return responseSuccess(res, 'Message sent successfully', message);
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const senderId = req.user.id;
      const { connectionId } = req.params;
      const messages = await messageService.getMessages(senderId, connectionId as string);
      return responseSuccess(res, 'Messages fetched successfully', messages);
    } catch (err) {
      next(err);
    }
  }

  async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const userId = req.user.id;
      const conversations = await messageService.getConversations(userId);
      return responseSuccess(res, 'Conversations fetched successfully', conversations);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const userId = req.user.id;
      const { conversationId } = req.params;
      await messageService.markAsRead(userId, conversationId as string);
      
      // Emit socket notification to notify sender that messages are read
      io?.to(conversationId).emit('messages_read', { roomId: conversationId, userId });

      return responseSuccess(res, 'Messages marked as read successfully', null);
    } catch (err) {
      next(err);
    }
  }
}
