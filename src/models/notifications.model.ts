import { knex } from 'knex';
//Defines the Structure of the Data:
export interface Notification {
	id: string;
	user_id: string;
	type: string;
	content: string;
	is_read: boolean;
	unseen_count: number;
	created_at: Date;
}
//Perform Database Operations
export const Notifications = {
	// Get all notifications for a user
	async getByUserId(userId: string): Promise<Notification[]> {
		return knex('notifications').where({ user_id: userId }).select('*');
	}, // result -> array of Notification objects filtered le specific user

	// Mark a notification as read
	async markAsRead(notificationId: string): Promise<Notification> {
		return knex('notifications')
			.where({ id: notificationId })
			.update({ is_read: true })
			.returning('*')
			.then((rows) => rows[0]);
	},
	// Create a new notification
	async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
		return knex('notifications')
			.insert(notification)
			.returning('*')
			.then((rows) => rows[0]);
	},

	// Delete a notification
	async delete(notificationId: string): Promise<void> {
		return knex('notifications').where({ id: notificationId }).del();
	},
};
