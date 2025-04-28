import { Router } from 'express';
import {
	login,
	register,
	registerwithtoutcaptcha,
	forgotPassword,
	resetPassword,
	updatePassword,
	socialLoginGoogle,
} from '../controllers/auth.controller';
import {
	validateLogin,
	validateRegister,
	validateRegister2,
	validateForgotPassword,
	validateResetPassword,
	validateUpdatePassword,
	validateSocialLogin,
} from '../validation/auth.validation';
import { handleValidationErrors } from '../middleware/validation.middleware';
import * as authcontroller from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login
router.post('/login', validateLogin, handleValidationErrors, login);

// POST /api/auth/registerwithcaptcha
router.post('/registerwithcaptcha', validateRegister, handleValidationErrors, register);

// POST /api/auth/registerwithoutcaptcha
router.post(
	'/registerwithoutcaptcha',
	validateRegister2,
	handleValidationErrors,
	registerwithtoutcaptcha,
);

router.post('/verify-email', authcontroller.verifyEmail);
router.get('/verify-email', authcontroller.verifyEmail);

router.post('/resend-confirmation', authcontroller.resendVerificationEmail);

router.put('/:id/username', authcontroller.updateUserName);

router.put('/:id/email', authcontroller.updateEmail);

router.delete('/:id', authcontroller.deleteAccount);
// POST /api/auth/reset-password
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

// POST /api/auth/forgot-password
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);

// PATCH /api/auth/update-password
router.patch(
	'/update-password',
	authMiddleware,
	validateUpdatePassword,
	handleValidationErrors,
	updatePassword,
);

// POST /api/auth/social/google
router.post('/social/google', validateSocialLogin, handleValidationErrors, socialLoginGoogle);

export default router;
