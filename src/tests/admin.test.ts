jest.mock('../../src/config/db', () => ({
	knexInstance: {
		select: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		andWhere: jest.fn().mockReturnThis(),
		join: jest.fn().mockReturnThis(),
		count: jest.fn().mockReturnThis(),
		groupBy: jest.fn().mockReturnThis(),
		orderBy: jest.fn().mockReturnThis(),
		first: jest.fn().mockReturnThis(),
		update: jest.fn().mockResolvedValue(1),
		insert: jest.fn().mockResolvedValue([1]),
		del: jest.fn().mockResolvedValue(1),
	},
	pool: {
		query: jest.fn(),
		connect: jest.fn().mockResolvedValue({ release: jest.fn() }),
		end: jest.fn(),
	},
}));

import { Request, Response } from 'express';

import {
	getAllReports,
	resolveReport,
	deleteReportedPost,
	deleteReportedComment,
	getAllJobsAdmin,
	getFlaggedJobs,
	deleteJobListing,
	updateJobStatus,
	getJobAnalytics,
	getUserStats,
	getOverviewAnalytics,
	getMostReported,
} from '../../src/controllers/admin.controller';

import {
	fetchAllReports,
	resolveReportById,
	deletePostById,
	deleteCommentById,
	fetchAllJobsAdmin,
	fetchFlaggedJobs,
	removeJobListing,
	changeJobStatus,
	fetchJobAnalytics,
	fetchUserStats,
	getOverviewStats,
	getMostReportedContent,
} from '../../src/services/admin.service';

jest.mock('../../src/services/admin.service');

const mockResponse = () => {
	const res: Partial<Response> = {};
	res.status = jest.fn().mockReturnThis();
	res.json = jest.fn().mockReturnThis();
	return res as Response;
};

describe('Admin Controller - Unit Tests', () => {
	let req: Partial<Request>;
	let res: Response;

	beforeEach(() => {
		jest.clearAllMocks();
		req = {};
		res = mockResponse();
	});

	describe('GET /api/admin/reports', () => {
		it('should return reported content', async () => {
			(fetchAllReports as jest.Mock).mockResolvedValue([
				{
					reportId: 'id1',
					contentId: 'c1',
					type: 'post',
					reportedBy: 'user1',
					status: 'pending',
				},
			]);

			await getAllReports(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith([
				{
					reportId: 'id1',
					contentId: 'c1',
					type: 'post',
					reportedBy: 'user1',
					status: 'pending',
				},
			]);
		});
	});

	describe('PUT /api/admin/reports/:reportId/resolve', () => {
		it('should resolve a report', async () => {
			req.params = { reportId: 'id1' };
			(resolveReportById as jest.Mock).mockResolvedValue(true);

			await resolveReport(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'Report resolved successfully' });
		});
	});

	describe('DELETE /api/admin/posts/:postId', () => {
		it('should delete a reported post', async () => {
			req.params = { postId: 'p1' };
			(deletePostById as jest.Mock).mockResolvedValue(true);

			await deleteReportedPost(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'Post deleted successfully' });
		});
	});

	describe('DELETE /api/admin/comments/:commentId', () => {
		it('should delete a reported comment', async () => {
			req.params = { commentId: 'c1' };
			(deleteCommentById as jest.Mock).mockResolvedValue(true);

			await deleteReportedComment(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'Comment deleted successfully' });
		});
	});

	describe('GET /api/admin/jobs', () => {
		it('should return all job listings', async () => {
			(fetchAllJobsAdmin as jest.Mock).mockResolvedValue([
				{ id: 'job1', title: 'Dev', status: 'Approved' },
			]);

			await getAllJobsAdmin(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith([
				{ id: 'job1', title: 'Dev', status: 'Approved' },
			]);
		});
	});

	describe('GET /api/admin/jobs/flagged', () => {
		it('should return flagged job listings', async () => {
			(fetchFlaggedJobs as jest.Mock).mockResolvedValue([
				{ id: 'job2', title: 'UX', status: 'Pending' },
			]);

			await getFlaggedJobs(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith([{ id: 'job2', title: 'UX', status: 'Pending' }]);
		});
	});

	describe('DELETE /api/admin/jobs/:jobId', () => {
		it('should delete a job listing', async () => {
			req.params = { jobId: 'job3' };
			(removeJobListing as jest.Mock).mockResolvedValue(true);

			await deleteJobListing(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'Job listing deleted successfully' });
		});
	});

	describe('PUT /api/admin/jobs/:jobId/status', () => {
		it('should update job status', async () => {
			req.params = { jobId: 'job4' };
			req.body = { status: 'Approved' };
			(changeJobStatus as jest.Mock).mockResolvedValue(true);

			await updateJobStatus(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'Job status updated successfully' });
		});
	});

	describe('GET /api/admin/analytics/jobs', () => {
		it('should return job analytics', async () => {
			(fetchJobAnalytics as jest.Mock).mockResolvedValue({ totalJobs: 3 });

			await getJobAnalytics(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ totalJobs: 3 });
		});
	});

	describe('GET /api/admin/analytics/users/statistics', () => {
		it('should return user statistics', async () => {
			(fetchUserStats as jest.Mock).mockResolvedValue({ totalUsers: 5 });

			await getUserStats(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ totalUsers: 5 });
		});
	});

	describe('GET /api/admin/analytics/overview', () => {
		it('should return overview analytics', async () => {
			req.query = { range: 'weekly' };
			(getOverviewStats as jest.Mock).mockResolvedValue({ newUsers: 10, newPosts: 5 });

			await getOverviewAnalytics(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ newUsers: 10, newPosts: 5 });
		});
	});

	describe('GET /api/admin/analytics/most-reported', () => {
		it('should return most reported content', async () => {
			(getMostReportedContent as jest.Mock).mockResolvedValue([
				{ contentId: 'post123', type: 'post', reportCount: 3 },
			]);

			await getMostReported(req as Request, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith([
				{ contentId: 'post123', type: 'post', reportCount: 3 },
			]);
		});
	});
});
