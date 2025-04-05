import { Request, Response } from 'express';
import * as usersService from '../services/users.service';

//------------Block/Unblock users---------//
export const blockUser = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { userId: targetUserId } = req.params;

		if (!targetUserId || targetUserId.trim() === '') {
			return res.status(400).json({ message: 'Target user ID is required' });
		}

		if (userId === targetUserId) {
			return res.status(400).json({ message: 'You cannot block yourself' });
		}

		const result = await usersService.blockUser(userId, targetUserId);

		if (result === 'not found') {
			return res.status(404).json({ message: 'User not found' });
		}

		if (result === 'already blocked') {
			return res.status(400).json({ message: 'User already blocked' });
		}

		res.status(200).json({
			message: 'User blocked successfully',
			blockedUser: result,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const unblockUser = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { userId: targetUserId } = req.params;

		if (!targetUserId || targetUserId.trim() === '') {
			return res.status(400).json({ message: 'Target user ID is required' });
		}

		if (userId === targetUserId) {
			return res.status(400).json({ message: 'You cannot unblock yourself' });
		}

		const result = await usersService.unblockUser(userId, targetUserId);

		if (result === 'not found') {
			return res.status(404).json({ message: 'User not found' });
		}

		if (result === 'not blocked') {
			return res.status(400).json({ message: 'User not blocked' });
		}

		res.status(200).json({
			message: 'User unblocked successfully',
			unblockedUser: result,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//------------Get a list of blocked users---------//
export const getBlockedUsers = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const blockedUsers = await usersService.getBlockedUsers(userId);

		if (blockedUsers.length === 0) {
			return res.status(400).json({ message: 'No blocked users found' });
		}

		res.status(200).json({
			message: 'Blocked users retrieved successfully',
			blockedUsers,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//------------Search for users by name, company, or industry---------//
export const searchUsers = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { q: query, company, industry } = req.query;
		if (!query && !company && !industry) {
			return res.status(400).json({ message: 'At least one search parameter is required' });
		}

		const users = await usersService.searchUsers(
			query as string,
			company as string,
			industry as string,
			userId,
		);

		if (users.length === 0) {
			return res.status(200).json({ message: 'No users found', users: [] });
		}

		res.status(200).json({ message: 'Users retrieved successfully', users });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
