import { knexInstance as db } from '../config/db';
import { getReportsFromDB, markReportAsResolved } from '../models/admin.model';
import { subDays, subWeeks, subMonths } from 'date-fns';

export const fetchAllReports = async () => {
	return await getReportsFromDB();
};

export const resolveReportById = async (reportId: string) => {
	return await markReportAsResolved(reportId);
};

export const deletePostById = async (postId: string) => {
	const deleted = await db('posts').where({ id: postId }).del();

	if (deleted === 0) {
		throw new Error('Post not found');
	}
};
export const deleteCommentById = async (commentId: string) => {
	const deleted = await db('comments').where({ id: commentId }).del();

	if (deleted === 0) {
		throw new Error('Comment not found');
	}
};
export const fetchAllJobsAdmin = async () => {
	return await db('job_listings').select('*');
};
export const fetchFlaggedJobs = async () => {
	return await db('job_listings').select('*').where('status', 'Flagged');
};
export const removeJobListing = async (jobId: string) => {
	return await db('job_listings').where({ id: jobId }).del();
};
export const changeJobStatus = async (jobId: string, status: string) => {
	return await db('job_listings').where({ id: jobId }).update({ status });
};
export const fetchJobAnalytics = async () => {
    const [total] = await db('job_listings').count({ count: '*' });
    const [approved] = await db('job_listings').where({ status: 'Approved' }).count({ count: '*' });
    const [pending] = await db('job_listings').where({ status: 'Pending' }).count({ count: '*' });
    const [rejected] = await db('job_listings').where({ status: 'Rejected' }).count({ count: '*' });
    const [flagged] = await db('job_listings').where({ status: 'Flagged' }).count({ count: '*' });

    return {
        totalJobs: parseInt(String(total?.count || '0'), 10),
        approvedJobs: parseInt(String(approved?.count || '0'), 10),
        pendingJobs: parseInt(String(pending?.count || '0'), 10),
        rejectedJobs: parseInt(String(rejected?.count || '0'), 10),
        flaggedJobs: parseInt(String(flagged?.count || '0'), 10),
    };
};
export const fetchUserStats = async () => {
	const [total] = await db('users').count('* as count');
	const [active] = await db('users').where({ is_active: true }).count('* as count');
	const [suspended] = await db('users').where({ is_active: false }).count('* as count');

	return {
		totalUsers: parseInt(String(total.count)),
		activeUsers: parseInt(String(active.count)),
		suspendedUsers: parseInt(String(suspended.count)),
	};
};

export const getOverviewStats = async (range: string) => {
	const now = new Date();
	const cutoff =
		range === 'daily'
			? subDays(now, 1)
			: range === 'weekly'
				? subWeeks(now, 1)
				: subMonths(now, 1);

	const [newUsers] = await db('users').where('created_at', '>=', cutoff).count('* as count');
	const [newJobs] = await db('job_listings').where('posted_at', '>=', cutoff).count('* as count');
	const [newPosts] = await db('posts').where('created_at', '>=', cutoff).count('* as count');

	return {
		newUsers: parseInt(String(newUsers.count)),
		newJobListings: parseInt(String(newJobs.count)),
		newPosts: parseInt(String(newPosts.count)),
	};
};
export const getMostReportedContent = async () => {
	const reportedPosts = await db('reported_posts')
		.select('post_id as contentId')
		.count('id as reportCount')
		.groupBy('post_id')
		.orderBy('reportCount', 'desc')
		.limit(5);

	const reportedComments = await db('reported_comments')
		.select('comment_id as contentId')
		.count('id as reportCount')
		.groupBy('comment_id')
		.orderBy('reportCount', 'desc')
		.limit(5);

	const formattedPosts = reportedPosts.map((item) => ({
		contentId: item.contentId,
		type: 'post',
		reportCount: parseInt(String(item.reportCount)),
	}));

	const formattedComments = reportedComments.map((item) => ({
		contentId: item.contentId,
		type: 'comment',
		reportCount: parseInt(String(item.reportCount)),
	}));

	// Combine and sort by reportCount (optional)
	return [...formattedPosts, ...formattedComments].sort((a, b) => b.reportCount - a.reportCount);
};
