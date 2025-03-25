import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import app from './app.test';
import * as followingService from '../services/following.service';

// Mocking the following service and dependencies
jest.mock('../services/following.service');
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
		(req as any).user = { id: '9ebd15ea-0cf6-4540-86e1-359d96d2fdd1' };
		next();
	},
}));

describe('Following Controller Tests', () => {
	let authToken: string;
	let testUserId: string;
	let testFollowUserId: string;

	beforeAll(() => {
		authToken =
			'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjllYmQxNWVhLTBjZjYtNDU0MC04NmUxLTM1OWQ5NmQyZmRkMSJ9.-pySzMkbKtMxMz6pyACPhjUrEFK1o74179PviShvS6M';
		testUserId = '9ebd15ea-0cf6-4540-86e1-359d96d2fdd1';
		testFollowUserId = 'f440fdae-980b-4044-a10b-e328b25e5509';
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('GET /api/following', () => {
		it('should return 200 and following list', async () => {
			const mockFollowing = [
				{
					id: testFollowUserId,
					firstName: 'John',
					lastName: 'Doe',
					headline: 'Software Engineer',
				},
			];
			(followingService.getFollowing as jest.Mock).mockResolvedValue(mockFollowing);

			const response = await request(app)
				.get('/api/following')
				.set('Authorization', authToken);

			expect(response.status).toBe(200);
			expect(response.body).toEqual([
				{
					id: testFollowUserId,
					firstName: 'John',
					lastName: 'Doe',
					headline: 'Software Engineer',
				},
			]);
		});

		it('should return 404 if no following found', async () => {
			(followingService.getFollowing as jest.Mock).mockResolvedValue([]);

			const response = await request(app)
				.get('/api/following')
				.set('Authorization', authToken);

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('No followers found');
		});

		it('should return 500 for server error', async () => {
			(followingService.getFollowing as jest.Mock).mockRejectedValue(
				new Error('Database error'),
			);

			const response = await request(app)
				.get('/api/following')
				.set('Authorization', authToken);

			expect(response.status).toBe(500);
			expect(response.body.error).toBe('Internal server error');
		});
	});

	describe('GET /api/following/followers', () => {
		it('should return 200 and followers list', async () => {
			const mockFollowers = [
				{
					id: testFollowUserId,
					firstName: 'Jane',
					lastName: 'Smith',
					headline: 'Product Manager',
				},
			];
			(followingService.getFollowers as jest.Mock).mockResolvedValue(mockFollowers);

			const response = await request(app)
				.get('/api/following/followers')
				.set('Authorization', authToken);

			expect(response.status).toBe(200);
			expect(response.body).toEqual([
				{
					id: testFollowUserId,
					firstName: 'Jane',
					lastName: 'Smith',
					headline: 'Product Manager',
				},
			]);
		});

		it('should return 404 if no followers found', async () => {
			(followingService.getFollowers as jest.Mock).mockResolvedValue([]);

			const response = await request(app)
				.get('/api/following/followers')
				.set('Authorization', authToken);

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('No followers found');
		});
	});

	describe('POST /api/following/users/:userId', () => {
		it('should return 201 when following successfully', async () => {
			(followingService.followAUser as jest.Mock).mockResolvedValue(true);

			const response = await request(app)
				.post(`/api/following/users/${testFollowUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(201);
			expect(response.body.message).toBe('User followed successfully');
		});

		it('should return 400 when trying to follow self', async () => {
			const response = await request(app)
				.post(`/api/following/users/${testUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('You cannot follow yourself');
		});

		it('should return 500 for server error', async () => {
			(followingService.followAUser as jest.Mock).mockRejectedValue(
				new Error('Database error'),
			);

			const response = await request(app)
				.post(`/api/following/users/${testFollowUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(500);
			expect(response.body.error).toBe('Internal server error');
		});
	});

	describe('DELETE /api/following/users/:userId', () => {
		it('should return 201 when unfollowing successfully', async () => {
			(followingService.deleteFollow as jest.Mock).mockResolvedValue(true);

			const response = await request(app)
				.delete(`/api/following/users/${testFollowUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(201);
			expect(response.body.message).toBe('User unfollowed successfully');
		});

		it('should return 400 when trying to unfollow self', async () => {
			const response = await request(app)
				.delete(`/api/following/users/${testUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('You cannot unfollow yourself');
		});

		it('should return 500 for server error', async () => {
			(followingService.deleteFollow as jest.Mock).mockRejectedValue(
				new Error('Database error'),
			);

			const response = await request(app)
				.delete(`/api/following/users/${testFollowUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(500);
			expect(response.body.error).toBe('Internal server error');
		});
	});
});
