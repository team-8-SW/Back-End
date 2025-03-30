import express from 'express';
import * as jobController from '../controllers/job.controller';
// import upload from '../middleware/upload.middleware';

const router = express.Router();

router.get('/search', jobController.searchJob);
router.get('/filter', jobController.filterJob);

router.get('/:id', jobController.getJobById);

export default router;
