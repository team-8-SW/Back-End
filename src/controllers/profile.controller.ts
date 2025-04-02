import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import { profile } from 'console';

export const getProfileById = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		// Validate userId
		if (!userId) {
			return res.status(401).json({ error: 'User ID is required' });
		}
		const profile = await profileService.getProfileById(userId);

		if (!profile) {
			return res.status(404).json({ error: 'Profile not found' });
		}

		res.status(200).json(profile);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
//--------------------Profile Picture--------------------//
export const updateProfilePicture = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	// Check if file exists
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
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

		res.status(200).json({
			message: 'Profile picture updated successfully',
			profilePictureUrl: profilePictureUrl,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const deleteProfilePicture = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	try {
		// Call service to delete profile picture
		const deletedProfile = await profileService.deleteProfilePicture(userId);

		if (!deletedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (deletedProfile.profilePictureUrl != null) {
			return res.status(404).json({ error: 'Profile Picture not found' });
		}

		res.status(200).json({
			message: 'Profile picture deleted successfully',
			profilePictureUrl: null,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
//--------------------Cover Photo--------------------//

export const updateCoverPhoto = async (req: Request, res: Response) => {
	// Check if file exists
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	// Get userId from req.user
	const userId = (req as any).user?.id;

	try {
		const coverPhotoUrl = `/uploads/${req.file.filename}`;

		// Call service to update database
		const updatedProfile = await profileService.updateCoverPicture(userId, coverPhotoUrl);

		if (!updatedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (updatedProfile.coverPhotoUrl === null) {
			return res.status(404).json({ error: 'Cover Photo update failed, please try again' });
		}

		res.status(200).json({
			message: 'Cover Photo updated successfully',
			coverPhotoUrl: coverPhotoUrl,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const deleteCoverPhoto = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	try {
		// Call service to delete cover photo
		const deletedProfile = await profileService.deleteCoverPicture(userId);

		if (!deletedProfile) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (deletedProfile.coverPhotoUrl != null) {
			return res.status(404).json({ error: 'Cover Photo not found' });
		}

		res.status(200).json({
			message: 'Cover Photo deleted successfully',
			coverPhotoUrl: null,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
//--------------------Resume--------------------//

export const updateResume = async (req: Request, res: Response) => {
	// Check if file exists
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	// Get userId from req.user
	const userId = (req as any).user?.id;

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

		res.status(200).json({
			message: 'Resume updated successfully',
			resumeUrl: resumeUrl,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const deleteResume = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

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
			resumeUrl: null,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//--------------------Experience--------------------//

export const getExperience = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

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
				skills: exp.skills || [],
			})),
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const addExperience = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const {
			companyName,
			position,
			startDate,
			endDate,
			currentJob,
			description,
			location,
			skills,
		} = req.body;

		if (!companyName || !position || !startDate || currentJob === undefined) {
			return res.status(400).json({
				error: 'Company name, position, start date, and current job are required',
			});
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

		if (endDate && new Date(endDate) < new Date(startDate)) {
			return res.status(400).json({ error: 'End date must be after start date' });
		}

		const newExperience = await profileService.addExperience(userId, experienceData);

		if (!newExperience) {
			return res.status(500).json({ error: 'Error adding experience' });
		}

		// Add skills to the experience context
		const addedSkills = [];
		if (skills && skills.length > 0) {
			for (const skillName of skills) {
				const skill = await profileService.addSkill(
					userId,
					skillName,
					undefined,
					newExperience.id,
				);
				addedSkills.push(skill);
			}
		}

		res.status(200).json({
			message: 'Experience added successfully',
			experience: {
				id: newExperience.id,
				companyName: newExperience.company_name,
				position: newExperience.position,
				startDate: newExperience.start_date,
				endDate: newExperience.end_date,
				currentJob: newExperience.current_job,
				description: newExperience.description,
				location: newExperience.location,
				skills: addedSkills,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const updateExperience = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const experienceId = req.params.experienceId;
		const {
			companyName,
			position,
			startDate,
			endDate,
			currentJob,
			description,
			location,
			skills,
		} = req.body;

		if (!companyName || !position || !startDate || currentJob === undefined) {
			return res.status(400).json({
				error: 'Company name, position, start date, and current job are required',
			});
		}

		if (typeof currentJob !== 'boolean') {
			return res.status(400).json({ error: 'Current job must be true or false' });
		}

		// Prepare data for database update
		const experienceData = {
			company_name: companyName,
			position,
			start_date: startDate,
			end_date: currentJob ? null : endDate,
			current_job: currentJob,
			description: description || null,
			location: location || null,
		};

		// Update the experience
		const updatedExperience = await profileService.updateExperience(
			userId,
			experienceId,
			experienceData,
		);

		if (!updatedExperience) {
			return res.status(404).json({ error: 'Experience not found or not owned by user' });
		}
		// Update skills for the experience context
		const updatedSkills = [];
		if (skills && skills.length > 0) {
			for (const skillName of skills) {
				const skill = await profileService.addSkill(
					userId,
					skillName,
					undefined,
					experienceId,
				);
				updatedSkills.push(skill);
			}
		}
		const experienceSkills = await profileService.getSkillsForExperience(experienceId);

		res.json({
			message: 'Experience updated successfully',
			experience: {
				id: updatedExperience.id,
				companyName: updatedExperience.company_name,
				position: updatedExperience.position,
				startDate: updatedExperience.start_date,
				endDate: updatedExperience.end_date,
				currentJob: updatedExperience.current_job,
				description: updatedExperience.description,
				location: updatedExperience.location,
				skills: experienceSkills,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
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
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//--------------------Eductaion--------------------//

export const getEducation = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

	try {
		const education = await profileService.getEducation(userId);

		if (!education || education.length === 0) {
			return res.status(404).json({ error: 'No education found' });
		}

		// Return an array of education
		res.json(
			education.map((edu) => ({
				id: edu.id,
				school: edu.universityName,
				degree: edu.degree,
				startDate: edu.startDate,
				endDate: edu.endDate,
				skills: edu.skills || [],
			})),
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const addEducation = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { school, degree, startDate, endDate, skills } = req.body;

		if (!school || !degree || !startDate) {
			return res
				.status(400)
				.json({ error: 'School name, degree, and start date are required' });
		}

		const university = await profileService.findUniversity(school);
		if (!university) {
			return res.status(400).json({ error: 'School is invalid' });
		}

		const educationData = {
			user_id: userId,
			university_id: university.id,
			degree,
			field_of_study: null,
			start_date: startDate,
			end_date: endDate || null,
			grade: null,
			description: null,
			current_education: !endDate, // Assume current education if no endDate
		};

		if (endDate && new Date(endDate) < new Date(startDate)) {
			return res.status(400).json({ error: 'End date must be after start date' });
		}

		const newEducation = await profileService.addEducation(userId, educationData);

		if (!newEducation) {
			return res.status(404).json({ error: 'Error adding education' });
		}

		// Add skills to the education context
		const addedSkills = [];
		if (skills && skills.length > 0) {
			for (const skillName of skills) {
				await profileService.addSkill(userId, skillName, newEducation.id, undefined);
				addedSkills.push(skillName);
			}
		}

		res.status(200).json({
			message: 'Education added successfully',
			education: {
				id: newEducation.id,
				school: university.name,
				degree: newEducation.degree,
				startDate: newEducation.start_date,
				endDate: newEducation.end_date,
				skills: addedSkills,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const updateEducation = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const educationId = req.params.educationId;
		const { school, degree, startDate, endDate, skills } = req.body;

		if (!school || !degree || !startDate) {
			return res.status(400).json({
				error: 'School name, degree, and start date are required',
			});
		}

		const educationData = {
			school,
			degree,
			startDate,
			endDate,
		};

		const updatedEducation = await profileService.updateEducation(
			userId,
			educationId,
			educationData,
		);

		if (!updatedEducation) {
			return res.status(404).json({ error: 'Education record not found' });
		}

		// Update skills for the education context
		const updatedSkills = [];
		if (skills && skills.length > 0) {
			for (const skillName of skills) {
				await profileService.addSkill(userId, skillName, educationId, undefined);
				updatedSkills.push(skillName);
			}
		}

		const educationSkills = await profileService.getSkillsForEducation(educationId);

		res.json({
			message: 'Education updated successfully',
			education: {
				id: updatedEducation.id,
				school: updatedEducation.school,
				degree: updatedEducation.degree,
				startDate: updatedEducation.startDate,
				endDate: updatedEducation.endDate,
				skills: educationSkills,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
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
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//--------------------Certifications--------------------//

export const getCertifications = async (req: Request, res: Response) => {
	// Get userId from req.user
	const userId = (req as any).user?.id;

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
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const addCertification = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const { name, issuedBy, issueDate, expirationDate } = req.body;

		if (!name || !issuedBy || !issueDate) {
			return res
				.status(400)
				.json({ error: 'Name, issuing organization, and issue date are required' });
		}

		const certificationData = {
			name,
			issuingOrganization: issuedBy,
			issueDate: issueDate,
			expirationDate: expirationDate || null,
		};
		if (expirationDate && new Date(expirationDate) < new Date(issueDate)) {
			return res.status(400).json({ error: 'Expiration date must be after issue date' });
		}

		const newCertification = await profileService.addCertification(userId, certificationData);

		if (!newCertification) {
			return res.status(404).json({ error: 'Error adding certification' });
		}

		res.status(200).json({
			message: 'Certification added successfully',
			newCertification,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
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
				.json({ error: 'Name, issuing organization, and issue date are required' });
		}

		const certificationData = {
			name,
			issuingOrganization: issuedBy,
			issueDate: issueDate,
			expirationDate: expirationDate || null,
		};

		const updatedCertification = await profileService.updateCertification(
			userId,
			certificationId,
			certificationData,
		);

		if (!updatedCertification) {
			return res.status(404).json({ error: 'Certification not found' });
		}

		res.json({
			message: 'Certification updated successfully',
			certification: {
				id: updatedCertification.id,
				name: updatedCertification.name,
				issuedBy: updatedCertification.issuingOrganization,
				issueDate: updatedCertification.issueDate,
				expirationDate: updatedCertification.expirationDate,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
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
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
//--------------------Skills--------------------//

export const getSkills = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const skills = await profileService.getSkills(userId);
		if (!skills || skills.length === 0) {
			return res.status(404).json({ error: 'No skill found' });
		}
		res.json(skills);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const addSkill = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { name } = req.body;

		if (!name) {
			return res.status(400).json({ error: 'Skill name is required' });
		}

		const newSkill = await profileService.addSkill(userId, name);
		if (!newSkill) {
			return res.status(404).json({ error: 'Error adding skill' });
		}

		res.status(200).json({
			message: 'Skill added successfully',
			newSkill,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const deleteSkill = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const skillId = req.params.skillId;

		if (!skillId) {
			return res.status(400).json({ error: 'Skill ID is required' });
		}

		const deletedSkill = await profileService.deleteSkill(userId, skillId);

		if (!deletedSkill) {
			return res.status(404).json({ error: 'Skill not found' });
		}

		res.json({ message: 'Skill deleted successfully' });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//--------------------Profile Visibility--------------------//
export const getProfileVisibility = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const profileVisibility = await profileService.getProfileVisibility(userId);
		if (!profileVisibility) {
			return res.status(404).json({ error: 'No profile visibility found' });
		}
		res.json({
			visibility: profileVisibility.visibility,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
export const updateProfileVisibility = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const { visibility } = req.body;

		if (visibility != 'public' && visibility != 'private' && visibility != 'connections-only') {
			return res.status(400).json({
				error: 'Profile Visibility can only be public, private or connections-only',
			});
		}

		const updatedProfileVisibility = await profileService.updateProfileVisibility(
			userId,
			visibility,
		);
		if (!updatedProfileVisibility) {
			return res.status(404).json({ error: 'Privacy Setting not found' });
		}

		res.json({ message: 'Profile Visibility updated successfully', updatedProfileVisibility });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
//--------------------Create/Update new User--------------------//
export const getMyProfile = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id; // Get userId from the middleware

		// Fetch user profile
		const user = await profileService.getUserProfile(userId);
		if (!user) {
			return res.status(404).json({ error: 'User profile not found' });
		}

		const experiences = await profileService.getExperience(userId);
		const education = await profileService.getEducation(userId);
		const certifications = await profileService.getCertifications(userId);
		const skills = await profileService.getSkills(userId);
		const followersCount = await profileService.getFollowersCount(userId);

		// Combine all data into a single response
		res.json({
			profile: user,
			experiences,
			education,
			certifications,
			skills,
			followersCount,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
export const createUserProfile = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const { headline, bio, location, industry, skills, workExperience, education } = req.body;

		const newProfile = await profileService.createUserProfile(userId, {
			headline,
			bio,
			location,
			industry,
			skills,
			workExperience,
			education,
		});
		if (!newProfile) {
			return res.status(404).json({ error: 'Failed to create user profile' });
		}
		const user = await profileService.getUserProfile(userId);
		const exp = await profileService.getExperience(userId);
		const edu = await profileService.getEducation(userId);
		const cert = await profileService.getCertifications(userId);
		const ski = await profileService.getSkills(userId);
		const followersCount = await profileService.getFollowersCount(userId);

		res.status(200).json({
			message: 'User profile created successfully',
			profile: user,
			experiences: exp,
			education: edu,
			certifications: cert,
			skills: ski,
			followersCount,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const updateUserProfile = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const { headline, bio, location, industry, firstName, lastName } = req.body;

		const currentProfile = await profileService.getUserProfile(userId);
		if (!currentProfile) {
			return res.status(404).json({ error: 'Profile not found' });
		}

		const updatedProfileData = {
			headline: headline || currentProfile.headline,
			bio: bio || currentProfile.bio,
			location: location || currentProfile.location,
			industry: industry || currentProfile.industry,
			firstName: firstName || currentProfile.firstName,
			lastName: lastName || currentProfile.lastName,
		};

		const updatedProfile = await profileService.updateUserProfile(userId, updatedProfileData);

		if (!updatedProfile) {
			return res.status(404).json({ error: 'Profile not found' });
		}

		const user = await profileService.getUserProfile(userId);

		res.json({ message: 'User profile updated successfully', profile: user });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
