import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding connections...');

	try {
		await knex('connections').del();
		console.log('Deleted existing connections');

		const users = await knex('users').select('id');
		const connections = [];

		if (users.length < 2) {
			console.warn('Not enough users to create connections.');
			return;
		}

		// Create 10 random connections
		for (let i = 0; i < 10; i++) {
			const requester = faker.helpers.arrayElement(users).id;
			let receiver = faker.helpers.arrayElement(users).id;

			// Ensure requester and receiver are not the same
			while (receiver === requester) {
				receiver = faker.helpers.arrayElement(users).id;
			}

			connections.push({
				id: uuidv4(),
				requester_id: requester,
				receiver_id: receiver,
				status: faker.helpers.arrayElement(['accepted', 'pending', 'declined']),
				created_at: faker.date.recent(),
			});
		}

		await knex('connections').insert(connections);
		console.log('Connections seeded successfully!');
	} catch (error) {
		console.error('Error seeding connections:', error);
	}
}
