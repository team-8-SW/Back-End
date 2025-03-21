import {
	loginService,
	registerService,
	forgotPasswordService,
	resetPasswordRequestService,
	updatePasswordService,
	socialLoginGoogleService,
} from '../../src/services/auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
	findUserByEmail,
	findUserById,
	createUser,
	updateResetToken,
	findUserByResetToken,
	updatePassword,
	clearResetToken,
} from '../../src/models/user.model';
import { sendResetEmail, sendEmail } from '../../src/utils/email';
import { OAuth2Client } from 'google-auth-library';
import * as authController from '../controllers/auth.controller';
import * as userModel from '../models/user.model';
import { Request, Response } from 'express';

jest.mock('../../src/models/user.model', () => ({
	updateUser: jest.fn(),
	getUserById: jest.fn(),
	updateUsername: jest.fn(),
	deleteUser: jest.fn(),
	updateEmail: jest.fn(),
	createUser: jest.fn(),
	findUserByEmail: jest.fn(),
}));
jest.mock('../../src/utils/email', () => ({
	sendEmail: jest.fn(),
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken', () => ({
	sign: jest.fn(() => 'mockedJwtToken'),
}));
jest.mock('../../src/utils/recaptcha', () => ({
	verifyRecaptcha: jest.fn().mockImplementation((token) => {
		return token === 'validRecaptchaToken'; // Returns true if token is valid
	}),
}));
jest.mock('google-auth-library', () => ({
	OAuth2Client: jest.fn().mockImplementation(() => ({
		verifyIdToken: jest.fn().mockImplementation(({ idToken }) => {
			if (idToken === 'invalidToken') {
				throw new Error('Invalid Google token'); // Simulate rejection for invalid tokens
			}
			return {
				getPayload: () => ({
					email: 'test@example.com',
					name: 'John Doe',
					sub: 'google123',
				}),
			};
		}),
	})),
}));
jest.mock('../../src/config/db', () => ({
	pool: {
		query: jest.fn(), // Mock SQL queries
		connect: jest.fn().mockResolvedValue({
			release: jest.fn(),
		}),
		end: jest.fn(),
	},
	knexInstance: {
		select: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		first: jest.fn().mockResolvedValue(null),
		insert: jest.fn().mockResolvedValue([1]),
		update: jest.fn().mockResolvedValue(1),
	},
}));

const mockVerifyRecaptcha = jest.fn().mockImplementation((token) => {
	if (token === 'validRecaptchaToken') return true;
	return false; // Simulate invalid reCAPTCHA token
});

