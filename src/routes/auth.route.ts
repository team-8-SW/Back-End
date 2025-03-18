import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { validateLogin, validateRegister } from '../validation/auth.validation';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

// POST /api/auth/login
router.post('/login', validateLogin, handleValidationErrors, login);

// POST /api/auth/registerwithcaptcha
router.post('/registerwithcaptcha', validateRegister, handleValidationErrors, register);

export default router;
