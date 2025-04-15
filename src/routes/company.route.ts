import express from 'express';
import * as companyController from '../controllers/company.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer';

const router = express.Router();

router.get('/updates', companyController.getAllCompaniesUpdates); //remaining in postman
router.get('/', companyController.getAllCompanies); //remaining in postman
router.get('/:id', companyController.getCompanyById); //remaining in postman
router.get('/:update_id/updates', companyController.getCompanyUpdateById); //remaining in postman
router.post('/', newAuthMiddleware, companyController.createCompany);
router.put('/:id', newAuthMiddleware, companyController.updateCompany); //update company
router.post('/job', newAuthMiddleware, companyController.postJob); //post a job
router.get('/:id/getalljob', newAuthMiddleware, companyController.getJobs); //get all jobs
router.post('/:id/update', newAuthMiddleware, companyController.postUpdate); //post an update
router.get('/:id/followers-list', newAuthMiddleware, companyController.getCompanyFollowers); //getting followers list
router.delete(
	'/:company_id/followers/:user_id',
	newAuthMiddleware,
	companyController.removeFollower,
); //remaining in postman
router.get('/:company_id/applications', newAuthMiddleware, companyController.getJobApplications);
router.get(
	'/:company_id/followers-analytics',
	newAuthMiddleware,
	companyController.getCompanyFollowersAnalytics,
);
router.get(
	'/:company_id/visitors',
	newAuthMiddleware,
	companyController.getCompanyVisitorsAnalytics,
);
router.post('/:company_id/view', newAuthMiddleware, companyController.logCompanyView);
router.get('/:update_id/content', newAuthMiddleware, companyController.getDailyContentAnalytics);
router.post(
	'/logo/:company_id',
	newAuthMiddleware,
	upload.single('file'),
	companyController.updateLogo,
);

export default router;
