import { Request, Response } from 'express';
import * as notificationService from '../services/notifications.service';

export const getAllNotifications = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id;
        console.log('User ID in controller:', user_id);

        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        console.log('Fetching notifications for user_id:', user_id);
        const notifications = await notificationService.getAllNotifications(user_id);
        console.log('Fetched notifications:', notifications);

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Failed to fetch notifications', error: errorMessage });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
	try {
		const user_id = (req as any).user?.user_id;
		const unreadCount = await notificationService.getUnreadNotificationCount(user_id);
		res.status(200).json({ unreadCount });
	} catch (error) {
		console.error('Error fetching unread count:', error); // Log the error
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		res.status(500).json({ message: 'Failed to fetch unread count', error: errorMessage });
	}
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
	try {
		const id = req.params.id; // Extract id from URL parameters
        console.log('Notification ID:', id);
		const notification = await notificationService.markNotificationAsRead(id);
		res.status(200).json({ message: 'Notification marked as read', notification });
	} catch (error) {
		console.error('Error marking notification as read:', error); // Log the error
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		res.status(500).json({
			message: 'Failed to mark notification as read',
			error: errorMessage,
		});
	}
};

//The controller layer is responsible for:

//Handling incoming HTTP requests.

//Extracting data from the request (e.g., request body, query parameters, URL parameters).

//Calling the appropriate service methods to perform business logic.

//Sending a response back to the client.
