import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { knexInstance } from '../config/db';

export const getProfileById = async (id: string) => {
	return await knexInstance('user_profiles')
		.select(
			'user_profiles.id', // Specify the table for the id
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.headline',
			'user_profiles.location',
			'user_profiles.profile_picture_url as profilePictureUrl',
		)
		.join('users', 'user_profiles.user_id', 'users.id') // Join with users table
		.where({ 'user_profiles.user_id': id })
		.first();
};

//--------------------Profile Picture--------------------//

export const updateProfilePicture = async (userId: string, profilePictureUrl: string) => {
	if (!userId) {
		throw new Error('User ID is missing in updateProfilePicture function');
	}

	const rowsUpdated = await knexInstance('user_profiles')
		.where({ user_id: userId })
		.update({ profile_picture_url: profilePictureUrl });

	if (rowsUpdated === 0) return null;

	return knexInstance('user_profiles')
		.select('profile_picture_url as profilePictureUrl')
		.where({ user_id: userId })
		.first();
};

export const deleteProfilePicture = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteProfilePicture function');
	}

	const rowsUpdated = await knexInstance('user_profiles')
		.where({ user_id: userId })
		.update({ profile_picture_url: null });

	if (rowsUpdated === 0) return null;

	return knexInstance('user_profiles')
		.select('profile_picture_url as profilePictureUrl')
		.where({ user_id: userId })
		.first();
};

//--------------------Cover Photo--------------------//

export const updateCoverPicture = async (userId: string, coverPhotoUrl: string) => {
	if (!userId) {
		throw new Error('User ID is missing in updateCoverPicture function');
	}

	const rowsUpdated = await knexInstance('user_profiles')
		.where({ user_id: userId })
		.update({ cover_photo_url: coverPhotoUrl });

	if (rowsUpdated === 0) return null;

	return knexInstance('user_profiles')
		.select('cover_photo_url as coverPhotoUrl')
		.where({ user_id: userId })
		.first();
};

export const deleteCoverPicture = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteCoverPicture function');
	}

	const rowsUpdated = await knexInstance('user_profiles')
		.where({ user_id: userId })
		.update({ cover_photo_url: null });

	if (rowsUpdated === 0) return null;

	return knexInstance('user_profiles')
		.select('cover_photo_url as coverPhotoUrl')
		.where({ user_id: userId })
		.first();
};

//--------------------Resume--------------------//
export const updateResume = async (userId: string, resumeUrl: string) => {
	if (!userId) {
		throw new Error('User ID is missing in updateResume function');
	}

	const rowsUpdated = await knexInstance('user_profiles')
		.where({ user_id: userId })
		.update({ resume_url: resumeUrl });

	if (rowsUpdated === 0) return null;

	return knexInstance('user_profiles')
		.select('resume_url as resumeUrl')
		.where({ user_id: userId })
		.first();
};

export const deleteResume = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteResume function');
	}

	const rowsUpdated = await knexInstance('user_profiles')
		.where({ user_id: userId })
		.update({ resume_url: null });

	if (rowsUpdated === 0) return null;

	return knexInstance('user_profiles')
		.select('resume_url as resumeUrl')
		.where({ user_id: userId })
		.first();
};

//--------------------Experience--------------------//
export const getExperience = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in getExperience function');
	}

	return await knexInstance('work_experience')
		.select(
			'id',
			'company_name as companyName',
			'position',
			'start_date as startDate',
			'end_date as endDate',
			'location',
			'description',
		)
		.where({ user_id: userId });
};

export const addExperience = async (userId: string, experience: any) => {
	if (!userId) {
		throw new Error('User ID is missing in addExperience function');
	}

	const [newExperience] = await knexInstance('work_experience')
		.insert({ id: uuidv4(), user_id: userId, ...experience })
		.returning('*');

	return newExperience;
};

export const updateExperience = async (userId: string, experienceId: string, experience: any) => {
	if (!userId) {
		throw new Error('User ID is missing in updateExperience function');
	}

	const rowsUpdated = await knexInstance('work_experience')
		.where({ id: experienceId, user_id: userId })
		.update(experience);

	if (rowsUpdated === 0) return null;

	return knexInstance('work_experience').where({ id: experienceId }).first();
};

export const deleteExperience = async (userId: string, experienceId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteExperience function');
	}

	const deletedExperience = await knexInstance('work_experience')
		.where({ id: experienceId, user_id: userId })
		.del()
		.returning('*');

	return deletedExperience;
};

//--------------------Eductaion--------------------//

