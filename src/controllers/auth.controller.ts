import { Request, Response } from 'express';
import axios from 'axios';
import { loginService, registerService } from '../services/auth.service';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/user.model';

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
		const { userName, email, password, firstName, lastName, recaptchaToken } = req.body;

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
		const newUser = await registerService(userName, email, password, firstName, lastName);
		const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, {
			expiresIn: '1h',
		});
		console.log('Generated token:', token);
		return res.status(201).json({ message: 'User registered successfully', user: newUser });
	} catch (error: any) {
		return res.status(500).json({ message: error.message || 'User registration failed' });
	}
};

//Email verfication
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
