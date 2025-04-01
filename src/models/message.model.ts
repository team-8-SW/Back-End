import { v4 as uuidv4 } from 'uuid';
import knex from 'knex';
import { pool } from '../config/db';

const db = knex({
	client: 'pg',
	connection: pool.options,
});

export interface Message {
	id?: string;
	senderId: string;
	receiverId: string;
	content: string;
	mediaUrl?: string | null;
	mediaType?: 'image' | 'video' | 'document' | null;
	isRead?: boolean;
	sentAt?: Date;
	status?: 'sent' | 'delivered' | 'read';
}

export const createMessage = async (message: Message) => {
	const newMessage = {
		id: uuidv4(),
		sender_id: message.senderId,
		receiver_id: message.receiverId,
		content: message.content,
		media_url: null,
		media_type: null,
		is_read: false,
		status: 'sent',
	};

	const [inserted] = await db('messages').insert(newMessage).returning('*');

	return inserted;
};

// Add more functions later for fetching conversation, etc.