export const getEducation = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in getEducation function');
	}

	return await knexInstance('user_education')
		.join('universities', 'user_education.university_id', 'universities.id') // Join to get university name
		.select(
			'user_education.id',
			'universities.university_name as universityName',
			'user_education.degree',
			'user_education.start_date as startDate',
			'user_education.end_date as endDate',
		)
		.where({ 'user_education.user_id': userId });
};

export const findUniversity = async (school: string) => {
	const university = await knexInstance('universities')
		.select('id')
		.where({ university_name: school })
		.first();

	return university;
};

export const addEducation = async (userId: string, education: any) => {
	if (!userId) {
		throw new Error('User ID is missing in addEducation function');
	}

	const [newEducation] = await knexInstance('user_education')
		.insert({ id: uuidv4(), user_id: userId, ...education })
		.returning('*');

	return newEducation;
};

export const updateEducation = async (userId: string, educationId: string, education: any) => {
	if (!userId) {
		throw new Error('User ID is missing in updateEducation function');
	}

	const university = await findUniversity(education.school);
	if (!university) {
		throw new Error(`University '${education.school}' not found`);
	}

	const updatedEducation = {
		university_id: university.id,
		degree: education.degree,
		start_date: education.startDate,
		end_date: education.endDate || null,
		current_education: !education.endDate,
	};

	const rowsUpdated = await knexInstance('user_education')
		.where({ id: educationId, user_id: userId })
		.update(updatedEducation)
		.returning('*');

	if (rowsUpdated.length === 0) return null;

	return rowsUpdated[0];
};

export const deleteEducation = async (userId: string, educationId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteEducation function');
	}

	const deletedEducation = await knexInstance('user_education')
		.where({ id: educationId, user_id: userId })
		.del()
		.returning('*');

	return deletedEducation;
};

//--------------------Certifications--------------------//

export const getCertifications = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in getCertifications function');
	}

	return await knexInstance('certifications')
		.select(
			'id',
			'name',
			'issuing_organization as issuingOrganization',
			'issue_date as issueDate',
			'expiration_date as expirationDate',
		)
		.where({ user_id: userId });
};

export const addCertification = async (userId: string, certification: any) => {
	if (!userId) {
		throw new Error('User ID is missing in addCertification function');
	}

	const newCertification = {
		id: uuidv4(),
		user_id: userId,
		name: certification.name,
		issuing_organization: certification.issuingOrganization,
		issue_date: certification.issueDate,
		expiration_date: certification.expirationDate || null,
		credential_url: null,
	};

	try {
		const [insertedCertification] = await knexInstance('certifications')
			.insert(newCertification)
			.returning([
				'id',
				'name',
				'issuing_organization as issuedBy',
				'issue_date as issueDate',
				'expiration_date as expirationDate',
			]);

		return insertedCertification;
	} catch (error) {
		throw new Error('Database error: Unable to add certification');
	}
};

export const updateCertification = async (
	userId: string,
	certificationId: string,
	certification: any,
) => {
	if (!userId) {
		throw new Error('User ID is missing in updateCertification function');
	}

	const updatedCertification = {
		name: certification.name,
		issuing_organization: certification.issuingOrganization,
		issue_date: certification.issueDate,
		expiration_date: certification.expirationDate || null,
		credential_url: null,
	};

	const rowsUpdated = await knexInstance('certifications')
		.where({ id: certificationId, user_id: userId })
		.update(updatedCertification)
		.returning('*');

	if (rowsUpdated.length === 0) return null;

	return rowsUpdated[0];
};

export const deleteCertification = async (userId: string, certificationId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteCertification function');
	}

	const [deletedCertification] = await knexInstance('certifications')
		.where({ id: certificationId, user_id: userId })
		.del()
		.returning('*');

	return deletedCertification;
};
//--------------------Skills--------------------//

export const getSkills = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in getSkills function');
	}

	const skills = await knexInstance('user_skills')
		.join('skills', 'user_skills.skill_id', 'skills.id')
		.select('skills.id', 'skills.skill_name as name')
		.where('user_skills.user_id', userId);

	return skills;
};

