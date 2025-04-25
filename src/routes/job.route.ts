import express from 'express';
import * as jobController from '../controllers/job.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';
// import upload from '../middleware/upload.middleware';

const router = express.Router();

router.get('/employer', newAuthMiddleware, jobController.getJobsByUserId);
router.get('/applicant', newAuthMiddleware, jobController.getJobsByApplicant);
router.get('/search', jobController.searchJob);
router.get('/filter', jobController.filterJob);
router.post('/post-job', newAuthMiddleware, jobController.postJob);

router.get('/:job_id', jobController.getApplicationsByJobId);

router.post('/:id/save', newAuthMiddleware, jobController.saveJob);
router.delete('/:id/unsave', newAuthMiddleware, jobController.unSaveJob);
router.post('/:id/apply', newAuthMiddleware, jobController.applyForJob);
router.get('/:id/status', newAuthMiddleware, jobController.getStatus);
router.put('/:id/accept', jobController.acceptApplication);
router.put('/:id/reject', jobController.rejectApplication);

router.get('/:id', jobController.getJobById);
router.get('/', jobController.getJobs);

export default router;
