import express from 'express';
import { upload } from '../middleware/multer';
import {
	sendTextMessage,
	sendMediaMessage,
	getConversationWithUser,
	getConversations,
	getUnreadCount,
	markConversationRead,
	markConversationUnread,
	getLastMessageReadStatusController,
	postTypingIndicator,
	getTypingIndicator,
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

// PUT /api/conversations/{userId}/read
router.put('/conversations/:userId/read', authMiddleware, markConversationRead);

// PUT /api/conversations/{userId}/unread
router.put('/conversations/:userId/unread', authMiddleware, markConversationUnread);

// GET /api/conversations/{userId}/read-status
router.get(
	'/conversations/:userId/read-status',
	authMiddleware,
	getLastMessageReadStatusController,
);

// POST /api/messages/typing-indicators
router.post('/messages/typing-indicators', authMiddleware, postTypingIndicator);

// GET /api/messages/typing-indicators
router.get('/messages/typing-indicators', authMiddleware, getTypingIndicator);

export default router;
