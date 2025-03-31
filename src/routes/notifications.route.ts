import express from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import { notificationAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', notificationAuthMiddleware, notificationsController.getAllNotifications); //neshouf law mehtaga me
router.get('/me/unread-count', notificationAuthMiddleware, notificationsController.getUnreadCount);
router.put('/:id/markasread', notificationsController.markNotificationAsRead);
//fadel push notifications
export default router;
