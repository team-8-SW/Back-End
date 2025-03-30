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
