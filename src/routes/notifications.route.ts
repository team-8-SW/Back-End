import express from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', newAuthMiddleware, notificationsController.getAllNotifications); //neshouf law mehtaga me
router.get('/me/unread-count', newAuthMiddleware, notificationsController.getUnreadCount);
router.put('/:id/markasread', notificationsController.markNotificationAsRead);
//fadel push notifications
export default router;
