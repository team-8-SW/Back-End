import { knexInstance } from '../config/db';
import { notifications } from '../models/notifications.model';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const getAllNotifications = async (user_id: string): Promise<notifications[]> => {
	try {
		const notifications = await knexInstance('notifications').where({ user_id }).select('*');
		return notifications;
	} catch (error) {
		console.error(`Error fetching notifications for user ${user_id}:`, error);
		throw new Error('Failed to fetch notifications');
	}
};

export const markNotificationAsRead = async (id: string): Promise<notifications> => {
	try {
		const [updatedNotification] = await knexInstance('notifications')
			.where({ id })
			.update({ is_read: true })
			.returning('*');

		if (!updatedNotification) {
			throw new Error(`Notification with ID ${id} not found`);
		}

		return updatedNotification;
	} catch (error) {
		console.error(`Error marking notification ${id} as read:`, error);
		throw new Error('Failed to mark notification as read');
	}
};

export const createNotification = async (
	notification: Omit<notifications, 'id' | 'created_at'>,
): Promise<notifications> => {
	try {
		const [createdNotification] = await knexInstance('notifications')
			.insert(notification)
			.returning('*');

		if (!createdNotification) {
			throw new Error('Failed to create notification');
		}

		return createdNotification;
	} catch (error) {
		console.error('Error creating notification:', error);
		throw new Error('Failed to create notification');
	}
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
	try {
		const deletedCount = await knexInstance('notifications')
			.where({ id: notificationId })
			.del();

		if (deletedCount === 0) {
			throw new Error(`Notification with ID ${notificationId} not found`);
		}
	} catch (error) {
		console.error(`Error deleting notification ${notificationId}:`, error);
		throw new Error('Failed to delete notification');
	}
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const getUnreadNotificationCount = async (user_id: string): Promise<number> => {
	try {
		const result = await knexInstance('notifications')
			.where({ user_id, is_read: false })
			.count('* as unreadCount')
			.first();

		if (!result) {
			throw new Error('Failed to fetch unread notification count');
		}

		return Number(result.unreadCount);
	} catch (error) {
		console.error(`Error fetching unread notification count for user ${user_id}:`, error);
		throw new Error('Failed to fetch unread notification count');
	}
};
