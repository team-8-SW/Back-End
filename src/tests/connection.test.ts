import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import app from './app.test';
import * as connectionService from '../services/connection.service';

jest.mock('../services/connection.service');
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
describe('Connection Controller Tests', () => {
	let authToken: string;
	let testUserId: string;

	beforeAll(() => {
		authToken =
			'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk4ZTgyODQ5LWRmZDgtNDBkYS05MjU4LTAyMzU3ZWU3NmNmNCJ9.r4s2dAQaLEJBaApDTnzS_rIDE3Ib45j0vHEqIazfxz0';
		testUserId = '98e82849-dfd8-40da-9258-02357ee76cf4';
	});

	describe('POST /api/connections/users/:userId - Send Connection Request', () => {
		it('should return 400 when trying to connect with self', async () => {
			const res = await request(app)
				.post(`/api/connections/users/${testUserId}`)
				.set('Authorization', authToken);

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('You cannot send a connection request to yourself.');
		});

		it('should return 200 and send connection request successfully', async () => {
			const targetUserId = '550e8400-e29b-41d4-a716-446655440000';
			const mockConnection = {
				id: 'conn-id-123',
				requester_id: testUserId,
				receiver_id: targetUserId,
				status: 'pending',
				created_at: new Date().toISOString(),
			};

			(connectionService.sendConnectionRequest as jest.Mock).mockResolvedValue(
				mockConnection,
			);

			const res = await request(app)
				.post(`/api/connections/users/${targetUserId}`)
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.message).toBe('Connection request sent successfully.');
			expect(res.body.connectionRequest).toEqual(mockConnection);
		});

		it('should return 400 when already connected', async () => {
			(connectionService.sendConnectionRequest as jest.Mock).mockResolvedValue(
				'already connected',
			);

			const res = await request(app)
				.post('/api/connections/users/550e8400-e29b-41d4-a716-446655440000')
				.set('Authorization', authToken);

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Already connected.');
		});

		it('should return 403 when blocked', async () => {
			(connectionService.sendConnectionRequest as jest.Mock).mockResolvedValue('blocked');

			const res = await request(app)
				.post('/api/connections/users/550e8400-e29b-41d4-a716-446655440000')
				.set('Authorization', authToken);

			expect(res.status).toBe(403);
			expect(res.body.message).toContain('Cannot send a connection request');
		});

		it('should return 404 when user not found', async () => {
			(connectionService.sendConnectionRequest as jest.Mock).mockResolvedValue('not found');

			const res = await request(app)
				.post('/api/connections/users/invalid-id')
				.set('Authorization', authToken);
			expect(res.status).toBe(404);
			expect(res.body.message).toBe('User not found.');
		});

		it('should handle 500 errors', async () => {
			(connectionService.sendConnectionRequest as jest.Mock).mockRejectedValue(
				new Error('DB Error'),
			);

			const res = await request(app)
				.post('/api/connections/users/550e8400-e29b-41d4-a716-446655440000')
				.set('Authorization', authToken);

			expect(res.status).toBe(500);
			expect(res.body.error).toBe('Internal server error');
		});
	});

	describe('POST /api/connections/:connectionId/accept - Accept Connection', () => {
		it('should return 200 and accept connection successfully', async () => {
			const mockConnection = {
				id: 'conn-id-123',
				status: 'accepted',
				requester_id: '550e8400-e29b-41d4-a716-446655440000',
				receiver_id: testUserId,
			};

			(connectionService.acceptConnectionRequest as jest.Mock).mockResolvedValue(
				mockConnection,
			);

			const res = await request(app)
				.post('/api/connections/conn-id-123/accept')
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.message).toBe('Connection request accepted successfully.');
			expect(res.body.connectionRequest).toEqual(mockConnection);
		});

		it('should return 404 when connection not found', async () => {
			(connectionService.acceptConnectionRequest as jest.Mock).mockResolvedValue('not found');

			const res = await request(app)
				.post('/api/connections/invalid-id/accept')
				.set('Authorization', authToken);

			expect(res.status).toBe(404);
			expect(res.body.message).toBe('Connection request not found.');
		});

		it('should return 400 when no connectionId provided', async () => {
			const res = await request(app)
				.post('/api/connections/ /accept')
				.set('Authorization', authToken);
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Connection ID is required.');
		});

		it('should return 403 when blocked', async () => {
			(connectionService.acceptConnectionRequest as jest.Mock).mockResolvedValue('blocked');

			const res = await request(app)
				.post('/api/connections/conn-id-123/accept')
				.set('Authorization', authToken);

			expect(res.status).toBe(403);
			expect(res.body.message).toContain('Cannot accept the connection request');
		});
	});

	describe('POST /api/connections/:connectionId/decline - Decline Connection', () => {
		it('should return 200 and decline connection successfully', async () => {
			const mockConnection = {
				id: 'conn-id-123',
				status: 'declined',
				requester_id: '550e8400-e29b-41d4-a716-446655440000',
				receiver_id: testUserId,
			};

			(connectionService.declineConnectionRequest as jest.Mock).mockResolvedValue(
				mockConnection,
			);

			const res = await request(app)
				.post('/api/connections/conn-id-123/decline')
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.message).toBe('Connection request declined successfully.');
			expect(res.body.connectionRequest).toEqual(mockConnection);
		});

		it('should return 404 when connection not found', async () => {
			(connectionService.declineConnectionRequest as jest.Mock).mockResolvedValue(
				'not found',
			);

			const res = await request(app)
				.post('/api/connections/invalid-id/decline')
				.set('Authorization', authToken);

			expect(res.status).toBe(404);
			expect(res.body.message).toBe('Connection request not found.');
		});
		it('should return 400 when no connectionId provided', async () => {
			const res = await request(app)
				.post('/api/connections/ /decline')
				.set('Authorization', authToken);
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Connection ID is required.');
		});

		it('should return 403 when blocked', async () => {
			(connectionService.declineConnectionRequest as jest.Mock).mockResolvedValue('blocked');

			const res = await request(app)
				.post('/api/connections/conn-id-123/decline')
				.set('Authorization', authToken);

			expect(res.status).toBe(403);
			expect(res.body.message).toContain('Cannot decline the connection request');
		});
	});

	describe('DELETE /api/connections/:connectionId - Remove Connection', () => {
		it('should return 200 and remove connection successfully', async () => {
			(connectionService.removeConnection as jest.Mock).mockResolvedValue('deleted');

			const res = await request(app)
				.delete('/api/connections/conn-id-123')
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.message).toBe('Connection removed successfully.');
		});

		it('should return 404 when connection not found', async () => {
			(connectionService.removeConnection as jest.Mock).mockResolvedValue('not found');

			const res = await request(app)
				.delete('/api/connections/invalid-id')
				.set('Authorization', authToken);

			expect(res.status).toBe(404);
			expect(res.body.message).toBe('No connection found to remove');
		});

		it('should return 400 when no connectionId provided', async () => {
			const res = await request(app)
				.delete('/api/connections/%20')
				.set('Authorization', authToken);
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Connection ID is required.');
		});

		it('should return 403 when blocked', async () => {
			(connectionService.removeConnection as jest.Mock).mockResolvedValue('blocked');

			const res = await request(app)
				.delete('/api/connections/conn-id-123')
				.set('Authorization', authToken);

			expect(res.status).toBe(403);
			expect(res.body.message).toContain('Cannot remove the connection');
		});
	});

	describe('GET /api/connections - Get All Connections', () => {
		it('should return 200 with connections list', async () => {
			const mockConnections = [
				{
					connectionId: 'conn-1',
					userId: 'user-1',
					firstName: 'John',
					lastName: 'Doe',
					headline: 'Software Engineer',
					profilePictureUrl: 'http://example.com/john.jpg',
					connectedAt: '2023-01-01T00:00:00Z',
				},
			];

			(connectionService.getAllConnections as jest.Mock).mockResolvedValue({
				connections: mockConnections,
				totalConnections: 1,
			});

			const res = await request(app).get('/api/connections').set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.totalConnections).toBe(1);
			expect(res.body.connections).toEqual(mockConnections);
		});

		it('should handle 500 errors', async () => {
			(connectionService.getAllConnections as jest.Mock).mockRejectedValue(
				new Error('DB Error'),
			);

			const res = await request(app).get('/api/connections').set('Authorization', authToken);

			expect(res.status).toBe(500);
			expect(res.body.error).toBe('Internal server error');
		});
	});

	describe('GET /api/connections/pending - Get Pending Requests', () => {
		it('should return 200 with pending requests', async () => {
			const mockRequests = [
				{
					connection_id: 'req-1',
					user_id: 'user-2',
					first_name: 'Jane',
					last_name: 'Smith',
					headline: 'Product Manager',
					profile_picture_url: 'http://example.com/jane.jpg',
					requested_at: '2023-01-02T00:00:00Z',
				},
			];

			(connectionService.getPendingConnectionRequests as jest.Mock).mockResolvedValue({
				pendingRequests: mockRequests,
				totalPendingRequests: 1,
			});

			const res = await request(app)
				.get('/api/connections/pending')
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.totalPendingRequests).toBe(1);
			expect(res.body.pendingRequests).toEqual(mockRequests);
		});
	});

	describe('GET /api/connections/sent - Get Sent Requests', () => {
		it('should return 200 with sent requests', async () => {
			const mockRequests = [
				{
					user_id: 'user-3',
					first_name: 'Bob',
					last_name: 'Johnson',
					headline: 'Data Scientist',
					profile_picture_url: 'http://example.com/bob.jpg',
					requested_at: '2023-01-03T00:00:00Z',
				},
			];

			(connectionService.getSentConnectionRequests as jest.Mock).mockResolvedValue({
				sentRequests: mockRequests,
				totalSentRequests: 1,
			});

			const res = await request(app)
				.get('/api/connections/sent')
				.set('Authorization', authToken);

			expect(res.status).toBe(200);
			expect(res.body.totalSentRequests).toBe(1);
			expect(res.body.sentRequests).toEqual(mockRequests);
		});
	});
});
