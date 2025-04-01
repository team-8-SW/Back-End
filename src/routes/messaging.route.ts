import express from 'express';
import { upload } from '../middleware/multer';
import {
	sendTextMessage,
	sendMediaMessage,
	getConversationWithUser,
	getConversations,
	getUnreadCount,
} from '../controllers/messaging.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/messages
router.post('/messages', authMiddleware, sendTextMessage);

// POST /api/messages/media
router.post('/messages/media', authMiddleware, upload.single('media'), sendMediaMessage);

// GET /api/conversations
router.get('/conversations', authMiddleware, getConversations);

// GET /api/conversations/users/{userId}
router.get('/conversations/users/:userId', authMiddleware, getConversationWithUser);

// GET /api/conversations/unread-count
router.get('/conversations/unread-count', authMiddleware, getUnreadCount);

export default router;
