import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('seeding blocked_users');
	try {
		await knex('blocked_users').del();
		console.log('Existing blocked_users deleted');
		const users = await knex('users').select('id');
		if (users.length === 0) {
			console.error('No users found. Please seed users first.');
			return;
		}
	const blockedusers = [];
		for (let i = 0; i < 10; i++) {
            const user1 = faker.helpers.arrayElement(users); // Randomly pick a user
            const user2 = faker.helpers.arrayElement(users); // Randomly pick a user
			blockedusers.push({
                id: uuidv4(),
                user_id: user1.id,
                blocked_user_id: user2.id,
            });
	}

		await knex('blocked_users').insert(blockedusers);
		console.log('Inserted blocked_users into the blocked_users table');

		console.log('blocked_users seeded successfully!');
	} catch (error) {
		console.error('Error seeding blocked_users:', error);
	}
}
