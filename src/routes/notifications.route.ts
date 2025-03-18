import express from 'express';
import { NotificationController } from '../controllers/notifications.controller';
import { authMiddleware } from '../middleware/auth.middleware'; // Import auth middleware

const router = express.Router();

// Apply the base path and auth middleware
router.use('/api/notifications', authMiddleware);

// Get all notifications for the authenticated user
router.get('/', NotificationController.getNotifications);

// Get the count of unread notifications for the authenticated user
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark a specific notification as read
router.put('/:notificationId/read', NotificationController.markAsRead);

export default router;