describe('Authentication Services - Unit Tests', () => {
	const mockUser = {
		id: '123',
		userName: 'testuser',
		email: 'test@example.com',
		passwordHash: '$2b$10$hashedPassword',
		firstName: 'John',
		lastName: 'Doe',
		emailVerified: true,
		googleId: null,
	};

	const jwtToken = 'mockedJwtToken';

	beforeEach(() => {
		jest.clearAllMocks(); // Reset mocks before each test
	});

	// LOGIN SERVICE TESTS
	describe('loginService', () => {
		it('should return a JWT token for valid credentials', async () => {
			(findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			(jwt.sign as jest.Mock).mockReturnValue(jwtToken);

			const token = await loginService(mockUser.email, 'password123');
			expect(token).toBe(jwtToken);
		});

		it('should throw an error for invalid credentials', async () => {
			(findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(loginService(mockUser.email, 'wrongpassword')).rejects.toThrow(
				'Invalid credentials',
			);
		});
	});

	// REGISTER SERVICE TESTS (WITH MOCKED reCAPTCHA)
	describe('registerService', () => {
		it('should register a new user when reCAPTCHA is valid', async () => {
			(findUserByEmail as jest.Mock).mockResolvedValue(null);
			(createUser as jest.Mock).mockResolvedValue({
				...mockUser,
				email: 'new@example.com',
				emailVerified: false,
				verification_token: 'mockVerificationToken',
			});

			// Simulate successful reCAPTCHA validation
			const isRecaptchaValid = mockVerifyRecaptcha('validRecaptchaToken');
			expect(isRecaptchaValid).toBe(true);

			const user = await registerService(
				'newuser',
				'new@example.com',
				'password123',
				'New',
				'User',
				'validRecaptchaToken',
				false,
				'mockVerificationToken',
			);
			expect(user).toHaveProperty('email', 'new@example.com');
			expect(user).toHaveProperty('emailVerified', false);
			expect(user).toHaveProperty('verification_token', 'mockVerificationToken');
		});

		it('should throw an error if reCAPTCHA is invalid', async () => {
			// Simulate failed reCAPTCHA validation
			const isRecaptchaValid = mockVerifyRecaptcha('invalidRecaptchaToken');
			expect(isRecaptchaValid).toBe(false);

			await expect(
				registerService(
					'newuser',
					'new@example.com',
					'password123',
					'New',
					'User',
					'invalidRecaptchaToken',
					false,
					'mockVerificationToken',
				),
			).rejects.toThrow('Invalid reCAPTCHA');
		});
	});

	// PASSWORD RESET REQUEST SERVICE TESTS
	describe('forgotPasswordService', () => {
		it('should generate and save a reset token', async () => {
			(findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
			(updateResetToken as jest.Mock).mockResolvedValue(undefined);
			(sendResetEmail as jest.Mock).mockResolvedValue(undefined);

			await expect(forgotPasswordService(mockUser.email)).resolves.not.toThrow();
		});

		it('should throw an error if email is not found', async () => {
			(findUserByEmail as jest.Mock).mockResolvedValue(null);

			await expect(forgotPasswordService('notfound@example.com')).rejects.toThrow(
				'User not found',
			);
		});
	});

	// RESET PASSWORD SERVICE TESTS
	describe('resetPasswordRequestService', () => {
		it('should reset password using a valid reset token', async () => {
			(findUserByResetToken as jest.Mock).mockResolvedValue(mockUser);
			(updatePassword as jest.Mock).mockResolvedValue(undefined);
			(clearResetToken as jest.Mock).mockResolvedValue(undefined);

			await expect(
				resetPasswordRequestService('validToken', 'newpassword123'),
			).resolves.not.toThrow();
		});

		it('should throw an error for invalid or expired token', async () => {
			(findUserByResetToken as jest.Mock).mockResolvedValue(null);

			await expect(
				resetPasswordRequestService('invalidToken', 'newpassword123'),
			).rejects.toThrow('Invalid or expired reset token');
		});
	});

	// UPDATE PASSWORD SERVICE TESTS
	describe('updatePasswordService', () => {
		it('should update password for logged-in user', async () => {
			(findUserById as jest.Mock).mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			(updatePassword as jest.Mock).mockResolvedValue(undefined);

			await expect(
				updatePasswordService(mockUser.id, 'password123', 'newPassword456'),
			).resolves.not.toThrow();
		});

		it('should throw an error if the current password is incorrect', async () => {
			(findUserById as jest.Mock).mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(
				updatePasswordService(mockUser.id, 'wrongpassword', 'newPassword456'),
			).rejects.toThrow('Incorrect current password');
		});
	});

	// GOOGLE SOCIAL LOGIN SERVICE TESTS
	describe('socialLoginGoogleService', () => {
		it('should return a JWT for an existing Google user', async () => {
			const googleUser = { ...mockUser, googleId: 'google123' };
			(findUserByEmail as jest.Mock).mockResolvedValue(googleUser);
			(jwt.sign as jest.Mock).mockReturnValue(jwtToken);

			const token = await socialLoginGoogleService('validGoogleToken');
			expect(token).toBe(jwtToken);
		});

		it('should create and return a JWT for a new Google user', async () => {
			(findUserByEmail as jest.Mock).mockResolvedValue(null);
			(createUser as jest.Mock).mockResolvedValue(mockUser);
			(jwt.sign as jest.Mock).mockReturnValue(jwtToken);

			const token = await socialLoginGoogleService('validGoogleToken');
			expect(token).toBe(jwtToken);
		});

		it('should throw an error if the Google ID token is invalid', async () => {
			await expect(socialLoginGoogleService('invalidToken')).rejects.toThrow(
				'Invalid Google token',
			);
		});
	});
});

//dev2
describe('DELETE /api/auth/delete-account/:id', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		req = { params: { id: 'mockedUserId' } };
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnThis();
		res = { status: statusMock, json: jsonMock };
	});

	it('should delete the user and return success message', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedUserId',
			email: 'test@example.com',
		});
		(userModel.deleteUser as jest.Mock).mockResolvedValue([
			{ id: 'mockedUserId', email: 'test@example.com' },
		]);

		await authController.deleteAccount(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedUserId');
		expect(userModel.deleteUser).toHaveBeenCalledTimes(1);
		expect(userModel.deleteUser).toHaveBeenCalledWith('mockedUserId');

		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Account deleted successfully',
			user: { id: 'mockedUserId', email: 'test@example.com' },
		});
	});

	it('should return 404 if user is not found', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue(null);

		await authController.deleteAccount(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedUserId');

		expect(userModel.deleteUser).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid user' });
	});

	it('should return 404 if deletion fails', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedUserId',
			email: 'test@example.com',
		});
		(userModel.deleteUser as jest.Mock).mockResolvedValue([]);

		await authController.deleteAccount(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedUserId');
		expect(userModel.deleteUser).toHaveBeenCalledTimes(1);
		expect(userModel.deleteUser).toHaveBeenCalledWith('mockedUserId');

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'User not found' });
	});

	it('should return 500 if an error occurs', async () => {
		(userModel.getUserById as jest.Mock).mockRejectedValue(new Error('Database error'));

		await authController.deleteAccount(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedUserId');

		expect(userModel.deleteUser).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
	});
});

