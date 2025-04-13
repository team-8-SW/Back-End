import express from 'express';
import * as companyController from '../controllers/company.controller';
// import upload from '../middleware/upload.middleware';
import { newAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.post('/', newAuthMiddleware, companyController.createCompany);
router.put('/:id', newAuthMiddleware, companyController.updateCompany); //update company
router.post('/job', newAuthMiddleware, companyController.postJob); //post a job
router.get('/getalljob', companyController.getJobs); //get all jobs
router.post('/:id/update', newAuthMiddleware, companyController.postUpdate); //post an update
router.get('/:id/followers-list', newAuthMiddleware, companyController.getCompanyFollowers); //getting followers list
router.delete(
	'/:company_id/followers/:user_id',
	newAuthMiddleware,
	companyController.removeFollower,
);
router.get('/:company_id/applications', newAuthMiddleware, companyController.getJobApplications);
router.get(
	'/:company_id/followers-analytics',
	newAuthMiddleware,
	companyController.getCompanyFollowersAnalytics,
);

export default router;
