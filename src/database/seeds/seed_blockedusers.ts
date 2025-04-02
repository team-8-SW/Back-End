import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding blocked users...');

	// Clear existing blocked users
	await knex('blockedusers').del();

	// Fetch accepted connections
	const connections = await knex('connections')
		.where('status', 'accepted')
		.select('requester_id', 'receiver_id');

	if (connections.length < 2) {
		console.warn('Not enough accepted connections to simulate blocking.');
		return;
	}

	// Simulate blocking from both sides based on real connections
	const blockedData = [
		{
			id: uuidv4(),
			user_id: connections[0].receiver_id, // Receiver blocks requester
			blocked_user_id: connections[0].requester_id,
		},
		{
			id: uuidv4(),
			user_id: connections[1].requester_id, // Requester blocks receiver
			blocked_user_id: connections[1].receiver_id,
		},
	];

	await knex('blockedusers').insert(blockedData);
	console.log('Blocked users seeded successfully!');
}
