import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import app from './app.test';
import * as usersService from '../services/users.service';

jest.mock('../services/users.service');
jest.mock('../config/db', () => ({
	knexInstance: {
		select: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		first: jest.fn().mockResolvedValue(null),
		insert: jest.fn().mockResolvedValue([1]),
		update: jest.fn().mockResolvedValue(1),
		raw: jest.fn().mockResolvedValue([1]),
	},
}));
jest.mock('../middleware/auth.middleware', () => ({
	authMiddleware2: (req: Request, res: Response, next: NextFunction) => {
		(req as any).user = { id: '98e82849-dfd8-40da-9258-02357ee76cf4' };
		next();
	},
}));

describe('Users Controller Tests', () => {
	let authToken: string;
	let testUserId: string;
	const targetUserId = '987e6543-e21b-45d3-a456-426614174999';

	beforeAll(() => {
		authToken =
			'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk4ZTgyODQ5LWRmZDgtNDBkYS05MjU4LTAyMzU3ZWU3NmNmNCJ9.r4s2dAQaLEJBaApDTnzS_rIDE3Ib45j0vHEqIazfxz0';
		testUserId = '98e82849-dfd8-40da-9258-02357ee76cf4';
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('POST /api/users/:userId/block - blockUser', () => {
		it('should return 400 when trying to block self', async () => {
			const res = await request(app)
				.post(`/api/users/${testUserId}/block`)
				.set('Authorization', authToken);

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('You cannot block yourself');
		});

		it('should return 200 and block user successfully', async () => {
			const mockBlock = {
				id: 'block-id-123',
				user_id: testUserId,
				blocked_user_id: targetUserId,
			};

			(usersService.blockUser as jest.Mock).mockResolvedValue(mockBlock);

			const res = await request(app)
				.post(`/api/users/${targetUserId}/block`)
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.message).toBe('User blocked successfully');
			expect(res.body.blockedUser).toEqual(mockBlock);
		});

		it('should return 400 if no target user ID', async () => {
			const res = await request(app)
				.post('/api/users/%20/block')
				.set('Authorization', authToken);
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Target user ID is required');
		});

		it('should return 400 when already blocked', async () => {
			(usersService.blockUser as jest.Mock).mockResolvedValue('already blocked');

			const res = await request(app)
				.post(`/api/users/${targetUserId}/block`)
				.set('Authorization', authToken);

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('User already blocked');
		});

		it('should return 404 when user not found', async () => {
			(usersService.blockUser as jest.Mock).mockResolvedValue('not found');

			const res = await request(app)
				.post('/api/users/non-existent-user/block')
				.set('Authorization', authToken);

			expect(res.status).toBe(404);
			expect(res.body.message).toBe('User not found');
		});

		it('should return 500 for server errors', async () => {
			(usersService.blockUser as jest.Mock).mockRejectedValue(new Error('Database error'));

			const res = await request(app)
				.post(`/api/users/${targetUserId}/block`)
				.set('Authorization', authToken);

			expect(res.status).toBe(500);
			expect(res.body.error).toBe('Internal server error');
		});
	});

	describe('POST /api/users/:userId/unblock - unblockUser', () => {
		it('should return 400 when trying to unblock self', async () => {
			const res = await request(app)
				.post(`/api/users/${testUserId}/unblock`)
				.set('Authorization', authToken);

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('You cannot unblock yourself');
		});

		it('should return 200 and unblock user successfully', async () => {
			const mockUnblock = {
				id: 'unblock-id-123',
				user_id: testUserId,
				blocked_user_id: targetUserId,
			};

			(usersService.unblockUser as jest.Mock).mockResolvedValue(mockUnblock);

			const res = await request(app)
				.post(`/api/users/${targetUserId}/unblock`)
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.message).toBe('User unblocked successfully');
			expect(res.body.unblockedUser).toEqual(mockUnblock);
		});

		it('should return 400 if no target user ID', async () => {
			const res = await request(app)
				.post('/api/users/%20/unblock')
				.set('Authorization', authToken);
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Target user ID is required');
		});

		it('should return 400 when user not blocked', async () => {
			(usersService.unblockUser as jest.Mock).mockResolvedValue('not blocked');

			const res = await request(app)
				.post(`/api/users/${targetUserId}/unblock`)
				.set('Authorization', authToken);

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('User not blocked');
		});

		it('should return 404 when user not found', async () => {
			(usersService.unblockUser as jest.Mock).mockResolvedValue('not found');

			const res = await request(app)
				.post('/api/users/non-existent-user/unblock')
				.set('Authorization', authToken);

			expect(res.status).toBe(404);
			expect(res.body.message).toBe('User not found');
		});

		it('should return 500 for server errors', async () => {
			(usersService.unblockUser as jest.Mock).mockRejectedValue(new Error('Database error'));

			const res = await request(app)
				.post(`/api/users/${targetUserId}/unblock`)
				.set('Authorization', authToken);

			expect(res.status).toBe(500);
			expect(res.body.error).toBe('Internal server error');
		});
	});

	describe('GET /api/users/me/blocked - getBlockedUsers', () => {
		it('should return 200 with blocked users list', async () => {
			const mockBlockedUsers = [
				{
					userId: 'blocked-user-1',
					firstName: 'John',
					lastName: 'Doe',
					headline: 'Developer',
					profilePictureUrl: 'profile.jpg',
				},
			];

			(usersService.getBlockedUsers as jest.Mock).mockResolvedValue(mockBlockedUsers);

			const res = await request(app)
				.get('/api/users/me/blocked')
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.message).toBe('Blocked users retrieved successfully');
			expect(res.body.blockedUsers).toEqual(mockBlockedUsers);
		});

		it('should return 400 when no blocked users', async () => {
			(usersService.getBlockedUsers as jest.Mock).mockResolvedValue([]);

			const res = await request(app)
				.get('/api/users/me/blocked')
				.set('Authorization', authToken);

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('No blocked users found');
		});

		it('should return 500 for server errors', async () => {
			(usersService.getBlockedUsers as jest.Mock).mockRejectedValue(
				new Error('Database error'),
			);

			const res = await request(app)
				.get('/api/users/me/blocked')
				.set('Authorization', authToken);

			expect(res.status).toBe(500);
			expect(res.body.error).toBe('Internal server error');
		});
	});

	describe('GET /api/users/me/search - searchUsers', () => {
		it('should return 200 with search results', async () => {
			const mockUsers = [
				{
					userId: 'user-1',
					firstName: 'Alice',
					lastName: 'Smith',
					userName: 'alice.smith',
					headline: 'Software Engineer',
					profilePictureUrl: 'alice.jpg',
				},
			];

			(usersService.searchUsers as jest.Mock).mockResolvedValue(mockUsers);

			const res = await request(app)
				.get('/api/users/me/search?q=Alice')
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.message).toBe('Users retrieved successfully');
			expect(res.body.users).toEqual(mockUsers);
		});

		it('should return 200 with empty results', async () => {
			(usersService.searchUsers as jest.Mock).mockResolvedValue([]);
			const res = await request(app)
				.get('/api/users/me/search?q=NonExistentUser')
				.set('Authorization', authToken);
			expect(res.status).toBe(200);
			expect(res.body.message).toBe('No users found');
			expect(res.body.users).toEqual([]);
		});

		it('should return 400 when no search parameters', async () => {
			const res = await request(app)
				.get('/api/users/me/search')
				.set('Authorization', authToken);

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('At least one search parameter is required');
		});

		it('should return 500 for server errors', async () => {
			(usersService.searchUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

			const res = await request(app)
				.get('/api/users/me/search?q=Alice')
				.set('Authorization', authToken);

			expect(res.status).toBe(500);
			expect(res.body.error).toBe('Internal server error');
		});
	});
});
