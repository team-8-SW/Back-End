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
	getCompanyFollowers: jest.fn(),
	getJobApplications: jest.fn(),
	getCompanyFollowersAnalytics: jest.fn(),
	getCompanyVisitorsAnalytics: jest.fn(),
	logCompanyView: jest.fn(),
	getDailyContentAnalytics: jest.fn(),
	getCompanyTotalFollowers: jest.fn(),
	getFollowersLast30: jest.fn(),
	getFollowersPerDay: jest.fn(),
	getTotalPageViews: jest.fn(),
	getViewsPerDay: jest.fn(),
	getUpdateById: jest.fn(),
	pageViewService: jest.fn(),
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
			'We are excited to announce our new feature...',
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

describe('Manage company followers', () => {
	let req: Partial<CustomRequest>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		statusMock = jest.fn().mockReturnThis();
		jsonMock = jest.fn();

		req = {
			params: { id: 'user123' },
			user: { user_id: 'admin123' },
		} as Partial<CustomRequest>;

		res = {
			status: statusMock,
			json: jsonMock,
		};
	});

	it('should return 403 if user is not authorized', async () => {
		(companyService.getCompanyById as jest.Mock).mockResolvedValue({
			admin_user_id: 'otherUser',
		});

		await companyController.getCompanyFollowers(req as Request, res as Response);

		expect(statusMock).toHaveBeenLastCalledWith(403);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Access denied' });
	});

	it('should return 200 when successfully getting followers list', async () => {
		const mockCompany = { admin_user_id: 'admin123' };
		const mockFollowers = [{ id: 'user1' }, { id: 'user2' }];

		(companyService.getCompanyById as jest.Mock).mockResolvedValue(mockCompany);
		(companyService.getCompanyFollowers as jest.Mock).mockResolvedValue(mockFollowers);

		await companyController.getCompanyFollowers(req as Request, res as Response);

		expect(statusMock).toHaveBeenLastCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith(mockFollowers);
	});

	it('should return 500 with there is database error', async () => {
		(companyService.getCompanyById as jest.Mock).mockRejectedValue(new Error('DB error'));

		await companyController.getCompanyFollowers(req as Request, res as Response);

		expect(statusMock).toHaveBeenLastCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
	});
});

describe('Track job applications', () => {
	let req: Partial<CustomRequest>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		statusMock = jest.fn().mockReturnThis();
		jsonMock = jest.fn();

		req = {
			params: { id: 'user123' },
			user: { user_id: 'admin123' },
		} as Partial<CustomRequest>;

		res = {
			status: statusMock,
			json: jsonMock,
		};
	});

	it('should return 403 if user is not authorized', async () => {
		(companyService.getCompanyById as jest.Mock).mockResolvedValue({
			admin_user_id: 'notAdmin123',
		});

		await companyController.getJobApplications(req as Request, res as Response);

		expect(statusMock).toHaveBeenLastCalledWith(403);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized action' });
	});

	it('should return 200 when successfully getting followers list', async () => {
		const mockCompany = { admin_user_id: 'admin123' };
		const mockJobApplication = [{ id: 'app1' }, { id: 'app2' }];

		(companyService.getCompanyById as jest.Mock).mockResolvedValue(mockCompany);
		(companyService.getJobApplications as jest.Mock).mockResolvedValue(mockJobApplication);

		await companyController.getJobApplications(req as Request, res as Response);

		expect(statusMock).toHaveBeenLastCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({ applications: mockJobApplication });
	});

	it('should return 500 with there is database error', async () => {
		(companyService.getCompanyById as jest.Mock).mockRejectedValue(new Error('DB error'));

		await companyController.getJobApplications(req as Request, res as Response);

		expect(statusMock).toHaveBeenLastCalledWith(500);
		expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
	});
});

