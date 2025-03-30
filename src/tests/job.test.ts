import * as jobController from '../controllers/job.controller';
import * as jobService from '../services/job.service';
import { Request, Response } from 'express';

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
