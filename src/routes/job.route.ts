import express from 'express';
import * as jobController from '../controllers/job.controller';
// import upload from '../middleware/upload.middleware';

const router = express.Router();

router.get('/:id', jobController.getJobById);

export default router;
