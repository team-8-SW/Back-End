import { Request, Response } from 'express';
import * as companyService from '../services/company.service';
import * as companyModel from '../models/company.model';
import { v4 as uuidv4 } from 'uuid';

export const getAllCompanies = async (req: Request, res: Response) => {
	try {
		const companies = await companyService.getAllCompanies();
		res.json(companies);
	} catch (error) {
		res.status(500).json({ error: 'Internal server Error' });
	}
};

export const getCompanyById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const company = await companyService.getCompanyById(id);
		res.json(company);
	} catch (error) {
		res.status(500).json({ error: 'Internal server Error' });
	}
};

export const createCompany = async (req: Request, res: Response) => {
	try {
		const companyData = req.body;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;
		if (!admin_user_id) return res.status(401).json({ message: 'Unauthorized' });

		const newCompany = await companyService.createCompany({ ...companyData, admin_user_id });
		res.status(201).json({ message: 'Company created successfully', company: newCompany });
	} catch (error) {
		console.error('Error creating company:', error);
		res.status(500).json({ error: 'Internal server Error' });
	}
};

export const updateCompany = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;
		if (!admin_user_id) return res.status(401).json({ message: 'Unauthorized' });

		const updatedData = req.body;
		const updatedCompany = await companyService.updateCompany(id, admin_user_id, updatedData);
		if (!updatedCompany) {
			res.status(404).json({ message: 'Company not found' });
		}
		res.status(200).json({ message: 'Company updated succesfully' });
	} catch (error) {
		console.error('Error updating comapny', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const postJob = async (req: Request, res: Response) => {
	try {
		const job = req.body;

		const company = companyService.getCompanyById(job.company_id);

		if (!company) return res.status(404).json({ message: 'Company not found' });

		const newJob = await companyService.postJob({
			id: uuidv4(),
			user_id: job.user_id,
			company_id: job.company_id,
			company_name: job.company_name,
			title: job.title,
			description: job.description,
			location: job.location,
			employment_type: job.employment_type,
			workplace_type: job.workplace_type,
			experience_level: job.experience_level,
			expires_at: job.expires_at,
		});

		res.status(200).json({ message: 'Job listed succesfully', job: newJob });
	} catch (error) {
		console.error('Error listing job', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
