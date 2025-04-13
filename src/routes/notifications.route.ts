import express from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', newAuthMiddleware, notificationsController.getAllNotifications); 
router.get('/me/unread-count', newAuthMiddleware, notificationsController.getUnreadCount);
router.put('/me/:id/markasread', newAuthMiddleware, notificationsController.markNotificationAsRead);
export default router;
