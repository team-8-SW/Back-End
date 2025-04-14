import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
	// First, delete existing entries to avoid duplicates
	await knex('users').del();

	// Create a test user
	const hashedPassword = await bcrypt.hash('testpass123', 10);

	// Insert the test user
	await knex('users').insert([
		{
			email: 'test@example.com',
			password: hashedPassword,
			firstName: 'Test',
			lastName: 'User',
			role: 'user',
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);
}
