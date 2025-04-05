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
router.post('/:id/update', newAuthMiddleware, companyController.postUpdate); //post an update
router.get('/:id/followers-list', newAuthMiddleware, companyController.getCompanyFollowers); //getting followers list
router.delete(
	'/:company_id/followers/:user_id',
	newAuthMiddleware,
	companyController.removeFollower,
);

export default router;