describe('PUT /api/auth/:id/username', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		req = {
			params: { id: 'mockedId' },
			body: { userName: 'newUserName' },
		};
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnThis();
		res = { status: statusMock, json: jsonMock };
	});

	it('should update userName and return success', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedId',
			email: 'test@example.com',
			userName: 'oldUserName',
		});

		(userModel.updateUsername as jest.Mock).mockResolvedValue([
			{
				id: 'mockedId',
				email: 'test@example.com',
				user_name: 'newUserName',
			},
		]);

		await authController.updateUserName(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedId');
		expect(userModel.updateUsername).toHaveBeenCalledTimes(1);
		expect(userModel.updateUsername).toHaveBeenCalledWith('mockedId', 'newUserName');

		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Username updated successfully',
			user: { id: 'mockedId', email: 'test@example.com', user_name: 'newUserName' },
		});
	});

	it('should return 404 if user Not found', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue(null);

		await authController.updateUserName(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedId');
		expect(userModel.updateUsername).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Invalid user',
		});
	});

	it('should return 400 if failed to update username', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedId',
			email: 'test@example.com',
			userName: 'oldUserName',
		});

		(userModel.updateUsername as jest.Mock).mockResolvedValue(null);

		await authController.updateUserName(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedId');
		expect(userModel.updateUsername).toHaveBeenCalledTimes(1);
		expect(userModel.updateUsername).toHaveBeenCalledWith('mockedId', 'newUserName');

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Failed to update username',
		});
	});

	it('should return 500 if an error occurs', async () => {
		(userModel.getUserById as jest.Mock).mockRejectedValue(new Error('Database Error'));

		await authController.updateUserName(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedId');
		expect(userModel.updateUsername).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Internal Server Error',
		});
	});
});

