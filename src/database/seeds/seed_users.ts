import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding users...');

	try {
		await knex('users').del();
		console.log('Deleted existing users');

		const users = [];
		for (let i = 0; i < 10; i++) {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const is_premium = faker.datatype.boolean();
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const reset_token_expiry = faker.datatype.boolean() ? faker.date.future() : null;
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const reset_token = reset_token_expiry ? faker.datatype.uuid() : null;
			// const hashedPassword = await bcrypt.hash('password123', 10); // Set a default hashed password
			const id = uuidv4();
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const verification_token = jwt.sign({ userId: id }, process.env.JWT_SECRET!, {
				expiresIn: '1h',
			});

			// 50% of users will have a Google ID (simulating Google login)
			const hasGoogleId = faker.datatype.boolean();
			const google_id = hasGoogleId ? faker.datatype.uuid() : null;

			//  FIX: Ensure password_hash is never NULL
			const hashedPassword = hasGoogleId
				? await bcrypt.hash('google_dummy_password', 10) // Dummy password for Google users
				: await bcrypt.hash('password123', 10); // Normal hashed password for regular users

			users.push({
				id: id,
				user_name: faker.internet.userName(),
				email: faker.internet.email(),
				password_hash: hashedPassword,
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
				email_verified: faker.datatype.boolean(),
				is_premium: is_premium,
				premium_expiry: is_premium ? faker.date.future() : null,
				is_active: faker.datatype.boolean(),
				reset_token: reset_token,
				reset_token_expiry: reset_token_expiry,
				is_admin: faker.datatype.boolean(),
				verification_token: null,
				google_id: google_id,
			});
		}

		await knex('users').insert(users);
		console.log('Inserted users into the users table');

		console.log('Users seeded successfully!');
	} catch (error) {
		console.error('Error seeding users:', error);
	}
}
