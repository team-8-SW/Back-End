import request from 'supertest';
import { pool } from '../../src/config/db';

// We assume the server is already running on port 3000.
const baseURL = 'http://localhost:3000';

describe('POST /api/auth/login', () => {
	let testUserEmail: string;
	let testUserPassword: string;

	// Before all tests, get an existing user from the seeded data
	beforeAll(async () => {
		// Fetch a user from the database
		const user = await pool.query('SELECT email FROM users LIMIT 1');
		if (user.rows.length === 0) {
			throw new Error('No test users found in database. Run the seed first.');
		}

		testUserEmail = user.rows[0].email;
		testUserPassword = 'password123'; // The known password used in seed_users.ts
	});

	afterAll(async () => {
		await pool.end();
	});

	it('should return a token for valid credentials', async () => {
		const response = await request(baseURL)
			.post('/api/auth/login')
			.send({ email: testUserEmail, password: testUserPassword });

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('token');
	});

	it('should return error for invalid credentials', async () => {
		const response = await request(baseURL)
			.post('/api/auth/login')
			.send({ email: testUserEmail, password: 'wrongpassword' });

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty('message', 'Invalid credentials');
	});
});
