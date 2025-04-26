import { getIO } from '../../websocket';
import { knexInstance } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const notifyUser = async (notfied_userId: string, notification: any, action_userid: any) => {
	const io = getIO();
	console.log(`Sending notification to user ${notfied_userId}:`, notification); // Log the notification details
	io.to(notfied_userId).emit('notification', notification); // Send notification to the user's room
	// Save the notification in the database
	await knexInstance('notifications').insert({
		id: uuidv4(),
		user_id: notfied_userId,
		type: notification.type,
		content: notification.content,
		post_id: notification.post_id || null,
		comment_id: notification.comment_id || null,
		action_userid: action_userid || null,
		is_read: false,
		created_at: new Date(),
	});
};