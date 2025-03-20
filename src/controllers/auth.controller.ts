import { Request, Response } from 'express';
import axios from 'axios';
import { loginService, registerService } from '../services/auth.service';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/user.model';
import { sendEmail } from '../utils/email';

dotenv.config();

/**
 * Login Controller
 */
export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		// Authenticate the user and generate a JWT token.
		const token = await loginService(email, password);
		return res.status(200).json({ token });
	} catch (error: any) {
		return res.status(401).json({ message: error.message || 'Login failed' });
	}
};

/**
 * Register User Controller (with Google reCAPTCHA)
 */
export const register = async (req: Request, res: Response) => {
	try {
		const { userName, email, password, firstName, lastName, recaptchaToken, emailVerified } =
			req.body;

		// Verify Google reCAPTCHA
		// const verifyRecaptcha = await axios.post(
		// 	`https://www.google.com/recaptcha/api/siteverify`,
		// 	null,
		// 	{
		// 		params: {
		// 			secret: process.env.RECAPTCHA_SECRET_KEY,
		// 			response: recaptchaToken,
		// 		},
		// 	}
		// );

		// if (!verifyRecaptcha.data.success) {
		// 	return res.status(400).json({ message: 'reCAPTCHA verification failed' });
		// }

		// Register the user (Fix: use `password_hash`)
		const oldUser = await userModel.findUserByEmail(email); //dev2
		if (oldUser) {
			res.json({ message: 'Email already in use' }); //dev2
		}

		const newUser = await registerService(
			userName,
			email,
			password,
			firstName,
			lastName,
			emailVerified,
		);
		const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, {
			expiresIn: '1h',
		});
		const verficationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
		await sendEmail(email, 'Verify your account', `Click here to verify ${verficationLink}`); //dev2
		console.log('Generated token:', token);
		return res.status(201).json({
			message: 'User registered successfully check your email for verification',
			user: newUser,
		});
	} catch (error: any) {
		return res.status(500).json({ message: error.message || 'User registration failed' });
	}
};
//dev2
export const resendVerificationEmail = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;

		const user = await userModel.findUserByEmail(email);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (user?.emailVerified) {
			return res.status(400).json({ message: 'Email already verified' });
		}

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: '1h',
		});
		console.log(`Generated token: ${token}`);
		const verficationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
		await sendEmail(
			email,
			'Resend: Verify your account',
			`Click here to verify ${verficationLink}`,
		);
		res.json({ message: 'Verification email resent successfully!' });
	} catch (error) {
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

//Email verfication dev2
export const verifyEmail = async (req: Request, res: Response) => {
	try {
		const { token } = req.body;

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

		await userModel.updateUser(decoded.userId, { email_verified: true });

		res.json({ message: 'Email verified successfully!' });
	} catch (error) {
		console.error('Error verifying email:', error);
		res.status(400).json({ message: 'Invalid or expired token' });
	}
};
