import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import app from './app.test';
import * as profileService from '../services/profile.service';

// Mocking the profile service and dependencies
jest.mock('../services/profile.service');
jest.mock('../config/db', () => ({
	knexInstance: {
		select: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		first: jest.fn().mockResolvedValue(null),
		insert: jest.fn().mockResolvedValue([1]),
		update: jest.fn().mockResolvedValue(1),
		raw: jest.fn().mockResolvedValue([1]),
	},
}));
jest.mock('../middleware/auth.middleware', () => ({
	authMiddleware2: (req: Request, res: Response, next: NextFunction) => {
		(req as any).user = { id: '98e82849-dfd8-40da-9258-02357ee76cf4' };
		next();
	},
}));
(profileService.findUniversity as jest.Mock).mockResolvedValue({
	id: 'e1b9b8c3-3c41-4a26-9e21-dc8b3c2aaf12',
});

describe('Profile Controller Tests', () => {
	let authToken: string;
	let testUserId: string;

	beforeAll(() => {
		authToken =
			'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk4ZTgyODQ5LWRmZDgtNDBkYS05MjU4LTAyMzU3ZWU3NmNmNCJ9.r4s2dAQaLEJBaApDTnzS_rIDE3Ib45j0vHEqIazfxz0';
		testUserId = '98e82849-dfd8-40da-9258-02357ee76cf4';
	});

	beforeEach(() => {
		jest.clearAllMocks();
		// Reset multer mock for file upload tests
		jest.mock('multer', () => {
			const multer = () => ({
				single: () => (req: Request, res: Response, next: NextFunction) => next(),
			});
			return multer;
		});
	});

	describe('GET /api/profiles/me/:userId', () => {
		it('should return 200 and profile data for a valid UserId', async () => {
			const mockProfile = {
				id: testUserId,
				firstName: 'John',
				lastName: 'Doe',
				headline: 'Software Engineer',
				location: 'San Francisco',
				profilePictureUrl: 'profile-picture.jpg',
			};

			const mockProfileVisibility = { visibility: 'public' };
			const mockExperiences = [{ id: 'exp1', company: 'TechCorp', position: 'Engineer' }];
			const mockEducation = [{ id: 'edu1', school: 'Stanford', degree: 'BSc' }];
			const mockCertifications = [{ id: 'cert1', name: 'AWS Certified' }];
			const mockSkills = ['Node.js', 'React'];
			const mockFollowersCount = 100;
			const mockConnectionsCount = 50;

			(profileService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
			(profileService.getProfileVisibility as jest.Mock).mockResolvedValue(
				mockProfileVisibility,
			);
			(profileService.areUsersConnected as jest.Mock).mockResolvedValue(false);
			(profileService.getExperience as jest.Mock).mockResolvedValue(mockExperiences);
			(profileService.getEducation as jest.Mock).mockResolvedValue(mockEducation);
			(profileService.getCertifications as jest.Mock).mockResolvedValue(mockCertifications);
			(profileService.getSkills as jest.Mock).mockResolvedValue(mockSkills);
			(profileService.getFollowersCount as jest.Mock).mockResolvedValue(mockFollowersCount);
			(profileService.getConnectionsCount as jest.Mock).mockResolvedValue(
				mockConnectionsCount,
			);

			const response = await request(app)
				.get(`/api/profiles/me/${testUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				public: true,
				profile: mockProfile,
				experiences: mockExperiences,
				education: mockEducation,
				certifications: mockCertifications,
				skills: mockSkills,
				followersCount: mockFollowersCount,
				connectionsCount: mockConnectionsCount,
			});
		});

		it('should return 404 for a non-existent user ID', async () => {
			(profileService.getUserProfile as jest.Mock).mockResolvedValue(null);

			const response = await request(app)
				.get('/api/profiles/me/nonexistent-user-id')
				.set('Authorization', authToken);

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('Profile not found');
		});
		it('should return 400 if no user ID is provided', async () => {
			const response = await request(app)
				.get('/api/profiles/me/%20')
				.set('Authorization', authToken);

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('User ID is required');
		});
	});

	// describe('POST /api/profiles/me/profile-picture', () => {
	// 	it('should return 400 if no file is uploaded', async () => {
	// 		const response = await request(app)
	// 			.post('/api/profiles/me/profile-picture')
	// 			.set('Authorization', authToken);

	// 		expect(response.status).toBe(400);
	// 		expect(response.body.error).toBe('No file uploaded');
	// 	});

	// 	it('should return 200 and update profile picture successfully', async () => {
	// 		const mockUpdatedProfile = {
	// 			id: testUserId,
	// 			profilePictureUrl: 'https://cloudinary.com/profile-picture.jpg',
	// 		};

	// 		(profileService.updateProfilePicture as jest.Mock).mockResolvedValue(
	// 			mockUpdatedProfile,
	// 		);

	// 		const response = await request(app)
	// 			.post('/api/profiles/me/profile-picture')
	// 			.set('Authorization', authToken)
	// 			.attach('file', Buffer.from('file-data'), 'profile.jpg');

	// 		expect(response.status).toBe(200);
	// 		expect(response.body.message).toBe('Profile picture updated successfully');
	// 		expect(response.body.profilePictureUrl).toBe(mockUpdatedProfile.profilePictureUrl);
	// 	});

	// 	it('should return 404 if user not found', async () => {
	// 		(profileService.updateProfilePicture as jest.Mock).mockResolvedValue(null);

	// 		const response = await request(app)
	// 			.post('/api/profiles/me/profile-picture')
	// 			.set('Authorization', authToken)
	// 			.attach('file', Buffer.from('file-data'), 'profile.jpg');

	// 		expect(response.status).toBe(404);
	// 		expect(response.body.error).toBe('User not found');
	// 	});

	// 	it('should return 500 for server error', async () => {
	// 		(profileService.updateProfilePicture as jest.Mock).mockRejectedValue(
	// 			new Error('Database error'),
	// 		);

	// 		const response = await request(app)
	// 			.post('/api/profiles/me/profile-picture')
	// 			.set('Authorization', authToken)
	// 			.attach('file', Buffer.from('file-data'), 'profile.jpg');

	// 		expect(response.status).toBe(500);
	// 		expect(response.body.error).toBe('Internal server error');
	// 	});
	// });

	// describe('DELETE /api/profiles/me/profile-picture', () => {
	// 	it('should return 200 and delete profile picture successfully', async () => {
	// 		// Mock the user profile with a valid profile picture
	// 		(profileService.getUserProfile as jest.Mock).mockResolvedValue({
	// 			id: testUserId,
	// 			profilePictureUrl: 'profile-picture.png',
	// 		});

	// 		// Mock the delete profile picture service
	// 		(profileService.deleteProfilePicture as jest.Mock).mockResolvedValue({
	// 			id: testUserId,
	// 			profilePictureUrl: null,
	// 		});

	// 		const response = await request(app)
	// 			.delete('/api/profiles/me/profile-picture')
	// 			.set('Authorization', authToken);

	// 		console.log(response.body); // Debugging

	// 		expect(response.status).toBe(200);
	// 		expect(response.body.message).toBe('Profile picture deleted successfully');
	// 	});

	// 	it('should return 404 if profile picture not found', async () => {
	// 		// Mock the user profile without a profile picture
	// 		(profileService.getUserProfile as jest.Mock).mockResolvedValue({
	// 			id: testUserId,
	// 			profilePictureUrl: null,
	// 		});

	// 		const response = await request(app)
	// 			.delete('/api/profiles/me/profile-picture')
	// 			.set('Authorization', authToken);

	// 		expect(response.status).toBe(404);
	// 		expect(response.body.error).toBe('Profile picture not found');
	// 	});

	// 	it('should return 404 if user not found', async () => {
	// 		// Mock the user profile as not found
	// 		(profileService.getUserProfile as jest.Mock).mockResolvedValue(null);

	// 		const response = await request(app)
	// 			.delete('/api/profiles/me/profile-picture')
	// 			.set('Authorization', authToken);

	// 		expect(response.status).toBe(404);
	// 		expect(response.body.error).toBe('User not found');
	// 	});

	// 	it('should return 500 for server error', async () => {
	// 		// Mock the service to throw an error
	// 		(profileService.getUserProfile as jest.Mock).mockRejectedValue(
	// 			new Error('Database error'),
	// 		);

	// 		const response = await request(app)
	// 			.delete('/api/profiles/me/profile-picture')
	// 			.set('Authorization', authToken);

	// 		expect(response.status).toBe(500);
	// 		expect(response.body.error).toBe('Internal server error');
	// 	});
	// });
	describe('Work Experience Endpoints', () => {
		const mockExperience = {
			id: 'exp-123',
			companyName: 'Tech Corp',
			position: 'Developer',
			startDate: '2020-01-01',
			endDate: '2022-01-01',
			currentJob: false,
			description: 'Worked on cool projects',
			location: 'San Francisco',
		};

		// describe('GET /api/profiles/me/experience', () => {
		// 	it('should return 200 and list of experiences', async () => {
		// 		(profileService.getExperience as jest.Mock).mockResolvedValue([mockExperience]);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/experience')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(200);
		// 		expect(response.body).toEqual([
		// 			{
		// 				id: 'exp-123',
		// 				company: 'Tech Corp',
		// 				position: 'Developer',
		// 				startDate: '2020-01-01',
		// 				endDate: '2022-01-01',
		// 				location: 'San Francisco',
		// 				description: 'Worked on cool projects',
		// 			},
		// 		]);
		// 	});

		// 	it('should return 404 if no experiences found', async () => {
		// 		(profileService.getExperience as jest.Mock).mockResolvedValue([]);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/experience')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(404);
		// 		expect(response.body.error).toBe('No experience found');
		// 	});

		// 	it('should return 500 for server error', async () => {
		// 		(profileService.getExperience as jest.Mock).mockRejectedValue(
		// 			new Error('Database error'),
		// 		);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/experience')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(500);
		// 		expect(response.body.error).toBe('Error fetching experience');
		// 	});
		// });

		describe('POST /api/profiles/me/experience', () => {
			it('should return 200 and create new experience', async () => {
				(profileService.addExperience as jest.Mock).mockResolvedValue(mockExperience);

				const response = await request(app)
					.post('/api/profiles/me/experience')
					.set('Authorization', authToken)
					.send({
						companyName: 'Tech Corp',
						position: 'Developer',
						startDate: '2020-01-01',
						currentJob: false,
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Experience added successfully');
			});

			it('should return 400 if required fields are missing', async () => {
				const response = await request(app)
					.post('/api/profiles/me/experience')
					.set('Authorization', authToken)
					.send({
						position: 'Developer',
						startDate: '2020-01-01',
					});

				expect(response.status).toBe(400);
				expect(response.body.error).toMatch('Company name');
			});

			it('should handle current job without end date', async () => {
				(profileService.addExperience as jest.Mock).mockResolvedValue({
					...mockExperience,
					currentJob: true,
					endDate: null,
				});

				const response = await request(app)
					.post('/api/profiles/me/experience')
					.set('Authorization', authToken)
					.send({
						companyName: 'Tech Corp',
						position: 'Developer',
						startDate: '2020-01-01',
						currentJob: true,
					});

				expect(response.status).toBe(200);
			});

			it('should return 500 for server error', async () => {
				(profileService.addExperience as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.post('/api/profiles/me/experience')
					.set('Authorization', authToken)
					.send({
						companyName: 'Tech Corp',
						position: 'Developer',
						startDate: '2020-01-01',
						currentJob: false,
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

		describe('PUT /api/profiles/me/experience/:experienceId', () => {
			it('should return 200 and update experience', async () => {
				(profileService.updateExperience as jest.Mock).mockResolvedValue(mockExperience);

				const response = await request(app)
					.put('/api/profiles/me/experience/exp-123')
					.set('Authorization', authToken)
					.send({
						companyName: 'Updated Corp',
						position: 'Senior Developer',
						startDate: '2020-01-01',
						currentJob: false,
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Experience updated successfully');
			});

			it('should return 404 if experience not found', async () => {
				(profileService.updateExperience as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.put('/api/profiles/me/experience/nonexistent-id')
					.set('Authorization', authToken)
					.send({
						companyName: 'Updated Corp',
						position: 'Senior Developer',
						startDate: '2020-01-01',
						currentJob: false,
					});

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Experience not found or not owned by user');
			});
			it('should return 400 if no experience ID is provided', async () => {
				const response = await request(app)
					.put('/api/profiles/me/experience/%20')
					.set('Authorization', authToken)
					.send({
						companyName: 'Updated Corp',
						position: 'Senior Developer',
						startDate: '2020-01-01',
						currentJob: false,
					});

				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Experience ID is required');
			});

			it('should return 400 for invalid update data', async () => {
				const response = await request(app)
					.put('/api/profiles/me/experience/exp-123')
					.set('Authorization', authToken)
					.send({
						companyName: '',
						position: 'Developer',
					});

				expect(response.status).toBe(400);
			});

			it('should return 500 for server error', async () => {
				(profileService.updateExperience as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.put('/api/profiles/me/experience/exp-123')
					.set('Authorization', authToken)
					.send({
						companyName: 'Updated Corp',
						position: 'Senior Developer',
						startDate: '2020-01-01',
						currentJob: false,
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

		describe('DELETE /api/profiles/me/experience/:experienceId', () => {
			it('should return 200 and delete experience', async () => {
				(profileService.deleteExperience as jest.Mock).mockResolvedValue(mockExperience);

				const response = await request(app)
					.delete('/api/profiles/me/experience/exp-123')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Experience deleted successfully');
			});

			it('should return 404 if experience not found', async () => {
				(profileService.deleteExperience as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.delete('/api/profiles/me/experience/nonexistent-id')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Experience not found');
			});
			it('should return 400 if no experience ID is provided', async () => {
				const response = await request(app)
					.delete('/api/profiles/me/experience/%20')
					.set('Authorization', authToken);

				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Experience ID is required');
			});

			it('should return 500 for server error', async () => {
				(profileService.deleteExperience as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.delete('/api/profiles/me/experience/exp-123')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});
	});

	describe('Education Endpoints', () => {
		const mockEducation = {
			id: 'edu-123',
			universityName: 'State University',
			degree: 'Bachelor of Science',
			startDate: '2015-01-01',
			endDate: '2019-01-01',
		};

		// describe('GET /api/profiles/me/education', () => {
		// 	it('should return 200 and list of education', async () => {
		// 		(profileService.getEducation as jest.Mock).mockResolvedValue([mockEducation]);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/education')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(200);
		// 		expect(response.body).toEqual([
		// 			{
		// 				id: 'edu-123',
		// 				school: 'State University',
		// 				degree: 'Bachelor of Science',
		// 				startDate: '2015-01-01',
		// 				endDate: '2019-01-01',
		// 			},
		// 		]);
		// 	});

		// 	it('should return 404 if no education found', async () => {
		// 		(profileService.getEducation as jest.Mock).mockResolvedValue([]);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/education')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(404);
		// 		expect(response.body.error).toBe('No education found');
		// 	});

		// 	it('should return 500 for server error', async () => {
		// 		(profileService.getEducation as jest.Mock).mockRejectedValue(
		// 			new Error('Database error'),
		// 		);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/education')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(500);
		// 		expect(response.body.error).toBe('Error fetching education');
		// 	});
		// });

		describe('POST /api/profiles/me/education', () => {
			it('should return 200 and create new education', async () => {
				(profileService.addEducation as jest.Mock).mockResolvedValue(mockEducation);

				const response = await request(app)
					.post('/api/profiles/me/education')
					.set('Authorization', authToken)
					.send({
						school: 'State University',
						degree: 'Bachelor of Science',
						startDate: '2015-01-01',
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Education added successfully');
			});

			it('should return 400 if required fields are missing', async () => {
				const response = await request(app)
					.post('/api/profiles/me/education')
					.set('Authorization', authToken)
					.send({
						degree: 'Bachelor of Science',
						startDate: '2015-01-01',
					});

				expect(response.status).toBe(400);
				expect(response.body.error).toMatch('School name');
			});

			it('should return 400 for invalid school', async () => {
				(profileService.findUniversity as jest.Mock).mockResolvedValueOnce(null);

				const response = await request(app)
					.post('/api/profiles/me/education')
					.set('Authorization', authToken)
					.send({
						school: 'Invalid University',
						degree: 'Bachelor of Science',
						startDate: '2015-01-01',
					});

				expect(response.status).toBe(400);
				expect(response.body.error).toBe('School is invalid');
			});

			it('should return 400 if end date is before start date', async () => {
				const response = await request(app)
					.post('/api/profiles/me/education')
					.set('Authorization', authToken)
					.send({
						school: 'State University',
						degree: 'Bachelor of Science',
						startDate: '2019-01-01',
						endDate: '2015-01-01',
					});

				expect(response.status).toBe(400);
			});

			it('should return 500 for server error', async () => {
				(profileService.addEducation as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.post('/api/profiles/me/education')
					.set('Authorization', authToken)
					.send({
						school: 'State University',
						degree: 'Bachelor of Science',
						startDate: '2015-01-01',
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

		describe('PUT /api/profiles/me/education/:educationId', () => {
			it('should return 200 and update education', async () => {
				(profileService.updateEducation as jest.Mock).mockResolvedValue(mockEducation);

				const response = await request(app)
					.put('/api/profiles/me/education/edu-123')
					.set('Authorization', authToken)
					.send({
						school: 'Updated University',
						degree: 'Master of Science',
						startDate: '2015-01-01',
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Education updated successfully');
			});

			it('should return 404 if education not found', async () => {
				(profileService.updateEducation as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.put('/api/profiles/me/education/nonexistent-id')
					.set('Authorization', authToken)
					.send({
						school: 'Updated University',
						degree: 'Master of Science',
						startDate: '2015-01-01',
					});

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Education record not found');
			});

			it('should return 400 if no education ID is provided', async () => {
				const response = await request(app)
					.put('/api/profiles/me/education/%20')
					.set('Authorization', authToken)
					.send({
						school: 'Updated University',
						degree: 'Master of Science',
						startDate: '2015-01-01',
					});
				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Education ID is required');
			});

			it('should return 500 for server error', async () => {
				(profileService.updateEducation as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.put('/api/profiles/me/education/edu-123')
					.set('Authorization', authToken)
					.send({
						school: 'Updated University',
						degree: 'Master of Science',
						startDate: '2015-01-01',
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

		describe('DELETE /api/profiles/me/education/:educationId', () => {
			it('should return 200 and delete education', async () => {
				(profileService.deleteEducation as jest.Mock).mockResolvedValue(mockEducation);

				const response = await request(app)
					.delete('/api/profiles/me/education/edu-123')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Education deleted successfully');
			});

			it('should return 404 if education not found', async () => {
				(profileService.deleteEducation as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.delete('/api/profiles/me/education/nonexistent-id')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Education not found');
			});

			it('should return 400 if no education ID is provided', async () => {
				const response = await request(app)
					.delete('/api/profiles/me/education/%20')
					.set('Authorization', authToken);
				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Education ID is required');
			});

			it('should return 500 for server error', async () => {
				(profileService.deleteEducation as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.delete('/api/profiles/me/education/edu-123')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});
	});

	describe('Certification Endpoints', () => {
		const mockCertification = {
			id: 'cert-123',
			name: 'AWS Certified',
			issuingOrganization: 'Amazon',
			issueDate: '2021-01-01',
			expirationDate: '2023-01-01',
		};

		// describe('GET /api/profiles/me/certifications', () => {
		// 	it('should return 200 and list of certifications', async () => {
		// 		(profileService.getCertifications as jest.Mock).mockResolvedValue([
		// 			mockCertification,
		// 		]);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/certifications')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(200);
		// 		expect(response.body).toEqual([
		// 			{
		// 				id: 'cert-123',
		// 				name: 'AWS Certified',
		// 				issuedBy: 'Amazon',
		// 				issueDate: '2021-01-01',
		// 				expirationDate: '2023-01-01',
		// 			},
		// 		]);
		// 	});

		// 	it('should return 404 if no certifications found', async () => {
		// 		(profileService.getCertifications as jest.Mock).mockResolvedValue([]);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/certifications')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(404);
		// 		expect(response.body.error).toBe('No certifications found');
		// 	});

		// 	it('should return 500 for server error', async () => {
		// 		(profileService.getCertifications as jest.Mock).mockRejectedValue(
		// 			new Error('Database error'),
		// 		);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/certifications')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(500);
		// 		expect(response.body.error).toBe('Error fetching certifications');
		// 	});
		// });

		describe('POST /api/profiles/me/certifications', () => {
			it('should return 200 and create new certification', async () => {
				(profileService.addCertification as jest.Mock).mockResolvedValue(mockCertification);

				const response = await request(app)
					.post('/api/profiles/me/certifications')
					.set('Authorization', authToken)
					.send({
						name: 'AWS Certified',
						issuedBy: 'Amazon',
						issueDate: '2021-01-01',
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Certification added successfully');
			});

			it('should return 400 if required fields are missing', async () => {
				const response = await request(app)
					.post('/api/profiles/me/certifications')
					.set('Authorization', authToken)
					.send({
						issuedBy: 'Amazon',
						issueDate: '2021-01-01',
					});

				expect(response.status).toBe(400);
				expect(response.body.error).toMatch('Name');
			});

			it('should return 400 if expiration date is before issue date', async () => {
				const response = await request(app)
					.post('/api/profiles/me/certifications')
					.set('Authorization', authToken)
					.send({
						name: 'AWS Certified',
						issuedBy: 'Amazon',
						issueDate: '2023-01-01',
						expirationDate: '2021-01-01',
					});

				expect(response.status).toBe(400);
			});

			it('should return 500 for server error', async () => {
				(profileService.addCertification as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.post('/api/profiles/me/certifications')
					.set('Authorization', authToken)
					.send({
						name: 'AWS Certified',
						issuedBy: 'Amazon',
						issueDate: '2021-01-01',
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

		describe('PUT /api/profiles/me/certifications/:certificationId', () => {
			it('should return 200 and update certification', async () => {
				(profileService.updateCertification as jest.Mock).mockResolvedValue(
					mockCertification,
				);

				const response = await request(app)
					.put('/api/profiles/me/certifications/cert-123')
					.set('Authorization', authToken)
					.send({
						name: 'Updated Certification',
						issuedBy: 'Updated Org',
						issueDate: '2021-01-01',
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Certification updated successfully');
			});

			it('should return 404 if certification not found', async () => {
				(profileService.updateCertification as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.put('/api/profiles/me/certifications/nonexistent-id')
					.set('Authorization', authToken)
					.send({
						name: 'Updated Certification',
						issuedBy: 'Updated Org',
						issueDate: '2021-01-01',
					});

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Certification not found');
			});

			it('should return 400 if no certification ID is provided', async () => {
				const response = await request(app)
					.put('/api/profiles/me/certifications/%20')
					.set('Authorization', authToken)
					.send({
						name: 'Updated Certification',
						issuedBy: 'Updated Org',
						issueDate: '2021-01-01',
					});
				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Certification ID is required');
			});

			it('should return 400 for invalid update data', async () => {
				const response = await request(app)
					.put('/api/profiles/me/certifications/cert-123')
					.set('Authorization', authToken)
					.send({
						name: '',
						issuedBy: 'Updated Org',
						issueDate: '2021-01-01',
					});
				expect(response.status).toBe(400);
				expect(response.body.error).toMatch('Name');
			});
			it('should return 400 if expiration date is before issue date', async () => {
				const response = await request(app)
					.put('/api/profiles/me/certifications/cert-123')
					.set('Authorization', authToken)
					.send({
						name: 'Updated Certification',
						issuedBy: 'Updated Org',
						issueDate: '2023-01-01',
						expirationDate: '2021-01-01',
					});
				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Expiration date must be after issue date');
			});

			it('should return 500 for server error', async () => {
				(profileService.updateCertification as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.put('/api/profiles/me/certifications/cert-123')
					.set('Authorization', authToken)
					.send({
						name: 'Updated Certification',
						issuedBy: 'Updated Org',
						issueDate: '2021-01-01',
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

		describe('DELETE /api/profiles/me/certifications/:certificationId', () => {
			it('should return 200 and delete certification', async () => {
				(profileService.deleteCertification as jest.Mock).mockResolvedValue(
					mockCertification,
				);

				const response = await request(app)
					.delete('/api/profiles/me/certifications/cert-123')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Certification deleted successfully');
			});

			it('should return 404 if certification not found', async () => {
				(profileService.deleteCertification as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.delete('/api/profiles/me/certifications/nonexistent-id')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Certification not found');
			});

			it('should return 400 if no certification ID is provided', async () => {
				const response = await request(app)
					.delete('/api/profiles/me/certifications/%20')
					.set('Authorization', authToken);

				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Certification ID is required');
			});

			it('should return 500 for server error', async () => {
				(profileService.deleteCertification as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.delete('/api/profiles/me/certifications/cert-123')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});
	});

	describe('Skills Endpoints', () => {
		const mockSkill = {
			id: 'skill-123',
			name: 'JavaScript',
		};

		// describe('GET /api/profiles/me/skills', () => {
		// 	it('should return 200 and list of skills', async () => {
		// 		(profileService.getSkills as jest.Mock).mockResolvedValue([mockSkill]);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/skills')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(200);
		// 		expect(response.body).toEqual([mockSkill]);
		// 	});

		// 	it('should return 404 if no skills found', async () => {
		// 		(profileService.getSkills as jest.Mock).mockResolvedValue([]);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/skills')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(404);
		// 		expect(response.body.error).toBe('No skill found');
		// 	});

		// 	it('should return 500 for server error', async () => {
		// 		(profileService.getSkills as jest.Mock).mockRejectedValue(
		// 			new Error('Database error'),
		// 		);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/skills')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(500);
		// 		expect(response.body.error).toBe('Internal server error');
		// 	});
		// });

		describe('POST /api/profiles/me/skills', () => {
			it('should return 200 and add new skill', async () => {
				(profileService.addSkill as jest.Mock).mockResolvedValue(mockSkill);

				const response = await request(app)
					.post('/api/profiles/me/skills')
					.set('Authorization', authToken)
					.send({
						name: 'JavaScript',
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Skill added successfully');
			});

			it('should return 400 if skill name is missing', async () => {
				const response = await request(app)
					.post('/api/profiles/me/skills')
					.set('Authorization', authToken)
					.send({});

				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Skill name is required');
			});

			it('should return 500 for server error', async () => {
				(profileService.addSkill as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.post('/api/profiles/me/skills')
					.set('Authorization', authToken)
					.send({
						name: 'JavaScript',
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

		describe('DELETE /api/profiles/me/skills/:skillId', () => {
			it('should return 200 and delete skill', async () => {
				(profileService.deleteSkill as jest.Mock).mockResolvedValue(mockSkill);

				const response = await request(app)
					.delete('/api/profiles/me/skills/skill-123')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Skill deleted successfully');
			});

			it('should return 404 if skill not found', async () => {
				(profileService.deleteSkill as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.delete('/api/profiles/me/skills/nonexistent-id')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Skill not found');
			});

			it('should return 400 if no skill ID is provided', async () => {
				const response = await request(app)
					.delete('/api/profiles/me/skills/%20')
					.set('Authorization', authToken);
				expect(response.status).toBe(400);
				expect(response.body.error).toBe('Skill ID is required');
			});

			it('should return 500 for server error', async () => {
				(profileService.deleteSkill as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.delete('/api/profiles/me/skills/skill-123')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});
	});

	describe('Profile Visibility Endpoints', () => {
		const mockVisibility = {
			visibility: 'public',
		};

		// describe('GET /api/profiles/me/visibility', () => {
		// 	it('should return 200 and visibility setting', async () => {
		// 		(profileService.getProfileVisibility as jest.Mock).mockResolvedValue(
		// 			mockVisibility,
		// 		);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/visibility')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(200);
		// 		expect(response.body).toEqual({
		// 			visibility: 'public',
		// 		});
		// 	});

		// 	it('should return 404 if visibility setting not found', async () => {
		// 		(profileService.getProfileVisibility as jest.Mock).mockResolvedValue(null);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/visibility')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(404);
		// 		expect(response.body.error).toBe('No profile visibility found');
		// 	});

		// 	it('should return 500 for server error', async () => {
		// 		(profileService.getProfileVisibility as jest.Mock).mockRejectedValue(
		// 			new Error('Database error'),
		// 		);

		// 		const response = await request(app)
		// 			.get('/api/profiles/me/visibility')
		// 			.set('Authorization', authToken);

		// 		expect(response.status).toBe(500);
		// 		expect(response.body.error).toBe('Internal server error');
		// 	});
		// });

		describe('PUT /api/profiles/me/visibility', () => {
			it('should return 200 and update visibility to private', async () => {
				(profileService.updateProfileVisibility as jest.Mock).mockResolvedValue({
					...mockVisibility,
					visibility: 'private',
				});

				const response = await request(app)
					.put('/api/profiles/me/visibility')
					.set('Authorization', authToken)
					.send({
						visibility: 'private',
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('Profile Visibility updated successfully');
			});

			it('should return 400 for invalid visibility value', async () => {
				const response = await request(app)
					.put('/api/profiles/me/visibility')
					.set('Authorization', authToken)
					.send({
						visibility: 'invalid-value',
					});

				expect(response.status).toBe(400);
				expect(response.body.error).toBe(
					'Profile Visibility can only be public, private or connections-only',
				);
			});

			it('should return 500 when database error occurs', async () => {
				(profileService.updateProfileVisibility as jest.Mock).mockRejectedValue(
					new Error('Database connection failed'),
				);

				const response = await request(app)
					.put('/api/profiles/me/visibility')
					.set('Authorization', authToken)
					.send({
						visibility: 'public',
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});
	});

	describe('Get/Update User Profile Endpoints', () => {
		const mockProfile = {
			id: testUserId,
			headline: 'Software Engineer',
			bio: 'Experienced developer',
			location: 'San Francisco',
			industry: 'Technology',
		};

		// describe('POST /api/profiles/me', () => {
		// 	it('should return 200 and create user profile', async () => {
		// 		(profileService.createUserProfile as jest.Mock).mockResolvedValue(mockProfile);

		// 		const response = await request(app)
		// 			.post('/api/profiles/me')
		// 			.set('Authorization', authToken)
		// 			.send({
		// 				headline: 'Software Engineer',
		// 				bio: 'Experienced developer',
		// 				location: 'San Francisco',
		// 				industry: 'Technology',
		// 			});

		// 		expect(response.status).toBe(200);
		// 		expect(response.body.message).toBe('User profile created successfully');
		// 	});

		// 	it('should return 500 for server error', async () => {
		// 		(profileService.createUserProfile as jest.Mock).mockRejectedValue(
		// 			new Error('Database error'),
		// 		);

		// 		const response = await request(app)
		// 			.post('/api/profiles/me')
		// 			.set('Authorization', authToken)
		// 			.send({
		// 				headline: 'Software Engineer',
		// 				bio: 'Experienced developer',
		// 				location: 'San Francisco',
		// 				industry: 'Technology',
		// 			});

		// 		expect(response.status).toBe(500);
		// 		expect(response.body.error).toBe('Internal server error');
		// 	});
		// });

		describe('PUT /api/profiles/me', () => {
			it('should return 200 and update the user profile successfully', async () => {
				const mockCurrentProfile = {
					id: testUserId,
					headline: 'Software Engineer',
					bio: 'Passionate about coding',
					location: 'San Francisco',
					industry: 'Technology',
					firstName: 'John',
					lastName: 'Doe',
				};

				const mockUpdatedProfile = {
					...mockCurrentProfile,
					headline: 'Senior Software Engineer',
				};

				(profileService.getUserProfile as jest.Mock).mockResolvedValue(mockCurrentProfile);
				(profileService.updateUserProfile as jest.Mock).mockResolvedValue(
					mockUpdatedProfile,
				);
				(profileService.getUserProfile as jest.Mock).mockResolvedValue(mockUpdatedProfile);

				const response = await request(app)
					.put('/api/profiles/me')
					.set('Authorization', authToken)
					.send({ headline: 'Senior Software Engineer' });

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('User profile updated successfully');
				expect(response.body.profile).toEqual(mockUpdatedProfile);
			});

			it('should return 404 if the profile is not found', async () => {
				(profileService.getUserProfile as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.put('/api/profiles/me')
					.set('Authorization', authToken)
					.send({ headline: 'Senior Software Engineer' });

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Profile not found');
			});

			it('should return 500 for a server error', async () => {
				(profileService.getUserProfile as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.put('/api/profiles/me')
					.set('Authorization', authToken)
					.send({ headline: 'Senior Software Engineer' });

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});
		describe('GET /api/profiles/ - getMyProfile', () => {
			it('should return 200 and the user profile successfully', async () => {
				const mockProfile = {
					id: testUserId,
					firstName: 'John',
					lastName: 'Doe',
					headline: 'Software Engineer',
					location: 'San Francisco',
					industry: 'Technology',
				};

				const mockProfileVisibility = { visibility: 'public' };
				const mockExperiences = [{ id: 'exp1', company: 'TechCorp', position: 'Engineer' }];
				const mockEducation = [{ id: 'edu1', school: 'Stanford', degree: 'BSc' }];
				const mockCertifications = [{ id: 'cert1', name: 'AWS Certified' }];
				const mockSkills = ['Node.js', 'React'];
				const mockFollowersCount = 100;
				const mockConnectionsCount = 50;

				(profileService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
				(profileService.getProfileVisibility as jest.Mock).mockResolvedValue(
					mockProfileVisibility,
				);
				(profileService.getExperience as jest.Mock).mockResolvedValue(mockExperiences);
				(profileService.getEducation as jest.Mock).mockResolvedValue(mockEducation);
				(profileService.getCertifications as jest.Mock).mockResolvedValue(
					mockCertifications,
				);
				(profileService.getSkills as jest.Mock).mockResolvedValue(mockSkills);
				(profileService.getFollowersCount as jest.Mock).mockResolvedValue(
					mockFollowersCount,
				);
				(profileService.getConnectionsCount as jest.Mock).mockResolvedValue(
					mockConnectionsCount,
				);

				const response = await request(app)
					.get('/api/profiles/')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body).toEqual({
					visibility: mockProfileVisibility.visibility,
					profile: mockProfile,
					experiences: mockExperiences,
					education: mockEducation,
					certifications: mockCertifications,
					skills: mockSkills,
					followersCount: mockFollowersCount,
					connectionsCount: mockConnectionsCount,
				});
			});

			it('should return 404 if the user profile is not found', async () => {
				(profileService.getUserProfile as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.get('/api/profiles/')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('User profile not found');
			});

			it('should return 500 for a server error', async () => {
				(profileService.getUserProfile as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.get('/api/profiles/')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});
	});
});
