import express from 'express';
import * as followingController from '../controllers/following.controller';
import { authMiddleware2 } from '../middleware/auth.middleware';

const router = express.Router();

//GET /api/following
router.get('/', authMiddleware2, followingController.getFollowing);

//GET /api/following/followers
router.get('/followers', authMiddleware2, followingController.getFollowers);

//POST /api/following/users/:userId
router.post('/users/:userId', authMiddleware2, followingController.followAUser);

//DELETE /api/followings/users/:userId
router.delete('/users/:userId', authMiddleware2, followingController.deleteFollow);

export default router;
