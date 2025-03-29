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
		const newCompany = await companyService.createCompany(companyData);
		res.status(201).json(newCompany);
	} catch (error) {
		res.status(500).json({ error: 'Internal server Error' });
	}
};

export const updateCompany = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { logo, description, industry, location } = req.body;

		if (!id || (!logo && !description && !industry && !location))
			return res
				.status(400)
				.json({ message: 'Invalid!, provide at least one field to update' });

		const updates: Partial<companyModel.company> = {};
		if (logo) updates.logo_url = logo;
		if (description) updates.description = description;
		if (industry) updates.industry = industry;
		if (location) updates.location = location;

		const updatedCompany = await companyService.updateCompany(id, updates);
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
