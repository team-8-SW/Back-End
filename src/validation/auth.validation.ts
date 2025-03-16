import { body } from 'express-validator';

export const validateLogin = [
	body('email').isEmail().withMessage('Must be a valid email'),
	body('password').notEmpty().withMessage('Password is required'),
];

export const validateRegister = [
	body('userName').notEmpty().withMessage('Username is required'), 
	body('email').isEmail().withMessage('Must be a valid email'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	body('firstName').notEmpty().withMessage('First name is required'), 
	body('lastName').notEmpty().withMessage('Last name is required'), 
	body('recaptchaToken').notEmpty().withMessage('reCAPTCHA token is required'),
];
