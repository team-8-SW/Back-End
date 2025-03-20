import express from 'express';
import * as notificationsController from '../controllers/notifications.controller';
// import upload from '../middleware/upload.middleware';

const router = express.Router();

router.get('/:user_id', notificationsController.getAllNotifications); //neshouf law mehtaga me
router.get('/unread-count/:user_id', notificationsController.getUnreadCount);
router.put('/read/:id', notificationsController.markNotificationAsRead);

export default router;
