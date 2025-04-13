import { body } from 'express-validator';

export const validateLogin = [
	body('email').isEmail().withMessage('Must be a valid email'),
	body('password').notEmpty().withMessage('Password is required'),
];

export const validateRegister = [
	body('userName').notEmpty().withMessage('Username is required'),
	body('email').isEmail().withMessage('Must be a valid email'),
	body('password')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long'),
	body('firstName').notEmpty().withMessage('First name is required'),
	body('lastName').notEmpty().withMessage('Last name is required'),
	body('recaptchaToken').notEmpty().withMessage('reCAPTCHA token is required'),
];

export const validateForgotPassword = [
	body('email').isEmail().withMessage('Must be a valid email'),
];

export const validateResetPassword = [
	body('token').notEmpty().withMessage('Reset token is required'),
	body('newPassword')
		.isLength({ min: 6 })
		.withMessage('New password must be at least 6 characters long'),
	body('confirmPassword')
		.notEmpty()
		.withMessage('Confirm password is required')
		.custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error('Passwords do not match');
			}
			return true;
		}),
];

export const validateUpdatePassword = [
	body('currentPassword').notEmpty().withMessage('Current password is required'),
	body('newPassword')
		.isLength({ min: 6 })
		.withMessage('New password must be at least 6 characters long'),
];

export const validateSocialLogin = [
	body('idToken').notEmpty().withMessage('Google ID Token is required'),
];
