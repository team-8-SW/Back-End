import { Request, Response } from 'express';
import { NotificationService } from '../services/notifications.service';

export const NotificationController = {
    // Get all notifications for a user
    async getNotifications(req: Request, res: Response) {
        try {
            const userId = req.user.id; // Assuming user ID is available in the request
            const notifications = await NotificationService.getNotifications(userId);
            res.status(200).json(notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error); // Log the error
            const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
            res.status(500).json({ message: 'Failed to fetch notifications', error: errorMessage });
        }
    },

    // Get the count of unread notifications for a user
    async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const unreadCount = await NotificationService.getUnreadCount(userId);
            res.status(200).json({ unreadCount });
        } catch (error) {
            console.error('Error fetching unread count:', error); // Log the error
            const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
            res.status(500).json({ message: 'Failed to fetch unread count', error: errorMessage });
        }
    },

    // Mark a notification as read
    async markAsRead(req: Request, res: Response) {
        try {
            const notificationId = req.params.notificationId;
            const notification = await NotificationService.markAsRead(notificationId);
            res.status(200).json({ message: 'Notification marked as read', notification });
        } catch (error) {
            console.error('Error marking notification as read:', error); // Log the error
            const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
            res.status(500).json({ message: 'Failed to mark notification as read', error: errorMessage });
        }
    },
};

//The controller layer is responsible for:

//Handling incoming HTTP requests.

//Extracting data from the request (e.g., request body, query parameters, URL parameters).

//Calling the appropriate service methods to perform business logic.

//Sending a response back to the client.