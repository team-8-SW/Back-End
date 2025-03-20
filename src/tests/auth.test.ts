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
import { sendResetEmail } from '../../src/utils/email';
import { OAuth2Client } from 'google-auth-library';

jest.mock('../../src/models/user.model');
jest.mock('../../src/utils/email');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
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