describe('Tracking company analytics', () => {
	let req: Partial<CustomRequest>;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;
	const mockCompany = { id: 'company123', admin_user_id: 'admin123' };

	beforeEach(() => {
		statusMock = jest.fn().mockReturnThis();
		jsonMock = jest.fn();

		req = {
			params: { company_id: 'company123', update_id: 'update123' },
			user: { user_id: 'admin123' },
		} as Partial<CustomRequest>;

		res = {
			status: statusMock,
			json: jsonMock,
		};
	});

	describe('Getting company followers analytics', () => {
		it('should return 200 with analytics data if authorized', async () => {
			(companyService.getCompanyById as jest.Mock).mockResolvedValue(mockCompany);
			(companyService.getCompanyTotalFollowers as jest.Mock).mockResolvedValue(50);
			(companyService.getFollowersLast30 as jest.Mock).mockResolvedValue(10);
			(companyService.getFollowersPerDay as jest.Mock).mockResolvedValue([]);
			(companyService.getCompanyFollowers as jest.Mock).mockResolvedValue([]);

			await companyController.getCompanyFollowersAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
			expect(jsonMock).toHaveBeenCalledWith({
				totalFollowers: 50,
				newFollowersLast30days: 10,
				newFollowersPerDay: [],
				followersList: [],
			});
		});

		it('should return 403 if user is not authorized', async () => {
			(companyService.getCompanyById as jest.Mock).mockResolvedValue({
				id: 'company123',
				admin_user_id: 'wrongadmin123',
			});

			await companyController.getCompanyFollowersAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(403);
			expect(jsonMock).toHaveBeenCalledWith({
				message: 'Unauthorized action',
			});
		});

		it('should return 500 when there is an error', async () => {
			(companyService.getCompanyById as jest.Mock).mockRejectedValue(new Error('DB error'));

			await companyController.getCompanyFollowersAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(500);
			expect(jsonMock).toHaveBeenCalledWith({
				error: 'Internal server error',
			});
		});
	});

	describe('Getting company visitors Analytics', () => {
		it('should return 200 with visitors analytics data when user is authorized', async () => {
			(companyService.getCompanyById as jest.Mock).mockResolvedValue(mockCompany);
			(companyService.getTotalPageViews as jest.Mock).mockResolvedValue(100);
			(companyService.getViewsPerDay as jest.Mock).mockResolvedValue([]);

			await companyController.getCompanyVisitorsAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
			expect(jsonMock).toHaveBeenCalledWith({ totalViews: 100, viewsPerDay: [] });
		});

		it('should return 403 if unauthorized', async () => {
			(companyService.getCompanyById as jest.Mock).mockResolvedValue({
				id: 'company123',
				admin_user_id: 'wrongUser',
			});

			await companyController.getCompanyVisitorsAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(403);
			expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized action' });
		});

		it('should return 500 on error', async () => {
			(companyService.getCompanyById as jest.Mock).mockRejectedValue(new Error('DB error'));

			await companyController.getCompanyVisitorsAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(500);
			expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	});

	describe('logCompanyView', () => {
		it('should return 200 if view already logged', async () => {
			(companyService.getCompanyById as jest.Mock).mockResolvedValue(mockCompany);
			(companyService.pageViewService as jest.Mock).mockResolvedValue(true);

			await companyController.logCompanyView(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
			expect(jsonMock).toHaveBeenCalledWith({
				message: 'View already logged in the last 30 days',
			});
		});

		it('should return 201 if view newly logged', async () => {
			(companyService.getCompanyById as jest.Mock).mockResolvedValue(mockCompany);
			(companyService.pageViewService as jest.Mock).mockResolvedValue(false);

			await companyController.logCompanyView(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(201);
			expect(jsonMock).toHaveBeenCalledWith({ message: 'Page view logged' });
		});

		it('should return 403 if unauthorized', async () => {
			(companyService.getCompanyById as jest.Mock).mockResolvedValue({
				id: 'company123',
				admin_user_id: 'wrongUser',
			});

			await companyController.logCompanyView(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(403);
			expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized action' });
		});

		it('should return 500 on error', async () => {
			(companyService.getCompanyById as jest.Mock).mockRejectedValue(new Error('DB error'));

			await companyController.logCompanyView(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(500);
			expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	});

	describe('getDailyContentAnalytics', () => {
		it('should return 200 with content analytics if authorized', async () => {
			(companyService.getUpdateById as jest.Mock).mockResolvedValue({
				update_id: 'update123',
				admin_user_id: 'admin123',
			});
			(companyService.getContentAnalytics as jest.Mock).mockResolvedValue({ views: 10 });

			await companyController.getDailyContentAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(200);
			expect(jsonMock).toHaveBeenCalledWith({ views: 10 });
		});

		it('should return 403 if unauthorized', async () => {
			(companyService.getUpdateById as jest.Mock).mockResolvedValue({
				update_id: 'update123',
				admin_user_id: 'wrongUser',
			});

			await companyController.getDailyContentAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(403);
			expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized action' });
		});

		it('should return 500 on error', async () => {
			(companyService.getUpdateById as jest.Mock).mockRejectedValue(new Error('DB error'));

			await companyController.getDailyContentAnalytics(req as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(500);
			expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to fetch content analytics' });
		});
	});
});
