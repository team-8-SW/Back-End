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
