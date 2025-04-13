import * as companyController from '../controllers/company.controller';
import * as companyService from '../services/company.service';
import { Request, Response } from 'express';

jest.mock('../services/company.service');

jest.mock('../config/db', () => ({
	knexInstance: {
		select: jest.fn(),
		where: jest.fn(),
		insert: jest.fn(),
		update: jest.fn(),
		del: jest.fn(),
	},
}));

describe(' Create a company profile', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		statusMock = jest.fn().mockReturnThis();
		jsonMock = jest.fn();

		res = {
			status: statusMock,
			json: jsonMock,
		} as Partial<Response>;
	});

	it('should return 401 if user is not authorized', async () => {
		req = {
			body: {},
			user: undefined,
		} as any;

		await companyController.createCompany(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
	});

	it('should create company and return status 200', async () => {
		const mockCompany = {
			id: '123',
			name: 'Test Company',
			admin_user_id: 'user-id',
		};

		(companyService.createCompany as jest.Mock).mockResolvedValue(mockCompany);

		req = {
			body: { name: 'Test Company' },
			user: { user_id: 'user-id' },
		} as any;

		await companyController.createCompany(req as Request, res as Response);

		expect(companyService.createCompany).toHaveBeenCalledWith({
			name: 'Test Company',
			admin_user_id: 'user-id',
		});
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Company created successfully',
			company: mockCompany,
		});
	});

	it('should handle errors and return status 500', async () => {
		(companyService.createCompany as jest.Mock).mockRejectedValue(new Error('DB error'));

		req = {
			body: { name: 'Test Company' },
			user: { user_id: 'user-id' },
		} as any;

		await companyController.createCompany(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server Error' });
	});
});
