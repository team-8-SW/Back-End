import knex from 'knex';
import { pool } from '../config/db';

const db = knex({
	client: 'pg',
	connection: pool.options,
});

export const isUserBlocked = async (senderId: string, receiverId: string): Promise<boolean> => {
	const result = await db('blocked_users')
		.where({ user_id: receiverId, blocked_user_id: senderId })
		.first();

	return !!result;
};
