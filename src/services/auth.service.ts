import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { findUserByEmail, createUser, User } from '../models/user.model';

/**
 * Login Service
 */
export const loginService = async (email: string, password: string): Promise<string> => {
	// Retrieve user from the database.
	const user = await findUserByEmail(email);
	if (!user) {
		throw new Error('Invalid credentials');
	}

	// Compare the provided password with the hashed password.
	const isMatch = await bcrypt.compare(password, user.passwordHash);
	if (!isMatch) {
		throw new Error('Invalid credentials');
	}

	// Define the token payload.
	const payload = { id: user.id, email: user.email };

	// Generate a JWT token (ensure JWT_SECRET is set in your .env file).
	const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
	return token;
};

/**
 * Register User Service
 */
export const registerService = async (
	userName: string,
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	emailVerified: boolean,
) => {
	// Check if email already exists
	const existingUser = await findUserByEmail(email);
	if (existingUser) {
		throw new Error('Email is already registered');
	}

	// Hash the password
	const passwordHash = await bcrypt.hash(password, 10);

	const newUser: User = {
		id: uuidv4(),
		userName,
		email,
		passwordHash,
		firstName,
		lastName,
		emailVerified: false,
		isPremium: false,
		isActive: true,
		isAdmin: false,
	};

	const created = await createUser(newUser);
	// Return user without the passwordHash if you prefer
	return {
		id: created.id,
		userName: created.userName,
		email: created.email,
		firstName: created.firstName,
		lastName: created.lastName,
		emailVerified: created.emailVerified,
	};
};
