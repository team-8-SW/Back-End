import express from 'express';
import * as postsController from '../controllers/post.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', newAuthMiddleware, postsController.getmyposts); 
router.get('/me/feed', newAuthMiddleware, postsController.getfeedposts) 
router.post('/me/newpost', newAuthMiddleware, postsController.createPost);
router.post('/me/like', newAuthMiddleware, postsController.like);
router.post('/me/comment', newAuthMiddleware, postsController.comment);
router.post('/me/save', newAuthMiddleware, postsController.savepost);
router.get('/me/postengagement', newAuthMiddleware, postsController.viewpostengagement);
export default router;
