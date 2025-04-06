import express from 'express';
import * as postsController from '../controllers/post.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';
//import { upload } from '../middleware/multer'
const router = express.Router();

router.get('/me', newAuthMiddleware, postsController.getMyPosts); 
router.get('/me/feed', newAuthMiddleware, postsController.getFeedPosts) 
router.post('/me/newpost', newAuthMiddleware, postsController.createPost);
router.post('/me/editpost', newAuthMiddleware, postsController.editPost);
router.post('/me/like', newAuthMiddleware, postsController.likePost);
router.post('/me/comment', newAuthMiddleware, postsController.commentPost);
router.post('/me/save', newAuthMiddleware, postsController.savePost);
router.post('/me/share', newAuthMiddleware, postsController.sharePost);
//router.post('/me/media', newAuthMiddleware, upload.single('file'), postsController.addMediaToPost); //report post
router.get('/search', postsController.searchPost); //search by post content
router.delete('/me/delete', newAuthMiddleware, postsController.deletePost); //lazem yekoun enta ely 3amel elpost //should we check reposts bardo??
router.get('/me/postengagement', newAuthMiddleware, postsController.viewPostEngagement);
export default router;
