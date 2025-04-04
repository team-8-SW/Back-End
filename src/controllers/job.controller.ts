import { Request, Response } from 'express';
import * as jobService from '../services/job.service';

export const getJobById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const job = await jobService.getJobById(id);

		if (!job) return res.status(400).json({ message: 'Job not found' });

		res.status(200).json({ message: 'Job found successfully' });
	} catch (error) {
		console.error('Error finding job', error);
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
		console.error('Error filtering job', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const applyForJob = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const applicant_id = (req as any).user?.user_id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const job_id = req.params.id;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { resume_url, cover_letter } = req.body;

		if (!applicant_id) {
			return res.status(401).json({ message: 'Unauthorized: No user found' });
		}

		const existingAppliedJob = await jobService.getAppliedJob(applicant_id, job_id);
		if (existingAppliedJob) return res.status(409).json({ message: 'Job already applied' });

		const appliedJob = await jobService.applyForJob(
			applicant_id,
			job_id,
			resume_url,
			cover_letter,
		);
		if (!appliedJob) return res.status(404).json({ message: 'Job id is required' });

		res.status(200).json({ message: 'Job applied successfully', job: appliedJob });
	} catch (error) {
		console.error('Error filtering job', error);
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
