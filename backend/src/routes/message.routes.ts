import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();
const controller = new MessageController();

router.use(authenticateUser as any);

router.get('/', controller.getConversations.bind(controller) as any);
router.post('/send', controller.sendMessage.bind(controller) as any);
router.patch('/:conversationId/read', controller.markAsRead.bind(controller) as any);
router.get('/:connectionId', controller.getMessages.bind(controller) as any);

export default router;
