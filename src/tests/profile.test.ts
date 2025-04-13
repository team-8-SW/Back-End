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
		(req as any).user = { id: '9ebd15ea-0cf6-4540-86e1-359d96d2fdd1' };
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
			'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjllYmQxNWVhLTBjZjYtNDU0MC04NmUxLTM1OWQ5NmQyZmRkMSJ9.-pySzMkbKtMxMz6pyACPhjUrEFK1o74179PviShvS6M';
		testUserId = '9ebd15ea-0cf6-4540-86e1-359d96d2fdd1';
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

	describe('GET /api/profiles/:userId', () => {
		it('should return 200 and profile data for valid user ID', async () => {
			const mockProfile = {
				id: testUserId,
				first_name: 'John',
				last_name: 'Doe',
				headline: 'Software Engineer',
				location: 'San Francisco',
				profile_picture_url: '/uploads/profile.jpg',
			};
			(profileService.getProfileById as jest.Mock).mockResolvedValue(mockProfile);

			const response = await request(app)
				.get(`/api/profiles/${testUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(mockProfile);
		});

		it('should return 404 for non-existent user ID', async () => {
			(profileService.getProfileById as jest.Mock).mockResolvedValue(null);

			const response = await request(app)
				.get('/api/profiles/nonexistent-user-id')
				.set('Authorization', authToken);

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('Profile not found');
		});

		it('should return 500 for server error', async () => {
			(profileService.getProfileById as jest.Mock).mockRejectedValue(
				new Error('Database error'),
			);

			const response = await request(app)
				.get(`/api/profiles/${testUserId}`)
				.set('Authorization', authToken);

			expect(response.status).toBe(500);
			expect(response.body.error).toBe('Internal server error');
		});
	});

	describe('POST /api/profiles/me/profile-picture', () => {
		it('should return 400 if no file is uploaded', async () => {
			const response = await request(app)
				.post('/api/profiles/me/profile-picture')
				.set('Authorization', authToken);

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('No file uploaded');
		});

		it('should return 200 and update profile picture successfully', async () => {
			const mockUpdatedProfile = {
				id: testUserId,
				profilePictureUrl: `/uploads/${Date.now()}-profile.jpg`,
			};

			(profileService.updateProfilePicture as jest.Mock).mockImplementation((userId, url) => {
				return Promise.resolve({
					...mockUpdatedProfile,
					profilePictureUrl: url,
				});
			});

			const response = await request(app)
				.post('/api/profiles/me/profile-picture')
				.set('Authorization', authToken)
				.attach('file', Buffer.from('file-data'), { filename: 'profile.jpg' });

			expect(response.status).toBe(200);
			expect(response.body.message).toBe('Profile picture updated successfully');
			expect(response.body.profilePictureUrl).toMatch(/^\/uploads\/\d+-profile\.jpg$/);
		});

		it('should return 500 if update fails', async () => {
			(profileService.updateProfilePicture as jest.Mock).mockResolvedValue({
				id: testUserId,
				profilePictureUrl: null,
			});

			const response = await request(app)
				.post('/api/profiles/me/profile-picture')
				.set('Authorization', authToken)
				.attach('file', Buffer.from('file-data'), { filename: 'profile.jpg' });

			expect(response.status).toBe(500);
			expect(response.body.error).toMatch('Profile Picture update failed');
		});

		it('should return 500 for server error', async () => {
			(profileService.updateProfilePicture as jest.Mock).mockRejectedValue(
				new Error('Database error'),
			);

			const response = await request(app)
				.post('/api/profiles/me/profile-picture')
				.set('Authorization', authToken)
				.attach('file', Buffer.from('file-data'), { filename: 'profile.jpg' });

			expect(response.status).toBe(500);
			expect(response.body.error).toBe('Error updating profile picture');
		});
	});

	describe('DELETE /api/profiles/me/profile-picture', () => {
		it('should return 200 and delete profile picture successfully', async () => {
			const mockDeletedProfile = {
				id: testUserId,
				profilePictureUrl: null,
			};
			(profileService.deleteProfilePicture as jest.Mock).mockResolvedValue(
				mockDeletedProfile,
			);

			const response = await request(app)
				.delete('/api/profiles/me/profile-picture')
				.set('Authorization', authToken);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe('Profile picture deleted successfully');
		});

		it('should return 404 if profile picture not found', async () => {
			const mockDeletedProfile = {
				id: testUserId,
				profilePictureUrl: 'still-exists.jpg',
			};
			(profileService.deleteProfilePicture as jest.Mock).mockResolvedValue(
				mockDeletedProfile,
			);

			const response = await request(app)
				.delete('/api/profiles/me/profile-picture')
				.set('Authorization', authToken);

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('Profile Picture not found');
		});

		it('should return 500 for server error', async () => {
			(profileService.deleteProfilePicture as jest.Mock).mockRejectedValue(
				new Error('Database error'),
			);

			const response = await request(app)
				.delete('/api/profiles/me/profile-picture')
				.set('Authorization', authToken);

			expect(response.status).toBe(500);
			expect(response.body.error).toBe('Error deleting profile picture');
		});
	});

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

		describe('GET /api/profiles/me/experience', () => {
			it('should return 200 and list of experiences', async () => {
				(profileService.getExperience as jest.Mock).mockResolvedValue([mockExperience]);

				const response = await request(app)
					.get('/api/profiles/me/experience')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body).toEqual([
					{
						id: 'exp-123',
						company: 'Tech Corp',
						position: 'Developer',
						startDate: '2020-01-01',
						endDate: '2022-01-01',
						location: 'San Francisco',
						description: 'Worked on cool projects',
					},
				]);
			});

			it('should return 404 if no experiences found', async () => {
				(profileService.getExperience as jest.Mock).mockResolvedValue([]);

				const response = await request(app)
					.get('/api/profiles/me/experience')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('No experience found');
			});

			it('should return 500 for server error', async () => {
				(profileService.getExperience as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.get('/api/profiles/me/experience')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Error fetching experience');
			});
		});

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
				expect(response.body.error).toBe('Experience not found');
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

		describe('GET /api/profiles/me/education', () => {
			it('should return 200 and list of education', async () => {
				(profileService.getEducation as jest.Mock).mockResolvedValue([mockEducation]);

				const response = await request(app)
					.get('/api/profiles/me/education')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body).toEqual([
					{
						id: 'edu-123',
						school: 'State University',
						degree: 'Bachelor of Science',
						startDate: '2015-01-01',
						endDate: '2019-01-01',
					},
				]);
			});

			it('should return 404 if no education found', async () => {
				(profileService.getEducation as jest.Mock).mockResolvedValue([]);

				const response = await request(app)
					.get('/api/profiles/me/education')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('No education found');
			});

			it('should return 500 for server error', async () => {
				(profileService.getEducation as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.get('/api/profiles/me/education')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Error fetching education');
			});
		});

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

		describe('GET /api/profiles/me/certifications', () => {
			it('should return 200 and list of certifications', async () => {
				(profileService.getCertifications as jest.Mock).mockResolvedValue([
					mockCertification,
				]);

				const response = await request(app)
					.get('/api/profiles/me/certifications')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body).toEqual([
					{
						id: 'cert-123',
						name: 'AWS Certified',
						issuedBy: 'Amazon',
						issueDate: '2021-01-01',
						expirationDate: '2023-01-01',
					},
				]);
			});

			it('should return 404 if no certifications found', async () => {
				(profileService.getCertifications as jest.Mock).mockResolvedValue([]);

				const response = await request(app)
					.get('/api/profiles/me/certifications')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('No certifications found');
			});

			it('should return 500 for server error', async () => {
				(profileService.getCertifications as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.get('/api/profiles/me/certifications')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Error fetching certifications');
			});
		});

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

		describe('GET /api/profiles/me/skills', () => {
			it('should return 200 and list of skills', async () => {
				(profileService.getSkills as jest.Mock).mockResolvedValue([mockSkill]);

				const response = await request(app)
					.get('/api/profiles/me/skills')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body).toEqual([mockSkill]);
			});

			it('should return 404 if no skills found', async () => {
				(profileService.getSkills as jest.Mock).mockResolvedValue([]);

				const response = await request(app)
					.get('/api/profiles/me/skills')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('No skill found');
			});

			it('should return 500 for server error', async () => {
				(profileService.getSkills as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.get('/api/profiles/me/skills')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

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

		describe('GET /api/profiles/me/visibility', () => {
			it('should return 200 and visibility setting', async () => {
				(profileService.getProfileVisibility as jest.Mock).mockResolvedValue(
					mockVisibility,
				);

				const response = await request(app)
					.get('/api/profiles/me/visibility')
					.set('Authorization', authToken);

				expect(response.status).toBe(200);
				expect(response.body).toEqual({
					visibility: 'public',
				});
			});

			it('should return 404 if visibility setting not found', async () => {
				(profileService.getProfileVisibility as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.get('/api/profiles/me/visibility')
					.set('Authorization', authToken);

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('No profile visibility found');
			});

			it('should return 500 for server error', async () => {
				(profileService.getProfileVisibility as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.get('/api/profiles/me/visibility')
					.set('Authorization', authToken);

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

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

	describe('Create/Update User Profile Endpoints', () => {
		const mockProfile = {
			id: testUserId,
			headline: 'Software Engineer',
			bio: 'Experienced developer',
			location: 'San Francisco',
			industry: 'Technology',
		};

		describe('POST /api/profiles/me', () => {
			it('should return 200 and create user profile', async () => {
				(profileService.createUserProfile as jest.Mock).mockResolvedValue(mockProfile);

				const response = await request(app)
					.post('/api/profiles/me')
					.set('Authorization', authToken)
					.send({
						headline: 'Software Engineer',
						bio: 'Experienced developer',
						location: 'San Francisco',
						industry: 'Technology',
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('User profile created successfully');
			});

			it('should return 500 for server error', async () => {
				(profileService.createUserProfile as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.post('/api/profiles/me')
					.set('Authorization', authToken)
					.send({
						headline: 'Software Engineer',
						bio: 'Experienced developer',
						location: 'San Francisco',
						industry: 'Technology',
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});

		describe('PUT /api/profiles/me', () => {
			it('should return 200 and update user profile', async () => {
				(profileService.updateUserProfile as jest.Mock).mockResolvedValue(mockProfile);

				const response = await request(app)
					.put('/api/profiles/me')
					.set('Authorization', authToken)
					.send({
						headline: 'Updated Headline',
						bio: 'Updated bio',
						location: 'New York',
						industry: 'Finance',
					});

				expect(response.status).toBe(200);
				expect(response.body.message).toBe('User profile updated successfully');
			});

			it('should return 404 if profile not found', async () => {
				(profileService.updateUserProfile as jest.Mock).mockResolvedValue(null);

				const response = await request(app)
					.put('/api/profiles/me')
					.set('Authorization', authToken)
					.send({
						headline: 'Updated Headline',
						bio: 'Updated bio',
						location: 'New York',
						industry: 'Finance',
					});

				expect(response.status).toBe(404);
				expect(response.body.error).toBe('Profile not found');
			});

			it('should return 500 for server error', async () => {
				(profileService.updateUserProfile as jest.Mock).mockRejectedValue(
					new Error('Database error'),
				);

				const response = await request(app)
					.put('/api/profiles/me')
					.set('Authorization', authToken)
					.send({
						headline: 'Updated Headline',
						bio: 'Updated bio',
						location: 'New York',
						industry: 'Finance',
					});

				expect(response.status).toBe(500);
				expect(response.body.error).toBe('Internal server error');
			});
		});
	});
});
