import { Request, Response } from 'express';
import * as followingService from '../services/following.service';
import { profile } from 'console';

export const getFollowing = async (req: Request, res: Response) => {
	const userId = (req as any).user?.id;

	try {
		const following = await followingService.getFollowing(userId);
		if (!following || following.length === 0) {
			return res.status(404).json({ error: 'No followers found' });
		}
		res.json(
			following.map((fol) => ({
				id: fol.id,
				firstName: fol.firstName,
				lastName: fol.lastName,
				headline: fol.headline,
				profilePictureUrl: fol.profilePictureUrl,
			})),
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const getFollowers = async (req: Request, res: Response) => {
	const userId = (req as any).user?.id;

	try {
		const followers = await followingService.getFollowers(userId);
		if (!followers || followers.length === 0) {
			return res.status(404).json({ error: 'No followers found' });
		}

		res.json(
			followers.map((fol) => ({
				id: fol.id,
				firstName: fol.firstName,
				lastName: fol.lastName,
				headline: fol.headline,
				profilePictureUrl: fol.profilePictureUrl,
			})),
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const followAUser = async (req: Request, res: Response) => {
	const userId = (req as any).user?.id;
	const followUserId = req.params.userId;

	if (!followUserId) {
		return res.status(400).json({ error: 'Follow User ID is required' });
	}
	if (userId === followUserId) {
		return res.status(400).json({ error: 'You cannot follow yourself' });
	}

	try {
		const followedAUser = await followingService.followAUser(userId, followUserId);
		if (!followedAUser) {
			return res.status(400).json({ error: 'Failed to follow user' });
		}

		res.status(201).json({ message: 'User followed successfully' });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const deleteFollow = async (req: Request, res: Response) => {
	const userId = (req as any).user?.id;
	const removedUserId = req.params.userId;

	if (!removedUserId) {
		return res.status(400).json({ error: 'Unfollow User ID is required' });
	}
	if (userId === removedUserId) {
		return res.status(400).json({ error: 'You cannot unfollow yourself' });
	}
	try {
		const unfollowedUser = await followingService.deleteFollow(userId, removedUserId);
		if (!unfollowedUser) {
			return res.status(400).json({ error: 'Failed to unfollow user' });
		}

		res.status(201).json({ message: 'User unfollowed successfully' });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
