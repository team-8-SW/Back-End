import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db'; // Still using pg.Pool for connection
import bcrypt from 'bcrypt';

// eslint-disable-next-line @typescript-eslint/naming-convention
const SALT_ROUNDS = 10;
// import pool from '../config/db';

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
	verification_token?: string | null;
	googleId?: string | null;
	resetToken?: string | null;
	resetTokenExpiry?: Date | null;
}

const db = knex({
	client: 'pg',
	connection: pool.options,
});

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
			'verification_token',
			'reset_token as resetToken',
			'reset_token_expiry as resetTokenExpiry',
			'google_id as googleId',
		])
		.where('email', email)
		.first();

	return user || null;
};

export const findUserByGoogleId = async (googleId: string): Promise<User | null> => {
	const user = await db('users')
		.select([
			'id',
			'user_name as userName',
			'email',
			'first_name as firstName',
			'last_name as lastName',
			'email_verified as emailVerified',
			'is_premium as isPremium',
			'is_active as isActive',
			'isadmin as isAdmin',
			'google_id as googleId',
		])
		.where('google_id', googleId)
		.first();

	return user || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
	const user = await db('users')
		.select(['id', 'user_name as userName', 'email', 'password_hash as passwordHash'])
		.where('id', id)
		.first();

	return user || null;
};

export const createUser = async (user: User): Promise<User> => {
	const newUser = {
		id: uuidv4(),
		user_name: user.userName || user.email.split('@')[0],
		email: user.email,
		password_hash: user.passwordHash || '',
		first_name: user.firstName || '',
		last_name: user.lastName || '',
		email_verified: user.emailVerified ?? false,
		is_premium: user.isPremium ?? false,
		is_active: user.isActive ?? true,
		isadmin: user.isAdmin ?? false,
		verification_token: user.verification_token ?? null,
		google_id: user.googleId || null,
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
			'verification_token',
			'google_id as googleId',
		]);

	return createdUser;
};

export const updateUser = async (
	userId: string,
	updates: Partial<{
		first_name: string;
		last_name: string;
		email: string;
		password: string;
		email_verified: boolean;
		verification_token: string | null;
	}>,
) => {
	const updateData: any = { ...updates };

	// ✅ Hash password if updating it
	if (updates.password) {
		updateData.password_hash = await bcrypt.hash(updates.password, SALT_ROUNDS);
		delete updateData.password; // Remove plain text password
	}

	return db('users').where({ id: userId }).update(updateData).returning('*');
};

export const getUserById = async (userId: string) => {
	return db('users').where({ id: userId }).first();
};

export const updateUsername = async (userId: string, userName: string) => {
	return db('users')
		.where({ id: userId })
		.update({ user_name: userName })
		.returning(['user_name as userName', 'id']);
};

export const updateEmail = async (userId: string, email: string) => {
	return db('users').where({ id: userId }).update({ email: email }).returning(['email', 'id']);
};

export const deleteUser = async (userId: string) => {
	return db('users').where({ id: userId }).del().returning(['email', 'id']);
};

export const createOrUpdateGoogleUser = async (
	googleId: string,
	email: string,
	firstName?: string,
	lastName?: string,
): Promise<User> => {
	const existingUser = await findUserByGoogleId(googleId);

	if (existingUser) {
		// Update existing Google user
		await db('users').where('google_id', googleId).update({
			email,
			first_name: firstName,
			last_name: lastName,
		});

		// Return updated user
		return (await findUserByGoogleId(googleId)) as User;
	}

	// If user does not exist, create new Google user
	const newUser = {
		id: uuidv4(),
		email,
		google_id: googleId,
		first_name: firstName,
		last_name: lastName,
		email_verified: true, // Google-registered users are already verified
		is_premium: false,
		is_active: true,
		isadmin: false,
	};

	const [createdUser] = await db('users')
		.insert(newUser)
		.returning([
			'id',
			'email',
			'first_name as firstName',
			'last_name as lastName',
			'google_id as googleId',
			'profile_picture as profilePicture',
		]);

	return createdUser;
};

/**
 * FOR FORGOT PASSWORD
 */
export const updateResetToken = async (
	userId: string,
	token: string,
	expiry: Date,
): Promise<void> => {
	await db('users').where('id', userId).update({
		reset_token: token,
		reset_token_expiry: expiry,
	});
};

/**
 * FOR RESET PASSWORD
 */
export const findUserByResetToken = async (token: string): Promise<User | null> => {
	const user = await db('users')
		.select([
			'id',
			'user_name as userName',
			'email',
			'password_hash as passwordHash',
			'reset_token as resetToken',
			'reset_token_expiry as resetTokenExpiry',
		])
		.where('reset_token', token)
		.andWhere('reset_token_expiry', '>', new Date()) // Ensure token is still valid
		.first();

	return user || null;
};

/**
 * FOR RESET PASSWORD
 */
export const updatePassword = async (userId: string, newPasswordHash: string): Promise<void> => {
	await db('users').where('id', userId).update({ password_hash: newPasswordHash });
};

export const clearResetToken = async (userId: string): Promise<void> => {
	await db('users').where('id', userId).update({
		reset_token: null,
		reset_token_expiry: null,
	});
};
