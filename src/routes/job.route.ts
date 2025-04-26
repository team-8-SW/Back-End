import express from 'express';
import * as jobController from '../controllers/job.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';
// import upload from '../middleware/upload.middleware';

const router = express.Router();

// 🔹 General Public Access
// Static routes must come first
router.get('/search', jobController.searchJob);
router.get('/filter', jobController.filterJob);
router.get('/', jobController.getJobs);
router.get('/employer/jobs', newAuthMiddleware, jobController.getJobsByUserId);
router.get('/applicant/jobs', newAuthMiddleware, jobController.getJobsByApplicant);
router.get('/applicantions/jobs', newAuthMiddleware, jobController.getApplicationsByApplicantId);
router.post('/post-job', newAuthMiddleware, jobController.postJob);

// Dynamic routes come last
router.get('/:id/applications', jobController.getApplicationsByJobId);
router.get('/:job_id/logo', jobController.fetchCompanyLogo);

router.put('/:id/accept', jobController.acceptApplication);
router.put('/:id/reject', jobController.rejectApplication);
router.post('/:id/save', newAuthMiddleware, jobController.saveJob);
router.delete('/:id/unsave', newAuthMiddleware, jobController.unSaveJob);
router.post('/:id/apply', newAuthMiddleware, jobController.applyForJob);
router.get('/:id/status', newAuthMiddleware, jobController.getStatus);

// LAST: get job by id
router.get('/:id', jobController.getJobById);

export default router;
