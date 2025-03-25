import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/user.model';
import { sendEmail } from '../utils/email';
import {
	loginService,
	registerService,
	forgotPasswordService,
	resetPasswordRequestService,
	updatePasswordService,
	socialLoginGoogleService,
} from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
// import { verifyRecaptcha } from '../utils/recaptcha';

dotenv.config();

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

export const register = async (req: Request, res: Response) => {
	try {
		const {
			userName,
			email,
			password,
			firstName,
			lastName,
			recaptchaToken,
			emailVerified,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			verification_token,
		} = req.body;

		// Verify reCAPTCHA before registering the user
		// const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
		// if (!isRecaptchaValid) {
		// 	return res.status(400).json({ message: 'reCAPTCHA verification failed' });
		// }

		// Now correctly pass six arguments to registerService
		const newUser = await registerService(
			userName,
			email,
			password,
			firstName,
			lastName,
			recaptchaToken,
			emailVerified,
			verification_token,
		);

		// Register the user (Fix: use `password_hash`)
		// const oldUser = await userModel.findUserByEmail(email); //dev2
		// if (oldUser) {
		// 	return res.json({ message: 'Email already in use' }); //dev2
		// }

		const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, {
			expiresIn: '1h',
		});
		await userModel.updateUser(newUser.id, { verification_token: token });
		const finalUser = await userModel.getUserById(newUser.id);
		const verficationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
		const emailBody = `
			<p>Hello ${firstName} ${lastName},</p>
			<p>Thank you for registering! Please click the link below to verify your account:</p>
			<a href="${verficationLink}" target="_blank" style="color: blue; text-decoration: underline;">
				Verify your account
			</a>
			<p>Best regards,</p>
			<p>Career Hub</p>
		`;
		await sendEmail(email, 'Verify your account', emailBody, true); //dev2
		console.log('Generated token:', token);
		return res.status(201).json({
			message: 'User registered successfully check your email for verification',
			user: newUser,
		});
	} catch (error: any) {
		return res.status(500).json({ message: error.message || 'User registration failed' });
	}
};

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

		await userModel.updateUser(user.id, { verification_token: token });

		const verficationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
		await sendEmail(
			email,
			'Resend: Verify your account',
			`Click here to verify ${verficationLink}`,
		);
		res.status(200).json({ message: 'Verification email resent successfully!' });
	} catch (error) {
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

//Email verfication dev2
export const verifyEmail = async (req: Request, res: Response) => {
	try {
		const token = req.body.token || req.query.token;

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

		const user = await userModel.getUserById(decoded.userId);

		if (!user) return res.status(404).json({ message: 'User not found' });

		if (user.email_verified) return res.status(400).json({ message: 'user verified' });

		if (user.verification_token !== token)
			return res.status(404).json({ message: 'Invalid Token' });

		await userModel.updateUser(decoded.userId, { email_verified: true });

		res.status(200).json({ message: 'Email verified successfully!' });
	} catch (error) {
		console.error('Error verifying email:', error);
		res.status(400).json({ message: 'Invalid or expired token' });
	}
};

export const updateUserName = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { userName } = req.body;

		if (!userName) {
			return res.status(400).json({ message: 'Username not found' });
		}

		const user = await userModel.getUserById(id);

		if (!user) return res.status(404).json({ message: 'Invalid user' });

		const updateUser = await userModel.updateUsername(id, userName);

		if (!updateUser || updateUser.length === 0) {
			return res.status(400).json({ message: 'Failed to update username' });
		}

		res.status(200).json({ message: 'Username updated successfully', user: updateUser[0] });
	} catch (error) {
		console.error('Error in updating username', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const updateEmail = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { email } = req.body;

		const user = await userModel.getUserById(id);
		if (!user) return res.status(404).json({ message: 'User not found' });

		const updateUser = await userModel.updateEmail(id, email);
		if (!updateUser || updateUser.length === 0)
			return res.status(400).json({ message: 'Failed to update email' });

		res.status(200).json({ message: 'Email updated successfully', user: updateUser[0] });
	} catch (error) {
		console.error('Error in updating email', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const deleteAccount = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const user = await userModel.getUserById(id);
		if (!user) return res.status(404).json({ message: 'Invalid user' });

		const deletedUser = await userModel.deleteUser(id);
		if (!deletedUser || deletedUser.length === 0)
			return res.status(404).json({ message: 'User not found' });

		res.status(200).json({ message: 'Account deleted successfully', user: deletedUser[0] });
	} catch (error) {
		console.error('Error in deleting account', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { token, newPassword } = req.body;

		await resetPasswordRequestService(token, newPassword);
		return res.status(200).json({ message: 'Password reset successfully' });
	} catch (error: any) {
		return res.status(400).json({ message: error.message || 'Failed to reset password' });
	}
};

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;

		await forgotPasswordService(email);
		return res.status(200).json({ message: 'Password reset email sent' });
	} catch (error: any) {
		return res.status(400).json({ message: error.message || 'Failed to send reset email' });
	}
};

/**
 * (Logged-In User)
 */
export const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const userId = req.user.id;
		const { currentPassword, newPassword } = req.body;

		await updatePasswordService(userId, currentPassword, newPassword);
		return res.status(200).json({ message: 'Password updated successfully' });
	} catch (error: any) {
		return res.status(400).json({ message: error.message || 'Failed to update password' });
	}
};

export const socialLoginGoogle = async (req: Request, res: Response) => {
	try {
		const { idToken } = req.body;

		const jwtToken = await socialLoginGoogleService(idToken);

		return res.status(200).json({
			message: 'Successfully authenticated with Google',
			accessToken: jwtToken,
		});
	} catch (error: any) {
		return res.status(400).json({ message: error.message || 'Google authentication failed' });
	}
};
