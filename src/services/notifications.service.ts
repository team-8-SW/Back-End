import { Notifications, Notification } from '../models/notifications.model';

export const NotificationService = {
    // Get all notifications for a user
    async getNotifications(userId: string): Promise<Notification[]> {
        return Notifications.getByUserId(userId);
    },

    // Get the count of unread notifications for a user
    async getUnreadCount(userId: string): Promise<number> {
        return Notifications.getUnreadCount(userId);
    },

    // Mark a notification as read
    async markAsRead(notificationId: string): Promise<Notification> {
        return Notifications.markAsRead(notificationId);
    },

    // Create a new notification
    async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
        return Notifications.create(notification);
    },

    // Delete a notification
    async deleteNotification(notificationId: string): Promise<void> {
        return Notifications.delete(notificationId);
    },
};