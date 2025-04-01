import knex from 'knex';
import { pool } from '../config/db';

const db = knex({
	client: 'pg',
	connection: pool.options,
});

export const areUsersConnected = async (userId1: string, userId2: string): Promise<boolean> => {
	const result = await db('connections')
		.where(function () {
			this.where({ requester_id: userId1, receiver_id: userId2 }).orWhere({
				requester_id: userId2,
				receiver_id: userId1,
			});
		})
		.andWhere({ status: 'accepted' })
		.first();

	return !!result;
};
