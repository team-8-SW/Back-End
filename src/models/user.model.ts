import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db'; // Still using pg.Pool for connection

export interface User {
	id: string;
	userName: string;
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
	emailVerified: boolean;
	isPremium: boolean;
	isActive: boolean;
	isAdmin: boolean;
}

// Initialize Knex with existing PostgreSQL connection
const db = knex({
	client: 'pg',
	connection: pool.options, // Use the same pg.Pool connection
});

/**
 * Find user by email using Knex
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
	const user = await db('users')
		.select([
			'id',
			'user_name as userName',
			'email',
			'password_hash as passwordHash',
			'first_name as firstName',
			'last_name as lastName',
			'email_verified as emailVerified',
			'is_premium as isPremium',
			'is_active as isActive',
			'isadmin as isAdmin',
		])
		.where('email', email)
		.first(); // Get only one user

	return user || null;
};

/**
 * Create a new user using Knex
 */
export const createUser = async (user: User): Promise<User> => {
	const newUser = {
		id: uuidv4(),
		user_name: user.userName,
		email: user.email,
		password_hash: user.passwordHash,
		first_name: user.firstName,
		last_name: user.lastName,
		email_verified: user.emailVerified ?? false,
		is_premium: user.isPremium ?? false,
		is_active: user.isActive ?? true,
		isadmin: user.isAdmin ?? false,
	};

	const [createdUser] = await db('users')
		.insert(newUser)
		.returning([
			'id',
			'user_name as userName',
			'email',
			'password_hash as passwordHash',
			'first_name as firstName',
			'last_name as lastName',
			'email_verified as emailVerified',
			'is_premium as isPremium',
			'is_active as isActive',
			'isadmin as isAdmin',
		]);

	return createdUser;
};
