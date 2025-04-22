import express from 'express';
import * as companyController from '../controllers/company.controller';
import { newAuthMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer';

const router = express.Router();

router.get('/updates', companyController.getAllCompaniesUpdates); //remaining in postman
router.get('/', companyController.getAllCompanies); //remaining in postman
router.get('/:id', companyController.getCompanyById); //remaining in postman
router.get('/:company_id/updates', companyController.getUpdatesByCompanyId); //remaining in postman
router.post('/', newAuthMiddleware, upload.single('file'), companyController.createCompany);
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
router.get('/:company_id/content', newAuthMiddleware, companyController.getDailyContentAnalytics);
router.post(
	'/logo/:company_id',
	newAuthMiddleware,
	upload.single('file'),
	companyController.updateLogo,
);
router.post('/:update_id/impressions', newAuthMiddleware, companyController.addImpression); // Add impression
router.post('/:update_id/reactions', newAuthMiddleware, companyController.addReaction); // Add reaction
router.post('/:update_id/comments', newAuthMiddleware, companyController.addComment); // Add comment
router.post('/:update_id/reposts', newAuthMiddleware, companyController.addRepost); // Add repost
router.post(
	'/cover/:company_id',
	newAuthMiddleware,
	upload.single('file'),
	companyController.updateCoverPhoto,
); //add cover photo

export default router;
