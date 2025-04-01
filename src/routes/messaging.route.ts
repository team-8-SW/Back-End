import express from 'express';
import { sendTextMessage } from '../controllers/messaging.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/messages', authMiddleware, sendTextMessage);

export default router;
