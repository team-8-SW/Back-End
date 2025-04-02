import express from 'express';
import * as jobController from '../controllers/job.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';
// import upload from '../middleware/upload.middleware';

const router = express.Router();

router.get('/search', jobController.searchJob);
router.get('/filter', jobController.filterJob);
router.post('/:id/save', newAuthMiddleware, jobController.saveJob);
router.post('/:id/apply', newAuthMiddleware, jobController.applyForJob);

router.get('/:id', jobController.getJobById);

export default router;
