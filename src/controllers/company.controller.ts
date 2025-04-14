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

export const getAllCompaniesUpdates = async (req: Request, res: Response) => {
	try {
		const updates = await companyService.getAllUpdates();
		res.status(200).json(updates);
	} catch (error) {
		console.error('Error getting all updates:', error);
		res.status(500).json({ error: 'Internal server Error' });
	}
};

export const getCompanyUpdateById = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { update_id } = req.params;
		const update = await companyService.getUpdateById(update_id);
		res.status(200).json(update);
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
		res.status(200).json({ message: 'Company created successfully', company: newCompany });
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

		if (!job.company_id) {
			return res.status(400).json({ message: 'Company ID is required to post a job' });
		}
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;
		if (!admin_user_id) return res.status(401).json({ message: 'Unauthorized' });

		const company = await companyService.getCompanyById(job.company_id);
		if (!company) return res.status(404).json({ message: 'Company not found' });

		const newJob = await companyService.postJob(
			job.company_id,
			admin_user_id,
			company.name,
			job,
		);

		res.status(200).json({ message: 'Job listed succesfully', job: newJob });
	} catch (error) {
		console.error('Error listing job', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
//getJobs
export const getJobs = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const company_id = req.params.id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;
		if (!admin_user_id) return res.status(401).json({ message: 'Unauthorized' });

		const jobs = await companyService.getJobs(company_id);
		res.status(200).json({ message: 'Job listings returned successfully', jobs });
	} catch (error) {
		console.error('Error getting jobs', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const postUpdate = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const company_id = req.params.id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;
		if (!admin_user_id) return res.status(401).json({ message: 'Unauthorized' });

		const { title, content } = req.body;
		if (!title || !content) return res.status(400).json({ message: 'All fields are required' });

		const newUpdate = await companyService.postUpdate(
			company_id,
			admin_user_id,
			title,
			content,
		);

		res.status(200).json({ message: 'Update posted successfully', update: newUpdate });
	} catch (error) {
		console.error('Error posting update', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getCompanyFollowers = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const company_id = req.params.id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;
		const company = await companyService.getCompanyById(company_id);
		if (!company || company.admin_user_id !== admin_user_id) {
			return res.status(403).json({ message: 'Access denied' });
		}

		const followers = await companyService.getCompanyFollowers(company_id);

		res.status(200).json(followers);
	} catch (error) {
		console.error('Error getting followers list', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const removeFollower = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { company_id, user_id } = req.params;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;

		const company = await companyService.getCompanyById(company_id);
		if (!company || company.admin_user_id !== admin_user_id) {
			return res.status(403).json({ message: 'Unauthorized action' });
		}

		await companyService.removeFollower(company_id, user_id);
		res.status(200).json({ message: 'Follower removed successfully' });
	} catch (error) {
		console.error('Error getting followers list', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getJobApplications = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { company_id } = req.params;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;

		const company = await companyService.getCompanyById(company_id);
		if (!company || company.admin_user_id !== admin_user_id) {
			return res.status(403).json({ message: 'Unauthorized action' });
		}

		const applications = await companyService.getJobApplications(company_id);
		res.status(200).json({ applications });
	} catch (error) {
		console.error('Error getting job applications', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getCompanyFollowersAnalytics = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { company_id } = req.params;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;

		const company = await companyService.getCompanyById(company_id);
		if (!company || company.admin_user_id !== admin_user_id) {
			return res.status(403).json({ message: 'Unauthorized action' });
		}

		const [totalFollowers, newFollowersLast30days, newFollowersPerDay, followersList] =
			await Promise.all([
				companyService.getCompanyTotalFollowers(company_id),
				companyService.getFollowersLast30(company_id),
				companyService.getFollowersPerDay(company_id),
				companyService.getCompanyFollowers(company_id),
			]);

		res.status(200).json({
			totalFollowers,
			newFollowersLast30days,
			newFollowersPerDay,
			followersList,
		});
	} catch (error) {
		console.error('Error getting company analytics', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getCompanyVisitorsAnalytics = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { company_id } = req.params;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;

		const company = await companyService.getCompanyById(company_id);
		if (!company || company.admin_user_id !== admin_user_id) {
			return res.status(403).json({ message: 'Unauthorized action' });
		}

		const totalViews = await companyService.getTotalPageViews(company_id);
		const viewsPerDay = await companyService.getViewsPerDay(company_id);

		res.status(200).json({ totalViews, viewsPerDay });
	} catch (error) {
		console.error('Error fetching analytics', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const logCompanyView = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { company_id } = req.params;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;

		const company = await companyService.getCompanyById(company_id);
		if (!company || company.admin_user_id !== admin_user_id) {
			return res.status(403).json({ message: 'Unauthorized action' });
		}

		const alreadyLogged = await companyService.pageViewService(company_id, admin_user_id);

		if (alreadyLogged)
			return res.status(200).json({ message: 'View already logged in the last 30 days' });

		res.status(201).json({ message: 'Page view logged' });
	} catch (error) {
		console.error('Error logging view', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getDailyContentAnalytics = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { update_id } = req.params;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;

		const stats = await companyService.getContentAnalytics(update_id);

		res.status(200).json(stats);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch content analytics' });
	}
};


