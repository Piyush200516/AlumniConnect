import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { uploadAttachment } from '../middleware/upload';

const router = Router();
const controller = new MessageController();

router.use(authenticateUser as any);

router.get('/', controller.getConversations.bind(controller) as any);
router.post('/send', uploadAttachment.single('attachment') as any, controller.sendMessage.bind(controller) as any);
// IMPORTANT: specific routes MUST come before wildcard /:connectionId
router.patch('/:conversationId/read', controller.markAsRead.bind(controller) as any);
router.get('/:connectionId', controller.getMessages.bind(controller) as any);

export default router;
