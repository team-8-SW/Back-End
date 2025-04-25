import { Request, Response } from 'express';
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
} from '../services/admin.service';

export const getAllReports = async (req: Request, res: Response) => {
	try {
		const reports = await fetchAllReports();
		res.status(200).json(reports);
	} catch (err) {
		console.error('getAllReports ERROR:', err);
		res.status(500).json({ error: 'Failed to fetch reports' });
	}
};
export const resolveReport = async (req: Request, res: Response) => {
	try {
		const { reportId } = req.params;
		await resolveReportById(reportId);
		res.status(200).json({ message: 'Report resolved successfully' });
	} catch (err) {
		console.error('resolveReport ERROR:', err);
		res.status(500).json({ error: 'Failed to resolve report' });
	}
};
export const deleteReportedPost = async (req: Request, res: Response) => {
	try {
		const { postId } = req.params;
		await deletePostById(postId);
		res.status(200).json({ message: 'Post deleted successfully' });
	} catch (error) {
		console.error('Failed to delete post:', error);
		res.status(500).json({ error: 'Failed to delete post' });
	}
};
export const deleteReportedComment = async (req: Request, res: Response) => {
	try {
		const { commentId } = req.params;
		await deleteCommentById(commentId);
		res.status(200).json({ message: 'Comment deleted successfully' });
	} catch (error) {
		console.error('Failed to delete comment:', error);
		res.status(500).json({ error: 'Failed to delete comment' });
	}
};
export const getAllJobsAdmin = async (req: Request, res: Response) => {
	try {
		const jobs = await fetchAllJobsAdmin();
		res.status(200).json(jobs);
	} catch (error) {
		console.error('Failed to fetch jobs:', error);
		res.status(500).json({ error: 'Failed to fetch jobs' });
	}
};
export const getFlaggedJobs = async (req: Request, res: Response) => {
	try {
		const jobs = await fetchFlaggedJobs();
		res.status(200).json(jobs);
	} catch (err) {
		console.error('Error fetching flagged jobs:', err);
		res.status(500).json({ error: 'Failed to fetch flagged jobs' });
	}
};
export const deleteJobListing = async (req: Request, res: Response) => {
	try {
		const { jobId } = req.params;
		await removeJobListing(jobId);
		res.status(200).json({ message: 'Job listing deleted successfully' });
	} catch (error) {
		console.error('Failed to delete job:', error);
		res.status(500).json({ error: 'Failed to delete job' });
	}
};
export const updateJobStatus = async (req: Request, res: Response) => {
	try {
		const { jobId } = req.params;
		const { status } = req.body;

		if (!['Approved', 'Rejected'].includes(status)) {
			return res.status(400).json({ error: 'Invalid status value' });
		}

		await changeJobStatus(jobId, status);
		res.status(200).json({ message: `Job status updated successfully` });
	} catch (error) {
		console.error('Failed to update job status:', error);
		res.status(500).json({ error: 'Failed to update job status' });
	}
};
export const getJobAnalytics = async (req: Request, res: Response) => {
	try {
		const stats = await fetchJobAnalytics();
		res.status(200).json(stats);
	} catch (err) {
		console.error('Failed to fetch job analytics:', err);
		res.status(500).json({ error: 'Failed to fetch job analytics' });
	}
};
export const getUserStats = async (req: Request, res: Response) => {
	try {
		const stats = await fetchUserStats();
		res.status(200).json(stats);
	} catch (err) {
		console.error('Failed to fetch user statistics:', err);
		res.status(500).json({ error: 'Failed to fetch user statistics' });
	}
};

export const getOverviewAnalytics = async (req: Request, res: Response) => {
	try {
		const range = req.query.range as string;

		if (!['daily', 'weekly', 'monthly'].includes(range)) {
			return res.status(400).json({ error: 'Invalid range value' });
		}

		const stats = await getOverviewStats(range);
		res.status(200).json(stats);
	} catch (err) {
		console.error('Failed to fetch overview analytics:', err);
		res.status(500).json({ error: 'Failed to fetch overview analytics' });
	}
};

export const getMostReported = async (req: Request, res: Response) => {
	try {
		const result = await getMostReportedContent();
		res.status(200).json(result);
	} catch (error) {
		console.error('Failed to fetch most reported content:', error);
		res.status(500).json({ error: 'Failed to fetch most reported content' });
	}
};
