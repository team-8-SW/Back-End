import { Request, Response } from 'express';
import * as companyService from '../services/company.service';
import * as companyModel from '../models/company.model';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../utils/cloudinary';

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

export const getUpdatesByCompanyId = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { company_id } = req.params;
		const update = await companyService.getUpdateByCompanyId(company_id);
		res.status(200).json(update);
	} catch (error) {
		res.status(500).json({ error: 'Internal server Error' });
	}
};

export const createCompany = async (req: Request, res: Response) => {
	try {
		const companyData = req.body;
		// if (!companyData.name) {
		// 	return res.status(400).json({ message: 'Company name is required' });
		// }
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;
		if (!admin_user_id) return res.status(401).json({ message: 'Unauthorized' });

		// eslint-disable-next-line @typescript-eslint/naming-convention
		let logo_url: string | undefined = undefined;

		if (req.file) {
			logo_url = await uploadLogoToCloudinary(req.file);
		}

		const newCompany = await companyService.createCompany({
			...companyData,
			admin_user_id,
			logo_url,
		});
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
		const { company_id } = req.params;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const admin_user_id = (req as any).user?.user_id;

		const company = await companyService.getCompanyById(company_id);
		if (!company || company.admin_user_id !== admin_user_id) {
			return res.status(403).json({ message: 'Unauthorized action' });
		}

		const stats = await companyService.getCompanyContentAnalytics(company_id);

		res.status(200).json(stats);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch content analytics' });
	}
};

export const updateLogo = async (req: Request, res: Response) => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const { company_id } = req.params;
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const admin_user_id = (req as any).user?.user_id;
	const company = await companyService.getCompanyById(company_id);
	if (!company || company.admin_user_id !== admin_user_id) {
		return res.status(403).json({ message: 'Unauthorized action' });
	}

	const file = req.file;

	if (!file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	const allowedMimeTypes = ['image/jpeg', 'image/png'];
	if (!allowedMimeTypes.includes(file.mimetype)) {
		return res.status(400).json({ error: 'Invalid file type. Only JPEG and PNG are allowed.' });
	}

	try {
		const uploadToCloudinary = (): Promise<any> => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{
						folder: 'linkedin-clone/cover-photos',
						resource_type: 'image',
						type: 'upload',
					},
					(error, result) => {
						if (error) return reject(error);
						resolve(result);
					},
				);
				stream.end(file.buffer);
			});
		};

		const result = await uploadToCloudinary();
		const updatedProfile = await companyService.updateLogo(company_id, result.secure_url);

		res.status(200).json({
			message: 'logo updated successfully',
			LogoPhotoUrl: result.secure_url,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const uploadLogoToCloudinary = async (file: Express.Multer.File): Promise<string> => {
	if (!file) {
		throw new Error('No file uploaded');
	}

	const allowedMimeTypes = ['image/jpeg', 'image/png'];
	if (!allowedMimeTypes.includes(file.mimetype)) {
		throw new Error('Invalid file type. Only JPEG and PNG are allowed.');
	}

	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: 'linkedin-clone/company-logos',
				resource_type: 'image',
				type: 'upload',
			},
			(error, result) => {
				if (error) return reject(error);
				if (!result) return reject(new Error('No result from Cloudinary'));
				resolve(result.secure_url);
			},
		);
		stream.end(file.buffer);
	});
};

export const addImpression = async (req: Request, res: Response) => {
	try {
		const { update_id } = req.params;
		const user_id = (req as any).user?.user_id;

		if (!update_id) {
			return res.status(400).json({ message: 'Update ID is required' });
		}

		if (!user_id) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const impression = await companyService.addImpression(update_id, user_id);

		res.status(201).json({
			message: 'Impression added successfully',
			impression,
		});
	} catch (error) {
		console.error('Error adding impression:', error);

		if (error instanceof Error) {
			if (error.message === 'Update not found') {
				return res.status(404).json({ message: 'Update not found' });
			}
			if (error.message === 'Impression already exists') {
				return res.status(409).json({ message: 'Impression already exists' });
			}
		}

		res.status(500).json({ error: 'Internal server error' });
	}
};

export const addReaction = async (req: Request, res: Response) => {
	try {
		const { update_id } = req.params;
		const { type } = req.body;
		const user_id = (req as any).user?.user_id;

		if (!type) {
			return res.status(400).json({ error: 'Reaction type is required' });
		}

		// Call service to add reaction
		const reaction = await companyService.addReaction(update_id, user_id, type);

		res.status(201).json({
			message: 'Reaction added successfully',
			reaction,
		});
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const addComment = async (req: Request, res: Response) => {
	try {
		const { update_id } = req.params;
		const { content } = req.body;
		const user_id = (req as any).user?.user_id;

		if (!content) {
			return res.status(400).json({ error: 'Content is required for comment' });
		}

		// Call service to add comment
		const comment = await companyService.addComment(update_id, user_id, content);

		res.status(201).json({
			message: 'Comment added successfully',
			comment,
		});
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const addRepost = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { update_id } = req.params;
		const userId = (req as any).user?.user_id;

		if (!update_id) {
			return res.status(400).json({ error: 'Missing updateId' });
		}

		if (!userId) {
			return res.status(400).json({ error: 'Missing userId' });
		}

		const repost = await companyService.addRepost(update_id, userId);

		res.status(201).json({
			message: 'Repost added successfully',
			repost,
		});
	} catch (error) {
		console.error('Error in addRepost:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const getCommentCount = async (req: Request, res: Response) => {
	try {
		const { update_id } = req.params;
		const userId = (req as any).user?.user_id;
		// if (!userId) {
		// 	return res.status(401).json({ message: 'Unauthorized' });
		// }

		if (!update_id) {
			return res.status(400).json({ message: 'Update ID is required' });
		}

		const count = await companyService.getCommentCountByUpdateId(update_id);
		res.json({ update_id, commentCount: count });
	} catch (err) {
		console.error('Error fetching comment count:', err);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const updateCoverPhoto = async (req: Request, res: Response) => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const { company_id } = req.params;
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const admin_user_id = (req as any).user?.user_id;
	const company = await companyService.getCompanyById(company_id);
	if (!company || company.admin_user_id !== admin_user_id) {
		return res.status(403).json({ message: 'Unauthorized action' });
	}

	const file = req.file;

	if (!file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	const allowedMimeTypes = ['image/jpeg', 'image/png'];
	if (!allowedMimeTypes.includes(file.mimetype)) {
		return res.status(400).json({ error: 'Invalid file type. Only JPEG and PNG are allowed.' });
	}

	try {
		const uploadToCloudinary = (): Promise<any> => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{
						folder: 'linkedin-clone/cover-photos',
						resource_type: 'image',
						type: 'upload',
					},
					(error, result) => {
						if (error) return reject(error);
						resolve(result);
					},
				);
				stream.end(file.buffer);
			});
		};

		const result = await uploadToCloudinary();
		const updatedProfile = await companyService.updateCoverPhoto(company_id, result.secure_url);

		res.status(200).json({
			message: 'Cover photo updated successfully',
			coverPhotoUrl: result.secure_url,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
