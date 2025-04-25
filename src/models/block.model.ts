import knex from 'knex';
import { pool } from '../config/db';

const db = knex({
	client: 'pg',
	connection: pool.options,
});

export const isUserBlocked = async (senderId: string, receiverId: string): Promise<boolean> => {
	if (!senderId || !receiverId) return false;
	const result = await db('blockedusers')
		.where({ user_id: receiverId, blocked_user_id: senderId })
		.first();

	return !!result;
};
