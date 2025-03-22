import express from 'express';
import * as followingController from '../controllers/following.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

//GET /api/following
router.get('/', authMiddleware, followingController.getFollowing);

//GET /api/following/followers
router.get('/followers', authMiddleware, followingController.getFollowers);

//POST /api/following/users/:userId
router.post('/users/:userId', authMiddleware, followingController.followAUser);

//DELETE /api/followings/users/:userId
router.delete('/users/:userId', authMiddleware, followingController.deleteFollow);

export default router;
