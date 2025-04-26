import { Router } from 'express';
import { newAuthMiddleware, isAdmin } from '../middleware/auth.middleware';
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
} from '../controllers/admin.controller';

const router = Router();

router.get('/reports', newAuthMiddleware, isAdmin, getAllReports);
router.put('/reports/:reportId/resolve', newAuthMiddleware, isAdmin, resolveReport);
router.delete('/posts/:postId', newAuthMiddleware, isAdmin, deleteReportedPost);
router.delete('/comments/:commentId', newAuthMiddleware, isAdmin, deleteReportedComment);
router.get('/jobs', newAuthMiddleware, isAdmin, getAllJobsAdmin);
router.get('/jobs/flagged', newAuthMiddleware, isAdmin, getFlaggedJobs);
router.delete('/jobs/:jobId', newAuthMiddleware, isAdmin, deleteJobListing);
router.put('/jobs/:jobId/status', newAuthMiddleware, isAdmin, updateJobStatus);
router.get('/analytics/jobs', newAuthMiddleware, isAdmin, getJobAnalytics);
router.get('/users/statistics', newAuthMiddleware, isAdmin, getUserStats);
router.get('/analytics/overview', newAuthMiddleware, isAdmin, getOverviewAnalytics);
router.get('/analytics/most-reported', newAuthMiddleware, isAdmin, getMostReported);

export default router;
