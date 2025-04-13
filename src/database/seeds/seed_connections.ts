import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('seeding connections');
	try {
		await knex('connections').del();
		console.log('Existing connections deleted');
		const users = await knex('users').select('id');
		if (users.length === 0) {
			console.error('No users found. Please seed users first.');
			return;
		}
	const connections = [];
		for (let i = 0; i < 10; i++) {
            const user1 = faker.helpers.arrayElement(users); // Randomly pick a user
            const user2 = faker.helpers.arrayElement(users); // Randomly pick a user
			connections.push({
                id: uuidv4(),
                requester_id: user1.id,
                receiver_id: user2.id,
                status: faker.helpers.arrayElement(['pending', 'accepted', 'declined']),
                created_at: faker.date.recent(30)
			});
	}

		await knex('connections').insert(connections);
		console.log('Inserted connections into the connections table');

		console.log('Connections seeded successfully!');
	} catch (error) {
		console.error('Error seeding connections:', error);
	}
}
