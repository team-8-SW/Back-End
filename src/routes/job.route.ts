import express from 'express';
import * as jobController from '../controllers/job.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';
// import upload from '../middleware/upload.middleware';

const router = express.Router();

// 🔹 General Public Access
router.get('/search', jobController.searchJob);
router.get('/filter', jobController.filterJob);
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// 🔹 Employer Protected Routes
router.get('/employer/jobs', newAuthMiddleware, jobController.getJobsByUserId);

// 🔹 Applicant Protected Routes
router.get('/applicant/jobs', newAuthMiddleware, jobController.getJobsByApplicant);

// 🔹 Job Posting
router.post('/post-job', newAuthMiddleware, jobController.postJob);

// 🔹 Applications Related
router.get('/:id/applications', jobController.getApplicationsByJobId);
router.put('/:id/accept', jobController.acceptApplication);
router.put('/:id/reject', jobController.rejectApplication);

// 🔹 Save / Unsave / Apply / Status
router.post('/:id/save', newAuthMiddleware, jobController.saveJob);
router.delete('/:id/unsave', newAuthMiddleware, jobController.unSaveJob);
router.post('/:id/apply', newAuthMiddleware, jobController.applyForJob);
router.get('/:id/status', newAuthMiddleware, jobController.getStatus);

export default router;
