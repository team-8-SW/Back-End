import * as companyController from '../controllers/company.controller';
import * as companyService from '../services/company.service';
import { Request, Response } from 'express';

console.error = jest.fn();

interface CustomRequest extends Request {
	user?: { user_id: string };
}

jest.mock('../services/company.service', () => ({
	createCompany: jest.fn(),
	getCompanyById: jest.fn(),
	updateCompany: jest.fn(),
	postJob: jest.fn(),
	postUpdate: jest.fn(),
}));

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
	let req: Partial<CustomRequest>;
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

describe('Updating company profile', () => {
	let req: Partial<CustomRequest>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		statusMock = jest.fn().mockReturnThis();
		jsonMock = jest.fn();

		req = {
			params: { id: '123' },
			body: { name: 'Updated Company' },
			user: { user_id: 'admin123' },
		} as Partial<CustomRequest>;

		res = {
			status: statusMock,
			json: jsonMock,
		} as Partial<Response>;
	});

	it('should return 401 if user is not authorized', async () => {
		req.user = undefined;

		await companyController.updateCompany(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
	});

	it('should return 404 if company is not found', async () => {
		(companyService.updateCompany as jest.Mock).mockResolvedValue(null);

		await companyController.updateCompany(req as Request, res as Response);

		expect(companyService.updateCompany).toHaveBeenCalledWith('123', 'admin123', {
			name: 'Updated Company',
		});
		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Company not found' });
	});

	it('should return 200 if company is updated successfully', async () => {
		(companyService.updateCompany as jest.Mock).mockReturnValue({
			id: '123',
			name: 'Updated Company',
		});

		await companyController.updateCompany(req as Request, res as Response);

		expect(companyService.updateCompany).toHaveBeenCalledWith('123', 'admin123', {
			name: 'Updated Company',
		});
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Company updated succesfully' });
	});

	it('should return 500 0n service error', async () => {
		(companyService.updateCompany as jest.Mock).mockRejectedValue(new Error('Database error'));

		await companyController.updateCompany(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
	});
});

describe('post a job listing', () => {
	let req: Partial<CustomRequest>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		statusMock = jest.fn().mockReturnThis();
		jsonMock = jest.fn();

		req = {
			params: { company_id: '123' },
			body: { title: 'Software Engineer', company_id: 'company123' },
			user: { user_id: 'admin123' },
		} as Partial<CustomRequest>;

		res = {
			status: statusMock,
			json: jsonMock,
		} as Partial<Response>;

		(companyService.getCompanyById as jest.Mock).mockResolvedValue({
			id: 'company123',
			name: 'Test Company',
			admin_user_id: 'admin123',
		});

		(companyService.postJob as jest.Mock).mockResolvedValue({
			id: 'job456',
			title: 'Software Engineer',
		});
	});

	it('should return 400 if company id is missing', async () => {
		req.body.company_id = undefined;

		await companyController.postJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Company ID is required to post a job' });
	});

	it('should return 401 if user is not authorized', async () => {
		req.user = undefined;

		await companyController.postJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
	});

	it('should return 404 if company is not found', async () => {
		(companyService.getCompanyById as jest.Mock).mockResolvedValue(null);

		await companyController.postJob(req as Request, res as Response);

		expect(companyService.getCompanyById).toHaveBeenCalledWith('company123');
		expect(statusMock).toHaveBeenCalledWith(404);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Company not found' });
	});

	it('should return 200 if job is posted successfully', async () => {
		(companyService.getCompanyById as jest.Mock).mockResolvedValue({ name: 'Test Company' });
		(companyService.postJob as jest.Mock).mockResolvedValue({
			id: 'job456',
			title: 'Frontend Developer',
		});

		await companyController.postJob(req as Request, res as Response);

		expect(companyService.getCompanyById).toHaveBeenCalledWith('company123');
		expect(companyService.postJob).toHaveBeenCalledWith(
			'company123',
			'admin123',
			'Test Company',
			req.body,
		);
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Job listed succesfully',
			job: { id: 'job456', title: 'Frontend Developer' },
		});
	});

	it('should return 500 if service throws an error', async () => {
		(companyService.getCompanyById as jest.Mock).mockResolvedValue({
			id: 'company123',
			name: 'Test Company',
			admin_user_id: 'admin123',
		});
		(companyService.postJob as jest.Mock).mockRejectedValue(new Error('DB error'));

		await companyController.postJob(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
	});
});

describe('postUpdate', () => {
	let req: Partial<CustomRequest>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		statusMock = jest.fn().mockReturnThis();
		jsonMock = jest.fn();

		req = {
			params: { id: 'company123' },
			body: {
				title: 'New feature launch!',
				content: 'We are excited to announce our new feature...',
			},
			user: {
				user_id: 'admin123',
			},
		} as Partial<CustomRequest>;

		res = {
			status: statusMock,
			json: jsonMock,
		};
	});

	it('should return 401 if admin_user_id is missing', async () => {
		req.user = undefined;

		await companyController.postUpdate(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
	});

	it('should return 400 if title or content is missing', async () => {
		req.body.title = '';
		req.body.content = '';

		await companyController.postUpdate(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(400);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'All fields are required' });
	});

	it('should return 200 with update data if successful', async () => {
		const mockUpdate = { id: 'update001', title: req.body.title, content: req.body.content };

		(companyService.postUpdate as jest.Mock).mockResolvedValue(mockUpdate);

		await companyController.postUpdate(req as Request, res as Response);

		expect(companyService.postUpdate).toHaveBeenCalledWith(
			'company123',
			'admin123',
			'New feature launch!',
			'We are excited to announce our new feature...'
		);
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			message: 'Update posted successfully',
			update: mockUpdate,
		});
	});

	it('should return 500 if service throws an error', async () => {
		(companyService.postUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

		await companyController.postUpdate(req as Request, res as Response);

		expect(statusMock).toHaveBeenCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
	});
});
