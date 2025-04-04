import express from 'express';
import * as postsController from '../controllers/post.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', newAuthMiddleware, postsController.getmyposts); //neshouf law mehtaga me
router.post('/me/newpost', newAuthMiddleware, postsController.createPost); //neshouf law mehtaga me

export default router;
