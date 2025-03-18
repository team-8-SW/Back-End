import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
/**
 * Function to get profile by Id
 * @param req gets userId
 * @returns profile{id, first_name, last_name, headline, location, profile_picture_url}
 */
export const getProfileById = async (req: Request, res: Response) => {
	try {
		const profile = await profileService.getProfileById(req.params.userId);
		if (!profile) {
			return res.status(404).json({ error: 'Profile not found' });
		}
		res.json(profile);
	} catch (error) {
		console.error('Error fetching profile:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
//--------------------Profile Picture--------------------//
/**
 * Function to update profile picture
 * @param req gets userId
 * @returns message: 'Profile picture updated successfully', profilePictureUrl
 */
export const updateProfilePicture = async (req: Request, res: Response) => {
	// Check if file exists
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		const profilePictureUrl = `/uploads/${req.file.filename}`;

		// Call service to update database
		const updatedProfile = await profileService.updateProfilePicture(userId, profilePictureUrl);

		if (!updatedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (updatedProfile.profilePictureUrl === null) {
			return res
				.status(500)
				.json({ error: 'Profile Picture update failed, please try again' });
		}

		res.json({
			message: 'Profile picture updated successfully',
			profilePictureUrl: profilePictureUrl,
		});
	} catch (error) {
		res.status(500).json({ error: 'Error updating profile picture' });
	}
};
/**
 * Function to delete profile picture
 * @param req gets userId
 * @returns message: 'Profile picture deleted successfully'
 */
export const deleteProfilePicture = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		// Call service to delete profile picture
		const deletedProfile = await profileService.deleteProfilePicture(userId);

		if (!deletedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (deletedProfile.profilePictureUrl != null) {
			return res.status(404).json({ error: 'Profile Picture not found' });
		}

		res.json({
			message: 'Profile picture deleted successfully',
		});
	} catch (error) {
		res.status(500).json({ error: 'Error deleting profile picture' });
	}
};
//--------------------Cover Photo--------------------//
/**
 * Function to update cover photo
 * @param req gets userId
 * @returns message: 'Cover Photo updated successfully', coverPhotoUrl
 */
export const updateCoverPhoto = async (req: Request, res: Response) => {
	// Check if file exists
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		const coverPhotoUrl = `/uploads/${req.file.filename}`;

		// Call service to update database
		const updatedProfile = await profileService.updateCoverPicture(userId, coverPhotoUrl);

		if (!updatedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (updatedProfile.coverPhotoUrl === null) {
			return res.status(500).json({ error: 'Cover Photo update failed, please try again' });
		}

		res.json({
			message: 'Cover Photo updated successfully',
			coverPhotoUrl: coverPhotoUrl,
		});
	} catch (error) {
		res.status(500).json({ error: 'Error updating cover photo' });
	}
};

/**
 * Function to delete cover photo
 * @param req gets userId
 * @returns message: 'Cover Photo deleted successfully'
 */
export const deleteCoverPhoto = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		// Call service to delete cover photo
		const deletedProfile = await profileService.deleteCoverPicture(userId);

		if (!deletedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (deletedProfile.coverPhotoUrl != null) {
			return res.status(404).json({ error: 'Cover Photo not found' });
		}

		res.json({
			message: 'Cover Photo deleted successfully',
		});
	} catch (error) {
		res.status(500).json({ error: 'Error deleting cover photo' });
	}
};
//--------------------Resume--------------------//
/**
 * Function to update resume
 * @param req gets userId
 * @returns message: 'Resume updated successfully', resumeUrl
 */
export const updateResume = async (req: Request, res: Response) => {
	// Check if file exists
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		const resumeUrl = `/uploads/${req.file.filename}`;

		// Call service to update database
		const updatedProfile = await profileService.updateResume(userId, resumeUrl);

		if (!updatedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (updatedProfile.resumeUrl === null) {
			return res.status(500).json({ error: 'Resume update failed, please try again' });
		}

		res.json({
			message: 'Resume updated successfully',
			resumeUrl: resumeUrl,
		});
	} catch (error) {
		res.status(500).json({ error: 'Error updating resume' });
	}
};
/**
 * Function to delete resume
 * @param req gets userId
 * @returns message: 'Resume deleted successfully'
 */
export const deleteResume = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		// Call service to delete resume
		const deletedProfile = await profileService.deleteResume(userId);

		if (!deletedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (deletedProfile.resumeUrl != null) {
			return res.status(404).json({ error: 'Resume not found' });
		}

		res.json({
			message: 'Resume deleted successfully',
		});
	} catch (error) {
		res.status(500).json({ error: 'Error deleting resume' });
	}
};