describe('PUT /api/auth/:id/email', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		req = {
			params: { id: 'mockedId' },
			body: { email: 'new@example.com' },
		} as Partial<Request> & { params: { id: string }; body: { email: string } };
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnThis();
		res = { status: statusMock, json: jsonMock } as Partial<Response> & {
			status: jest.Mock;
			json: jest.Mock;
		};
	});

	it('should update email and return success', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedId',
			email: 'old@example.com',
		});

		(userModel.updateEmail as jest.Mock).mockResolvedValue([
			{
				id: 'mockedId',
				email: 'new@example.com',
			},
		]);

		await authController.updateEmail(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedId');
		expect(userModel.updateEmail).toHaveBeenCalledTimes(1);
		expect(userModel.updateEmail).toHaveBeenCalledWith('mockedId', 'new@example.com');

		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Email updated successfully',
			user: { id: 'mockedId', email: 'new@example.com' },
		});
	});

	it('should return 404 if user Not found', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue(null);

		await authController.updateEmail(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedId');
		expect(userModel.updateEmail).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'User not found',
		});
	});

	it('should return 400 if failed to update email', async () => {
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedId',
			email: 'old@example.com',
		});

		(userModel.updateEmail as jest.Mock).mockResolvedValue(null);

		await authController.updateEmail(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedId');
		expect(userModel.updateEmail).toHaveBeenCalledTimes(1);
		expect(userModel.updateEmail).toHaveBeenCalledWith('mockedId', 'new@example.com');

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Failed to update email',
		});
	});

	it('should return 500 if an error occurs', async () => {
		(userModel.getUserById as jest.Mock).mockRejectedValue(new Error('Database Error'));

		await authController.updateEmail(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedId');
		expect(userModel.updateEmail).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Internal Server Error',
		});
	});
});

jest.mock('jsonwebtoken', () => ({
	verify: jest.fn(),
}));

describe('POST /api/auth/resend-confirmation-email', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		req = { body: { email: 'test@example.com' } } as Partial<Request> & {
			body: { email: string };
		};

		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnThis();
		res = { status: statusMock, json: jsonMock } as Partial<Response> & {
			status: jest.Mock;
			json: jest.Mock;
		};
	});
	it('should resend confirmation email and return success', async () => {
		(userModel.findUserByEmail as jest.Mock).mockResolvedValue({
			id: 'mockedId',
			email: 'test@example.com',
			emailVerified: false,
		});

		(jwt.sign as jest.Mock).mockReturnValue('mockedJwtToken');

		(userModel.updateUser as jest.Mock).mockResolvedValue(undefined);

		(sendEmail as jest.Mock).mockResolvedValue(undefined);

		await authController.resendVerificationEmail(req as Request, res as Response);

		expect(userModel.findUserByEmail).toHaveBeenCalledTimes(1);
		expect(userModel.findUserByEmail).toHaveBeenCalledWith('test@example.com');

		expect(jwt.sign).toHaveBeenCalledTimes(1);
		expect(jwt.sign).toHaveBeenCalledWith({ userId: 'mockedId' }, process.env.JWT_SECRET!, {
			expiresIn: '1h',
		});

		expect(userModel.updateUser).toHaveBeenCalledTimes(1);
		expect(userModel.updateUser).toHaveBeenCalledWith('mockedId', {
			verification_token: 'mockedJwtToken',
		});

		expect(sendEmail).toHaveBeenCalledTimes(1);
		expect(sendEmail).toHaveBeenCalledWith(
			'test@example.com',
			'Resend: Verify your account',
			expect.stringContaining('Click here to verify'),
		);

		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Verification email resent successfully!',
		});
	});

	it('should return 404 if user is not found', async () => {
		(userModel.findUserByEmail as jest.Mock).mockResolvedValue(null);

		await authController.resendVerificationEmail(req as Request, res as Response);

		expect(userModel.findUserByEmail).toHaveBeenCalledTimes(1);
		expect(userModel.findUserByEmail).toHaveBeenCalledWith('test@example.com');
		expect(userModel.updateUser).not.toHaveBeenCalled();
		expect(sendEmail).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'User not found',
		});
	});

	it('should return 400 if email is already verified', async () => {
		(userModel.findUserByEmail as jest.Mock).mockResolvedValue({
			id: 'mockedId',
			email: 'test@example.com',
			emailVerified: true,
		});

		await authController.resendVerificationEmail(req as Request, res as Response);

		expect(userModel.findUserByEmail).toHaveBeenCalledTimes(1);
		expect(userModel.findUserByEmail).toHaveBeenCalledWith('test@example.com');
		expect(userModel.updateUser).not.toHaveBeenCalled();
		expect(sendEmail).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Email already verified',
		});
	});

	it('should return 500 if an error occurs', async () => {
		(userModel.findUserByEmail as jest.Mock).mockRejectedValue(new Error('Database Error'));

		await authController.resendVerificationEmail(req as Request, res as Response);

		expect(userModel.findUserByEmail).toHaveBeenCalledTimes(1);
		expect(userModel.findUserByEmail).toHaveBeenCalledWith('test@example.com');
		expect(userModel.updateUser).not.toHaveBeenCalled();
		expect(sendEmail).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Internal Server Error',
		});
	});
});

