import express from 'express';
import { upload } from '../middleware/multer';
import { sendTextMessage, sendMediaMessage } from '../controllers/messaging.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/messages
router.post('/messages', authMiddleware, sendTextMessage);

// POST /api/messages/media
router.post('/messages/media', authMiddleware, upload.single('media'), sendMediaMessage);

export default router;
