import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('seeding following');
	try {
		await knex('following').del();
		console.log('Existing following deleted');
		const users = await knex('users').select('id');
		if (users.length === 0) {
			console.error('No users found. Please seed users first.');
			return;
		}
		const following = [];
		for (let i = 0; i < 10; i++) {
			const user1 = faker.helpers.arrayElement(users); // Randomly pick a user
			const user2 = faker.helpers.arrayElement(users); // Randomly pick a user
			following.push({
				id: uuidv4(),
				follower_id: user1.id,
				followed_id: user2.id,
				created_at: faker.date.recent(30),
			});
		}

		await knex('following').insert(following);
		console.log('Inserted following into the following table');

		console.log('following seeded successfully!');
	} catch (error) {
		console.error('Error seeding following:', error);
	}
}
