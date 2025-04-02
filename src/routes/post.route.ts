import express from 'express';
import * as postsController from '../controllers/post.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', newAuthMiddleware, postsController.getmyposts); //neshouf law mehtaga me
//router.get('/me/unread-count', notificationAuthMiddleware, notificationsController.getUnreadCount);
//router.put('/:id/markasread', notificationsController.markNotificationAsRead);
//fadel push notifications
export default router;
