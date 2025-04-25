import { Request, Response } from 'express';
import * as jobService from '../services/job.service';
import { ispremium } from '../services/users.service';

export const getJobById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const job = await jobService.getJobById(id);

		if (!job) return res.status(400).json({ message: 'Job not found' });

		res.status(200).json({ message: 'Job found successfully', job });
	} catch (error) {
		console.error('Error finding job', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getJobs = async (req: Request, res: Response) => {
	try {
		const jobs = await jobService.getAllJobs();
		res.status(200).json({ message: 'Jobs found successfully', jobs });
	} catch (error) {
		console.error('Error finding jobs', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getJobsByApplicant = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const user_id = (req as any).user?.user_id;

		if (!user_id) {
			return res.status(401).json({ message: 'Unauthorized: No user found' });
		}

		const job = await jobService.getSavedJobsByApplicaintId(user_id);
		res.status(200).json({ message: 'Saved Jobs found successfully', job });
	} catch (error) {
		console.error('Error finding job', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getJobsByUserId = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const user_id = (req as any).user?.user_id;

		if (!user_id) {
			return res.status(401).json({ message: 'Unauthorized: No user found' });
		}

		const job = await jobService.getJobsByUserId(user_id);
		res.status(200).json({ message: 'Jobs found successfully', job });
	} catch (error) {
		console.error('Error finding jobs', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getApplicationsByJobId = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { job_id } = req.params;

		const applications = await jobService.getApplicationsByJobId(job_id);
		res.status(200).json({ message: 'Applications retreived successfully', applications });
	} catch (error) {
		console.error('Error retreiving applications', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const searchJob = async (req: Request, res: Response) => {
	try {
		const { keyword, location, industry } = req.query;

		const job = await jobService.searchJob(
			keyword as string,
			location as string,
			industry as string,
		);
		if (!job || job.length == 0)
			return res.status(404).json({ message: 'No matched jobs found' });

		res.status(200).json({ message: 'Job found successfully', job });
	} catch (error) {
		console.error('Error finding job', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const filterJob = async (req: Request, res: Response) => {
	try {
		const { experienceLevel, company, minSalary, maxSalary } = req.query;

		const filteredJob = await jobService.filterJob(
			experienceLevel as string,
			company as string,
			minSalary ? Number(minSalary) : undefined,
			maxSalary ? Number(maxSalary) : undefined,
		);

		if (!filteredJob || filteredJob.length == 0)
			return res.status(404).json({ message: 'No jobs found' });

		res.status(200).json({ message: 'Job filtered  successfully', filteredJob });
	} catch (error) {
		console.error('Error filtering job', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const saveJob = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const job_id = req.params.id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const user_id = (req as any).user?.user_id;

		if (!user_id) {
			return res.status(401).json({ message: 'Unauthorized: No user found' });
		}

		const existingSavedJob = await jobService.getSavedJob(user_id, job_id);
		if (existingSavedJob) return res.status(409).json({ message: 'Job already saved' });

		const savedJob = await jobService.saveJob(user_id, job_id);
		if (!savedJob) return res.status(404).json({ message: 'Job id is required' });

		res.status(200).json({ message: 'Job saved successfully' });
	} catch (error) {
		console.error('Error saving job', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const unSaveJob = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const job_id = req.params.id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const user_id = (req as any).user?.user_id;

		if (!user_id) {
			return res.status(401).json({ message: 'Unauthorized: No user found' });
		}

		const unSavedJob = await jobService.unSaveJob(user_id, job_id);

		res.status(200).json({ message: 'Job unsaved successfully' });
	} catch (error) {
		console.error('Error unsaving job', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const postJob = async (req: Request, res: Response) => {
	try {
		const job = req.body;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const user_id = (req as any).user?.user_id;

		const newJob = await jobService.postJob(user_id, job);

		res.status(200).json({ message: 'Job listed succesfully', job: newJob });
	} catch (error) {
		console.error('Error listing job', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
export const applyForJob = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const applicant_id = (req as any).user?.user_id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const job_id = req.params.id;

		const {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			first_name,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			last_name,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			phone_number,
			email,
			country,
			address,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			resume_url,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			cover_letter,
		} = req.body;

		if (!applicant_id) {
			return res.status(401).json({ message: 'Unauthorized: No user found' });
		}

		// // Validate required fields
		// if (!first_name || !last_name || !phone_number || !email || !country || !resume_url) {
		// 	return res.status(400).json({ message: 'Missing required application fields' });
		// }

		const existingAppliedJob = await jobService.getAppliedJob(applicant_id, job_id);
		if (existingAppliedJob) {
			return res.status(409).json({ message: 'Job already applied' });
		}

		const isPremium = await ispremium(applicant_id);
		if (!isPremium) {
			const overApplicationLimit = await jobService.checkJobApplicationLimit(applicant_id);
			if (overApplicationLimit) {
				return res
					.status(403)
					.json({ message: 'Application limit reached. Upgrade to premium.' });
			}
		}

		const job = await jobService.applyForJob(
			job_id,
			first_name,
			last_name,
			phone_number,
			email,
			country,
			address,
			resume_url,
			cover_letter,
			applicant_id,
		);

		res.status(200).json({ message: 'Job applied successfully', job });
	} catch (error) {
		console.error('Error applying for job:', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getStatus = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const applicant_id = (req as any).user?.user_id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const job_id = req.params.id;

		if (!applicant_id) {
			return res.status(401).json({ message: 'Unauthorized: No user found' });
		}

		const application = await jobService.getApplicationStatus(applicant_id, job_id);

		if (!application)
			return res.status(404).json({ message: 'No application found for this job' });

		return res.status(200).json({ status: application.status });
	} catch (error) {
		console.error('Error filtering job', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};
