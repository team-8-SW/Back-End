import express from 'express';
import * as postsController from '../controllers/post.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', newAuthMiddleware, postsController.getmyposts); 
router.get('/me/feed', newAuthMiddleware, postsController.getfeedposts) 
router.post('/me/newpost', newAuthMiddleware, postsController.createPost);
router.post('/me/editpost', newAuthMiddleware, postsController.editpost);
router.post('/me/like', newAuthMiddleware, postsController.like);
router.post('/me/comment', newAuthMiddleware, postsController.comment);
router.post('/me/save', newAuthMiddleware, postsController.savepost);
router.post('/me/share', newAuthMiddleware, postsController.sharepost);
router.get('/search', postsController.searchpost); //search by post content
router.delete('/me/delete', newAuthMiddleware, postsController.deletepost); //lazem yekoun enta ely 3amel elpost //should we check reposts bardo??
router.get('/me/postengagement', newAuthMiddleware, postsController.viewpostengagement);
export default router;