//--------------------Experience--------------------//
/**
 * Function to get experiences of a user
 * @param req gets userId
 * @returns an array of experiences
 */
export const getExperience = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		const experience = await profileService.getExperience(userId);

		if (!experience || experience.length === 0) {
			return res.status(404).json({ error: 'No experience found' });
		}

		// Return an array of experiences
		res.json(
			experience.map((exp) => ({
				id: exp.id,
				company: exp.companyName,
				position: exp.position,
				startDate: exp.startDate,
				endDate: exp.endDate,
				location: exp.location,
				description: exp.description,
			})),
		);
	} catch (error) {
		res.status(500).json({ error: 'Error fetching experience' });
	}
};

export const addExperience = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { companyName, position, startDate, endDate, currentJob, description, location } =
			req.body;

		if (!companyName || !position || !startDate || currentJob === undefined) {
			return res
				.status(400)
				.json({ error: 'Company name, position, start date and current job are required' });
		}

		if (typeof currentJob !== 'boolean') {
			return res.status(400).json({ error: 'Current job must be true or false' });
		}

		const experienceData = {
			company_name: companyName,
			position,
			start_date: startDate,
			end_date: currentJob ? null : endDate, // Set null if current job
			current_job: currentJob,
			description: description || null, // Default to null
			location: location || null,
		};

		const newExperience = await profileService.addExperience(userId, experienceData);
		if (!newExperience) {
			return res.status(500).json({ error: 'Error adding experience' });
		}
		res.status(201).json({ message: 'Experience added successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const updateExperience = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const experienceId = req.params.experienceId;
		const { companyName, position, startDate, endDate, currentJob, description, location } =
			req.body;

		if (!companyName || !position || !startDate || currentJob === undefined) {
			return res
				.status(400)
				.json({ error: 'Company name, position, start date and current job are required' });
		}

		if (typeof currentJob !== 'boolean') {
			return res.status(400).json({ error: 'Current job must be true or false' });
		}

		const experienceData = {
			company_name: companyName,
			position,
			start_date: startDate,
			end_date: currentJob ? null : endDate, // Set null if current job
			current_job: currentJob,
			description: description || null, // Default to null
			location: location || null,
		};

		const updatedExperience = await profileService.updateExperience(
			userId,
			experienceId,
			experienceData,
		);

		if (!updatedExperience) {
			return res.status(404).json({ error: 'Experience not found' });
		}

		res.json({ message: 'Experience updated successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const deleteExperience = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const experienceId = req.params.experienceId;

		const deletedExperience = await profileService.deleteExperience(userId, experienceId);

		if (!deletedExperience) {
			return res.status(404).json({ error: 'Experience not found' });
		}

		res.json({ message: 'Experience deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

//--------------------Eductaion--------------------//

export const getEducation = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		const education = await profileService.getEducation(userId);

		if (!education || education.length === 0) {
			return res.status(404).json({ error: 'No education found' });
		}

		// Return an array of education
		res.json(
			education.map((edu) => ({
				id: edu.id,
				school: edu.schoolName,
				degree: edu.degree,
				fieldOfStudy: edu.fieldOfStudy,
				startDate: edu.startDate,
				endDate: edu.endDate,
				grade: edu.grade,
				activities: edu.activities,
			})),
		);
	} catch (error) {
		res.status(500).json({ error: 'Error fetching education' });
	}
};

export const addEducation = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { schoolName, degree, startDate, endDate } = req.body;

		if (!schoolName || !degree || !startDate) {
			return res
				.status(400)
				.json({ error: 'School name, degree, field of study and start date are required' });
		}

		const educationData = {
			school_name: schoolName,
			degree,
			field_of_study: null,
			start_date: startDate,
			end_date: endDate || null,
			grade: null,
			activities: null,
		};

		const newEducation = await profileService.addEducation(userId, educationData);
		if (!newEducation) {
			return res.status(500).json({ error: 'Error adding education' });
		}
		res.status(201).json({ message: 'Education added successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const updateEducation = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const educationId = req.params.educationId;
		const { schoolName, degree, startDate, endDate } = req.body;

		if (!schoolName || !degree || !startDate) {
			return res
				.status(400)
				.json({ error: 'School name, degree, field of study and start date are required' });
		}

		const educationData = {
			school_name: schoolName,
			degree,
			field_of_study: null,
			start_date: startDate,
			end_date: endDate || null,
			grade: null,
			activities: null,
		};

		const updatedEducation = await profileService.updateEducation(
			userId,
			educationId,
			educationData,
		);

		if (!updatedEducation) {
			return res.status(404).json({ error: 'Education not found' });
		}

		res.json({ message: 'Education updated successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const deleteEducation = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const educationId = req.params.educationId;

		const deletedEducation = await profileService.deleteEducation(userId, educationId);

		if (!deletedEducation) {
			return res.status(404).json({ error: 'Education not found' });
		}

		res.json({ message: 'Education deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

//--------------------Certifications--------------------//

export const getCertifications = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Validate userId
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}

	try {
		const certifications = await profileService.getCertifications(userId);

		if (!certifications || certifications.length === 0) {
			return res.status(404).json({ error: 'No certifications found' });
		}

		// Return an array of certifications
		res.json(
			certifications.map((cert) => ({
				id: cert.id,
				name: cert.name,
				issuedBy: cert.issuingOrganization,
				issueDate: cert.issueDate,
				expirationDate: cert.expirationDate,
			})),
		);
	} catch (error) {
		res.status(500).json({ error: 'Error fetching certifications' });
	}
};

export const addCertification = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { name, issuedBy, issueDate, expirationDate } = req.body;

		if (!name || !issuedBy || !issueDate) {
			return res
				.status(400)
				.json({ error: 'Name, issuing organization and issue date are required' });
		}

		const certificationData = {
			name,
			issuing_organization: issuedBy,
			issue_date: issueDate,
			expiration_date: expirationDate || null,
			credential_id: null,
			credential_url: null,
		};

		const newCertification = await profileService.addCertification(userId, certificationData);
		if (!newCertification) {
			return res.status(500).json({ error: 'Error adding certification' });
		}
		res.status(201).json({ message: 'Certification added successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const updateCertification = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const certificationId = req.params.certificationId;
		const { name, issuedBy, issueDate, expirationDate } = req.body;

		if (!name || !issuedBy || !issueDate) {
			return res
				.status(400)
				.json({ error: 'Name, issuing organization and issue date are required' });
		}

		const certificationData = {
			name,
			issuing_organization: issuedBy,
			issue_date: issueDate,
			expiration_date: expirationDate || null,
			credential_id: null,
			credential_url: null,
		};

		const updatedCertification = await profileService.updateCertification(
			userId,
			certificationId,
			certificationData,
		);

		if (!updatedCertification) {
			return res.status(404).json({ error: 'Certification not found' });
		}

		res.json({ message: 'Certification updated successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const deleteCertification = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const certificationId = req.params.certificationId;

		const deletedCertification = await profileService.deleteCertification(
			userId,
			certificationId,
		);

		if (!deletedCertification) {
			return res.status(404).json({ error: 'Certification not found' });
		}

		res.json({ message: 'Certification deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};
