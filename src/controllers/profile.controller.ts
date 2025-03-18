import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import { describe } from 'node:test';
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

		// ✅ Validate required fields
		if (!companyName || !position || !startDate || currentJob === undefined) {
			return res
				.status(400)
				.json({ error: 'Company name, position, start date and current job are required' });
		}

		// ✅ Ensure current_job is boolean
		if (typeof currentJob !== 'boolean') {
			return res.status(400).json({ error: 'Current job must be true or false' });
		}

		// ✅ Ensure end_date is null if current_job is true
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

		res.status(201).json(newExperience);
	} catch (error) {
		console.error('❌ Error adding experience:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
