import express from 'express';
import * as postsController from '../controllers/post.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer';
const router = express.Router();

router.get('/me', newAuthMiddleware, postsController.getMyPosts); //get user posts
router.get('/me/feed', newAuthMiddleware, postsController.getFeedPosts); //get user feed posts 
router.post('/me/newpost', newAuthMiddleware, postsController.createPost); //create new post
router.patch('/me/editpost', newAuthMiddleware, postsController.editPost); //edit post
router.post('/me/like', newAuthMiddleware, postsController.likePost); //like post
router.post('/me/unlike', newAuthMiddleware, postsController.deletelike); //unlike post
router.post('/me/comment', newAuthMiddleware, postsController.commentPost); //comment on post or comment
router.post('/me/save', newAuthMiddleware, postsController.savePost); //save post
router.post('/me/share', newAuthMiddleware, postsController.sharePost); //repost
router.post('/me/:post_id/media', newAuthMiddleware, upload.single('file'), postsController.addMediaToPost); //add media to post
router.get('/search', postsController.searchPost); //search by post content
router.delete('/me/delete', newAuthMiddleware, postsController.deletePost); //delete post //should we check reposts bardo?? elmafrood cascade by default hat delete it
router.get('/me/postengagement', newAuthMiddleware, postsController.viewPostEngagement); //view post details as in like counts w kda
router.post('/me/:tagged_user_id/taguser', newAuthMiddleware, postsController.tagUser); //tag user in post or comment
router.post('/me/report', newAuthMiddleware, postsController.reportPost); //report for inappropriate content, frontend elmafrood yeshiloo men elfeed w yektebo eno post removed
export default router;
