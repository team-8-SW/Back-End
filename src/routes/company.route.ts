import express from 'express';
import * as companyController from '../controllers/company.controller';
// import upload from '../middleware/upload.middleware';
import { newAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.post('/', newAuthMiddleware, companyController.createCompany);
router.put('/:id', newAuthMiddleware, companyController.updateCompany); //update company
router.post('/job', newAuthMiddleware, companyController.postJob);

export default router;
