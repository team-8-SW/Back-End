import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding users...');

	try {
		await knex('users').del();
		console.log('Deleted existing users');

		const users = [];
		for (let i = 0; i < 10; i++) {
			const is_premium = faker.datatype.boolean();
			const reset_token_expiry = faker.datatype.boolean() ? faker.date.future() : null;
			const reset_token = reset_token_expiry ? faker.datatype.uuid() : null;
			const hashedPassword = await bcrypt.hash('password123', 10); // Set a default hashed password

			users.push({
				id: uuidv4(),
				user_name: faker.internet.userName(),
				email: faker.internet.email(),
				password_hash: hashedPassword, // Use the hashed password
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
				email_verified: faker.datatype.boolean(),
				is_premium: is_premium,
				premium_expiry: is_premium ? faker.date.future() : null,
				is_active: faker.datatype.boolean(),
				reset_token: reset_token,
				reset_token_expiry: reset_token_expiry,
				isadmin: faker.datatype.boolean(),
			});
		}

		await knex('users').insert(users);
		console.log('Inserted users into the users table');

		console.log('Users seeded successfully!');
	} catch (error) {
		console.error('Error seeding users:', error);
	}
}