describe('POST /api/auth/verify-email', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		req = {
			body: { token: 'validToken' },
		} as Partial<Request> & { body: { token: string } };
		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnThis();
		res = { status: statusMock, json: jsonMock };
	});

	it('should verify the email successfully', async () => {
		(jwt.verify as jest.Mock).mockReturnValue({ userId: 'mockedUserId' });
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedUserId',
			email_verified: false,
			verification_token: 'validToken',
		});
		(userModel.updateUser as jest.Mock).mockResolvedValue(undefined);

		await authController.verifyEmail(req as Request, res as Response);

		expect(jwt.verify).toHaveBeenCalledTimes(1);
		expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET!);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedUserId');

		expect(userModel.updateUser).toHaveBeenCalledTimes(1);
		expect(userModel.updateUser).toHaveBeenCalledWith('mockedUserId', {
			email_verified: true,
		});

		expect(statusMock).not.toHaveBeenCalledWith(); // No error
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Email verified successfully!',
		});
	});

	it('should return 404 if user is not found', async () => {
		(jwt.verify as jest.Mock).mockReturnValue({ userId: 'mockedUserId' });
		(userModel.getUserById as jest.Mock).mockResolvedValue(null);

		await authController.verifyEmail(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedUserId');
		expect(userModel.updateUser).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'User not found' });
	});

	it('should return 400 if the email is already verified', async () => {
		(jwt.verify as jest.Mock).mockReturnValue({ userId: 'mockedUserId' });
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedUserId',
			email_verified: true,
			verification_token: 'validToken',
		});

		await authController.verifyEmail(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedUserId');
		expect(userModel.updateUser).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'user verified' });
	});

	it('should return 404 if the token is invalid', async () => {
		(jwt.verify as jest.Mock).mockReturnValue({ userId: 'mockedUserId' });
		(userModel.getUserById as jest.Mock).mockResolvedValue({
			id: 'mockedUserId',
			email_verified: false,
			verification_token: 'differentToken',
		});

		await authController.verifyEmail(req as Request, res as Response);

		expect(userModel.getUserById).toHaveBeenCalledTimes(1);
		expect(userModel.getUserById).toHaveBeenCalledWith('mockedUserId');
		expect(userModel.updateUser).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid Token' });
	});

	it('should return 400 if token is invalid or expired', async () => {
		(jwt.verify as jest.Mock).mockImplementation(() => {
			throw new Error('Invalid token');
		});

		await authController.verifyEmail(req as Request, res as Response);

		expect(jwt.verify).toHaveBeenCalledTimes(1);
		expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET!);

		expect(userModel.getUserById).not.toHaveBeenCalled();
		expect(userModel.updateUser).not.toHaveBeenCalled();

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Invalid or expired token',
		});
	});
});
