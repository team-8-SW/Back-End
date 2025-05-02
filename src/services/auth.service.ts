import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import {
	findUserByEmail,
	createUser,
	updateResetToken,
	findUserByResetToken,
	updatePassword,
	clearResetToken,
	findUserById,
	User,
} from '../models/user.model';
import { sendResetEmail, sendEmail } from '../utils/email';
import { knexInstance } from '../config/db';
//import { verifyRecaptcha } from '../utils/recaptcha';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginService = async (email: string, password: string): Promise<string> => {
	const user = await findUserByEmail(email);
	if (!user) {
		throw new Error('Invalid credentials');
	}

	const isMatch = await bcrypt.compare(password, user.passwordHash);
	if (!isMatch) {
		throw new Error('Invalid credentials');
	}

	const payload = { id: user.id, email: user.email };

	const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' }); // Generate a JWT token
	return token;
};

export const registerService = async (
	userName: string,
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	recaptchaToken: string,
	emailVerified: boolean,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
	verificationToken: string,
) => {
	//const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
	//if (!isRecaptchaValid) {
	// 	throw new Error('Invalid reCAPTCHA token');
	// }
	// const existingUser = await findUserByEmail(email.toLowerCase());
	// if (existingUser) {
	// 	throw new Error('Email is already registered');
	// }

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
		is_admin: false,
		verification_token: null,
	};

	const trx = await knexInstance.transaction();

	// const created = await createUser(newUser);

	// await knexInstance('user_profiles').insert({
	// 	id: uuidv4(),
	// 	user_id: newUser.id,
	// 	last_updated: knexInstance.fn.now(),
	// });

	// return {
	// 	id: created.id,
	// 	userName: created.userName,
	// 	email: created.email,
	// 	firstName: created.firstName,
	// 	lastName: created.lastName,
	// 	emailVerified: created.emailVerified,
	// 	verification_token: created.verification_token,
	// };

	try {
		const created = await createUser(newUser);

		await trx('user_profiles').insert({
			id: uuidv4(),
			user_id: created.id,
			last_updated: trx.fn.now(),
		});
		await knexInstance('user_privacy_settings').insert({
			id: uuidv4(),
			user_id: created.id,
			profile_visibility: 'public',
			show_email: false,
			allow_connection_requests: true,
			allow_messages_from_non_connections: false,
			show_active_status: true,
		});
		await trx.commit();

		return {
			id: created.id,
			userName: created.userName,
			email: created.email,
			firstName: created.firstName,
			lastName: created.lastName,
			emailVerified: created.emailVerified,
			verification_token: created.verification_token,
		};
	} catch (error) {
		await trx.rollback();
		throw error;
	}
};
//registerwithoutcaptchaService
export const registerwithoutcaptchaService = async (
	userName: string,
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	emailVerified: boolean,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
	verificationToken: string,
) => {
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
		is_admin: false,
		verification_token: null,
	};
	const trx = await knexInstance.transaction();

	try {
		const created = await createUser(newUser);

		await trx('user_profiles').insert({
			id: uuidv4(),
			user_id: created.id,
			last_updated: trx.fn.now(),
		});
		await knexInstance('user_privacy_settings').insert({
			id: uuidv4(),
			user_id: created.id,
			profile_visibility: 'public',
			show_email: false,
			allow_connection_requests: true,
			allow_messages_from_non_connections: false,
			show_active_status: true,
		});
		await trx.commit();

		return {
			id: created.id,
			userName: created.userName,
			email: created.email,
			firstName: created.firstName,
			lastName: created.lastName,
			emailVerified: created.emailVerified,
			verification_token: created.verification_token,
		};
	} catch (error) {
		await trx.rollback();
		throw error;
	}
};

export const forgotPasswordService = async (email: string): Promise<void> => {
	const user = await findUserByEmail(email);
	if (!user) {
		throw new Error('User not found');
	}

	const resetToken = uuidv4();
	const expiry = new Date();
	expiry.setHours(expiry.getHours() + 1); // Token valid for 1 hour

	await updateResetToken(user.id, resetToken, expiry);

	await sendResetEmail(user.email, resetToken);
};

export const resetPasswordRequestService = async (
	token: string,
	newPassword: string,
): Promise<void> => {
	const user = await findUserByResetToken(token);
	if (!user) {
		throw new Error('Invalid or expired reset token');
	}

	const hashedPassword = await bcrypt.hash(newPassword, 10);

	await updatePassword(user.id, hashedPassword);

	// for security, clear the reset token after password is reset
	await clearResetToken(user.id);
};

export const updatePasswordService = async (
	userId: string,
	currentPassword: string,
	newPassword: string,
): Promise<void> => {
	const user = await findUserById(userId);
	if (!user) {
		throw new Error('User not found');
	}

	const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
	if (!isMatch) {
		throw new Error('Incorrect current password');
	}

	const hashedNewPassword = await bcrypt.hash(newPassword, 10);

	await updatePassword(userId, hashedNewPassword);
};

export const socialLoginGoogleService = async (idToken: string): Promise<string> => {
	const ticket = await client.verifyIdToken({
		idToken,
		audience: process.env.GOOGLE_CLIENT_ID,
	});
	const payload = ticket.getPayload();

	if (!payload || !payload.email) {
		throw new Error('Invalid Google token');
	}

	const { email, name, sub } = payload;

	let user = await findUserByEmail(payload.email);

	if (!user) {
		// If user does not exist, create a new one
		const hashedPassword = await bcrypt.hash(sub, 10); // Hash Google ID as dummy password
		user = await createUser({
			id: uuidv4(),
			userName: name || email.split('@')[0],
			email,
			passwordHash: hashedPassword,
			firstName: name?.split(' ')[0] || '',
			lastName: name?.split(' ')[1] || '',
			emailVerified: true,
			isPremium: false,
			isActive: true,
			is_admin: false,
			googleId: sub,
		});
	}
	const trx = await knexInstance.transaction();
	try {
		const created = await createUser(user);

		await trx('user_profiles').insert({
			id: uuidv4(),
			user_id: created.id,
			last_updated: trx.fn.now(),
		});
		await knexInstance('user_privacy_settings').insert({
			id: uuidv4(),
			user_id: created.id,
			profile_visibility: 'public',
			show_email: false,
			allow_connection_requests: true,
			allow_messages_from_non_connections: false,
			show_active_status: true,
		});
		await trx.commit();

		const jwtToken = jwt.sign(
			{ id: user.id, email: user.email },
			process.env.JWT_SECRET as string,
			{
				expiresIn: '1h',
			},
		);
	
		return jwtToken;
	} catch (error) {
		await trx.rollback();
		throw error;
	}

	
};

//dev2
// export const sendVerificationService = async (
// 	email: string,
// ): Promise<void> => {
// 	try {
// 		const subject = 'Verify your email address';
// 		const html =  `<p>Please verify your email by clicking the link below:</p>
// 		<a href="http://localhost:3000/api/auth/verify-email?email=${email}">
// 		Verify Email</a>`;
// 		await sendEmail(email, )
// 	}
// };
