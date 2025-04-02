import * as jobController from '../controllers/job.controller';
import * as jobService from '../services/job.service';
import { Request, Response } from 'express';

interface CustomRequest extends Request {
	user?: { user_id: string };
}

jest.mock('../services/job.service');
jest.mock('../config/db', () => ({
	knexInstance: {
		select: jest.fn(),
		where: jest.fn(),
		insert: jest.fn(),
		update: jest.fn(),
		del: jest.fn(),
	},
}));

describe('Search for jobs by keyword, location, and industry', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;

	beforeEach(() => {
		jsonMock = jest.fn();
		statusMock = jest.fn(() => ({ json: jsonMock }));

		req = {
			query: {
				keyword: 'developer',
				location: 'New York',
				industry: 'IT',
			},
		};

		res = {
			status: statusMock,
			json: jsonMock,
		} as Partial<Response>;
	});

	it('should return jobs are found', async () => {
		const mockJobs = [
			{
				id: '1',
				title: 'Software Engineer',
				location: 'Cairo',
				industry: 'IT',
			},
		];

		(jobService.searchJob as jest.Mock).mockResolvedValue(mockJobs);

		await jobController.searchJob(req as Request, res as Response);

		expect(jobService.searchJob).toHaveBeenCalledWith('developer', 'New York', 'IT');
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Job found successfully', job: mockJobs });
	});

	it('should return 404 if no matching jobs are found', async () => {
		(jobService.searchJob as jest.Mock).mockResolvedValue([]);

		await jobController.searchJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'No matched jobs found' });
	});

	it('should return 500 if an error occurs', async () => {
		(jobService.searchJob as jest.Mock).mockRejectedValue(new Error('Database error'));

		await jobController.searchJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
	});
});

describe('Filter jobs by experience level, company, and salary range', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;

	beforeEach(() => {
		jsonMock = jest.fn();
		statusMock = jest.fn(() => ({ json: jsonMock }));

		req = {
			query: {
				experienceLevel: 'developer',
				company: 'Orascom',
				minSalary: '80000',
				maxSalary: '100000',
			},
		};

		res = {
			status: statusMock,
			json: jsonMock,
		} as Partial<Response>;
	});

	it('should return filtered jobs successfully', async () => {
		const mockJobs = [
			{
				id: '1',
				title: 'Software Engineer',
				experience_level: 'Mid Level',
				company_id: '123',
				salary: 80000,
			},
		];

		(jobService.filterJob as jest.Mock).mockResolvedValue(mockJobs);

		await jobController.filterJob(req as Request, res as Response);

		expect(jobService.filterJob).toHaveBeenCalledWith('developer', 'Orascom', 80000, 100000);
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Job filtered  successfully',
			filteredJob: mockJobs,
		});
	});

	it('should return 404 if no matching jobs are found', async () => {
		(jobService.filterJob as jest.Mock).mockResolvedValue([]);

		await jobController.filterJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'No jobs found' });
	});

	it('should return 500 if an error occurs', async () => {
		(jobService.filterJob as jest.Mock).mockRejectedValue(new Error('Database error'));

		await jobController.filterJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
	});
});

describe('Save jobs to apply for later', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;

	beforeEach(() => {
		jsonMock = jest.fn();
		statusMock = jest.fn(() => ({ json: jsonMock }));

		req = {
			params: { id: 'job123' },
			user: { user_id: 'user456' },
		} as Partial<CustomRequest>;

		res = {
			status: statusMock,
			json: jsonMock,
		};
	});

	it('should return 200 if Job saved successfully', async () => {
		(jobService.getSavedJob as jest.Mock).mockResolvedValue(false);
		(jobService.saveJob as jest.Mock).mockResolvedValue(true);

		await jobController.saveJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Job saved successfully',
		});
	});

	it('should return 409 if Job already saved', async () => {
		(jobService.getSavedJob as jest.Mock).mockResolvedValue(true);

		await jobController.saveJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(409);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Job already saved',
		});
	});

	it('should return 401 if user not authorizaed', async () => {
		(req as Partial<CustomRequest>).user = undefined;

		await jobController.saveJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Unauthorized: No user found',
		});
	});

	it('should return 404 if job id not provided or invalid', async () => {
		(jobService.getSavedJob as jest.Mock).mockResolvedValue(false);
		(jobService.saveJob as jest.Mock).mockResolvedValue(null);

		await jobController.saveJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Job id is required' });
	});

	it('should return 500 if an error occurs', async () => {
		(jobService.getSavedJob as jest.Mock).mockRejectedValue(new Error('Database error'));

		await jobController.saveJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
	});
});

describe('Apply for a job', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let jsonMock: jest.Mock;
	let statusMock: jest.Mock;

	beforeEach(() => {
		jsonMock = jest.fn();
		statusMock = jest.fn(() => ({ json: jsonMock }));

		req = {
			params: { id: 'job123' },
			user: { user_id: 'user456' },
			body: {
				resume_url: 'https://example.com/resume.pdf',
				cover_letter: 'Excited to apply!',
			},
		} as Partial<CustomRequest>;

		res = {
			status: statusMock,
			json: jsonMock,
		};
	});

	it('should return 200 if Job applied successfully', async () => {
		(jobService.getAppliedJob as jest.Mock).mockResolvedValue(false);
		(jobService.applyForJob as jest.Mock).mockResolvedValue({ id: 'application123' });

		await jobController.applyForJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Job applied successfully',
			job: { id: 'application123' },
		});
	});

	it('should return 409 if Job already applied', async () => {
		(jobService.getAppliedJob as jest.Mock).mockResolvedValue(true);

		await jobController.applyForJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(409);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Job already applied',
		});
	});

	it('should return 401 if user not authorizaed', async () => {
		(req as Partial<CustomRequest>).user = undefined;

		await jobController.applyForJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Unauthorized: No user found',
		});
	});

	it('should return 404 if job id not provided or invalid', async () => {
		(jobService.getAppliedJob as jest.Mock).mockResolvedValue(false);
		(jobService.applyForJob as jest.Mock).mockResolvedValue(null);

		await jobController.applyForJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Job id is required' });
	});

	it('should return 500 if an error occurs', async () => {
		(jobService.getAppliedJob as jest.Mock).mockRejectedValue(new Error('Database error'));

		await jobController.applyForJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
	});
});
