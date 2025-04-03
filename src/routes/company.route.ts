import express from 'express';
import * as companyController from '../controllers/company.controller';
// import upload from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.post('/', companyController.createCompany);
router.put('/:id', companyController.updateCompany);

export default router;