export const addSkill = async (userId: string, skillName: string) => {
	if (!userId) {
		throw new Error('User ID is missing in addSkill function');
	}
	if (!skillName) {
		throw new Error('Skill name is required');
	}

	// Check if skill already exists in `skills` table
	let skill = await knexInstance('skills').select('id').where({ skill_name: skillName }).first();

	// If skill does not exist, add it to `skills` table
	if (!skill) {
		const [newSkill] = await knexInstance('skills')
			.insert({ id: uuidv4(), skill_name: skillName })
			.returning('*');
		skill = newSkill;
	}

	// Add skill to `user_skills` table if not already added
	const existingSkill = await knexInstance('user_skills')
		.where({ user_id: userId, skill_id: skill.id })
		.first();

	if (existingSkill) {
		throw new Error('Skill already added');
	}

	await knexInstance('user_skills').insert({
		user_id: userId,
		skill_id: skill.id,
	});

	return { id: skill.id, name: skillName };
};

export const deleteSkill = async (userId: string, skillId: string) => {
	if (!userId || !skillId) {
		throw new Error('User ID and Skill ID are required');
	}

	// Check if skill exists in user_skills table
	const skill = await knexInstance('user_skills')
		.where({ user_id: userId, skill_id: skillId })
		.first();

	if (!skill) {
		throw new Error('Skill not found for this user');
	}

	return await knexInstance('user_skills')
		.where({ user_id: userId, skill_id: skillId })
		.del()
		.returning('*');
};

//--------------------Profile Visibility--------------------//
export const getProfileVisibility = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in getProfileVisibility function');
	}
	return knexInstance('user_privacy_settings')
		.select('profile_visibility as visibility')
		.where({ user_id: userId })
		.first();
};

export const updateProfileVisibility = async (userId: string, visibility: string) => {
	if (!userId) {
		throw new Error('User ID is missing in updateProfileVisibility function');
	}

	const rowsUpdated = await knexInstance('user_privacy_settings')
		.where({ user_id: userId })
		.update({ profile_visibility: visibility })
		.returning('*');

	if (rowsUpdated.length === 0) return null;

	return rowsUpdated[0];
};
//--------------------Create/Update new User--------------------//

export const createUserProfile = async (userId: string, profileData: any) => {
	if (!userId) {
		throw new Error('User ID is required');
	}

	try {
		await knexInstance('user_profiles').insert({
			id: uuidv4(),
			user_id: userId,
			headline: profileData.headline || null,
			bio: profileData.bio || null,
			location: profileData.location || null,
			industry: profileData.industry || null,
			last_updated: knexInstance.fn.now(),
		});

		if (profileData.skills?.length) {
			for (const skillName of profileData.skills) {
				let skill = await knexInstance('skills')
					.select('id')
					.where({ skill_name: skillName })
					.first();

				if (!skill) {
					const [newSkill] = await knexInstance('skills')
						.insert({ id: uuidv4(), skill_name: skillName })
						.returning('*');
					skill = newSkill;
				}

				await knexInstance('user_skills').insert({
					user_id: userId,
					skill_id: skill.id,
				});
			}
		}

		if (profileData.workExperience?.length) {
			for (const experience of profileData.workExperience) {
				await knexInstance('work_experience').insert({
					id: uuidv4(),
					user_id: userId,
					company_name: experience.companyName,
					position: experience.position,
					start_date: experience.startDate,
					end_date: experience.endDate || null,
					current_job: experience.currentJob || false,
					description: experience.description || null,
					location: experience.location || null,
				});
			}
		}

		if (profileData.education?.length) {
			for (const edu of profileData.education) {
				const university = await knexInstance('universities')
					.select('id')
					.where({ university_name: edu.school })
					.first();

				if (!university) {
					throw new Error(`University '${edu.school}' not found in the database.`);
				}
				await knexInstance('user_education').insert({
					id: uuidv4(),
					user_id: userId,
					university_id: university.id,
					degree: edu.degree || null,
					start_date: edu.startDate,
					end_date: edu.endDate || null,
					current_education: !edu.endDate,
					description: edu.description || null,
					grade: edu.grade || null,
				});
			}
		}
		return await knexInstance('user_profiles').where({ user_id: userId }).first();
	} catch (error) {
		throw new Error('Failed to create user profile');
	}
};

export const updateUserProfile = async (userId: string, profileData: any) => {
	if (!userId) {
		throw new Error('User ID is required');
	}

	const updatedProfile = {
		headline: profileData.headline || null,
		bio: profileData.bio || null,
		location: profileData.location || null,
		industry: profileData.industry || null,
		last_updated: knexInstance.fn.now(),
	};

	const rowsUpdated = await knexInstance('user_profiles')
		.where({ user_id: userId })
		.update(updatedProfile)
		.returning('*');

	if (rowsUpdated.length === 0) return null;
	return rowsUpdated[0];
};
