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
	const experiences = await knexInstance('work_experience')
		.leftJoin('skill_contexts', 'work_experience.id', 'skill_contexts.experience_id')
		.leftJoin('user_skills', 'skill_contexts.user_skill_id', 'user_skills.id')
		.leftJoin('skills', 'user_skills.skill_id', 'skills.id')
		.where('work_experience.user_id', userId)
		.select(
			'work_experience.id',
			'work_experience.company_name as companyName',
			'work_experience.position',
			'work_experience.start_date as startDate',
			'work_experience.end_date as endDate',
			'work_experience.location',
			'work_experience.description',
			knexInstance.raw('ARRAY_AGG(skills.skill_name) as skills'), // Aggregate skills into an array
		)
		.groupBy(
			'work_experience.id',
			'work_experience.company_name',
			'work_experience.position',
			'work_experience.start_date',
			'work_experience.end_date',
			'work_experience.location',
			'work_experience.description',
		);

	return experiences.map((exp) => ({
		id: exp.id,
		companyName: exp.companyName,
		position: exp.position,
		startDate: exp.startDate,
		endDate: exp.endDate,
		location: exp.location,
		description: exp.description,
		skills: exp.skills ? exp.skills.filter((skill: null) => skill !== null) : [], // Filter out null skills
	}));
};

export const addExperience = async (userId: string, experience: any) => {
	const [newExperience] = await knexInstance('work_experience')
		.insert({ id: uuidv4(), user_id: userId, ...experience })
		.returning('*');

	return newExperience;
};

export const updateExperience = async (userId: string, experienceId: string, experience: any) => {
	const rowsUpdated = await knexInstance('work_experience')
		.where({ id: experienceId, user_id: userId })
		.update({
			company_name: experience.company_name,
			position: experience.position,
			start_date: experience.start_date,
			end_date: experience.end_date,
			current_job: experience.current_job,
			description: experience.description,
			location: experience.location,
		})
		.returning('*');

	if (rowsUpdated.length === 0) return null;

	return rowsUpdated[0];
};
export const getSkillsForExperience = async (experienceId: string) => {
	return await knexInstance('skill_contexts')
		.join('user_skills', 'skill_contexts.user_skill_id', 'user_skills.id')
		.join('skills', 'user_skills.skill_id', 'skills.id')
		.where('skill_contexts.experience_id', experienceId)
		.select('skills.id', 'skills.skill_name as name');
};
export const deleteExperience = async (userId: string, experienceId: string) => {
	// Start a transaction to ensure atomicity
	return await knexInstance.transaction(async (trx) => {
		// Delete all contexts for the experience in `skill_contexts`
		await trx('skill_contexts').where({ experience_id: experienceId }).del();

		// Delete the experience record
		const [deletedExperience] = await trx('work_experience')
			.where({ id: experienceId, user_id: userId })
			.del()
			.returning('*');

		return deletedExperience;
	});
};
//--------------------Eductaion--------------------//

export const getEducation = async (userId: string) => {
	const education = await knexInstance('user_education')
		.join('universities', 'user_education.university_id', 'universities.id')
		.leftJoin('skill_contexts', 'user_education.id', 'skill_contexts.education_id')
		.leftJoin('user_skills', 'skill_contexts.user_skill_id', 'user_skills.id')
		.leftJoin('skills', 'user_skills.skill_id', 'skills.id')
		.where('user_education.user_id', userId)
		.select(
			'user_education.id',
			'universities.university_name as universityName',
			'user_education.degree',
			'user_education.start_date as startDate',
			'user_education.end_date as endDate',
			knexInstance.raw('ARRAY_AGG(skills.skill_name) as skills'), // Aggregate skills into an array
		)
		.groupBy(
			'user_education.id',
			'universities.university_name',
			'user_education.degree',
			'user_education.start_date',
			'user_education.end_date',
		);

	return education.map((edu) => ({
		id: edu.id,
		universityName: edu.universityName,
		degree: edu.degree,
		startDate: edu.startDate,
		endDate: edu.endDate,
		skills: edu.skills ? edu.skills.filter((skill: null) => skill !== null) : [], // Filter out null skills
	}));
};

export const findUniversity = async (school: string) => {
	const university = await knexInstance('universities')
		.select('id')
		.where({ university_name: school })
		.first();

	return university;
};

export const addEducation = async (userId: string, education: any) => {
	const [newEducation] = await knexInstance('user_education')
		.insert({ id: uuidv4(), user_id: userId, ...education })
		.returning('*');

	return newEducation;
};

export const updateEducation = async (userId: string, educationId: string, education: any) => {
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
export const getSkillsForEducation = async (educationId: string) => {
	return await knexInstance('skill_contexts')
		.join('user_skills', 'skill_contexts.user_skill_id', 'user_skills.id')
		.join('skills', 'user_skills.skill_id', 'skills.id')
		.where('skill_contexts.education_id', educationId)
		.select('skills.id', 'skills.skill_name as name');
};

export const deleteEducation = async (userId: string, educationId: string) => {
	// Start a transaction to ensure atomicity
	return await knexInstance.transaction(async (trx) => {
		// Delete all contexts for the education in `skill_contexts`
		await trx('skill_contexts').where({ education_id: educationId }).del();

		// Delete the education record
		const [deletedEducation] = await trx('user_education')
			.where({ id: educationId, user_id: userId })
			.del()
			.returning('*');

		return deletedEducation;
	});
};
//--------------------Certifications--------------------//

export const getCertifications = async (userId: string) => {
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
	const [deletedCertification] = await knexInstance('certifications')
		.where({ id: certificationId, user_id: userId })
		.del()
		.returning('*');

	return deletedCertification;
};
//--------------------Skills--------------------//

export const getSkills = async (userId: string) => {
	const skills = await knexInstance('user_skills')
		.join('skills', 'user_skills.skill_id', 'skills.id')
		.leftJoin('skill_contexts', 'user_skills.id', 'skill_contexts.user_skill_id')
		.leftJoin('user_education', 'skill_contexts.education_id', 'user_education.id')
		.leftJoin('universities', 'user_education.university_id', 'universities.id')
		.leftJoin('work_experience', 'skill_contexts.experience_id', 'work_experience.id')
		.select(
			'skills.id as skillId',
			'skills.skill_name as skillName',
			'universities.university_name as schoolName',
			'work_experience.company_name as companyName',
		)
		.where('user_skills.user_id', userId);

	// Group skills by their contexts
	const groupedSkills = skills.reduce((result, skill) => {
		const existingSkill = result.find((s: { skillId: any }) => s.skillId === skill.skillId);

		if (existingSkill) {
			// Add the context to the existing skill
			existingSkill.contexts.push({
				schoolName: skill.schoolName || null,
				companyName: skill.companyName || null,
			});
		} else {
			// Add a new skill with its context
			result.push({
				skillId: skill.skillId,
				skillName: skill.skillName,
				contexts: [
					{
						schoolName: skill.schoolName || null,
						companyName: skill.companyName || null,
					},
				],
			});
		}

		return result;
	}, []);

	return groupedSkills;
};

export const addSkill = async (
	userId: string,
	skillName: string,
	educationId?: string,
	experienceId?: string,
) => {
	if (!skillName) {
		throw new Error('Skill name is required');
	}

	// Check if the skill already exists in the `skills` table
	let skill = await knexInstance('skills').select('id').where({ skill_name: skillName }).first();

	// If the skill does not exist, add it to the `skills` table
	if (!skill) {
		const [newSkill] = await knexInstance('skills')
			.insert({ id: uuidv4(), skill_name: skillName })
			.returning('*');
		skill = newSkill;
	}

	// Check if the skill is already linked to the user in `user_skills`
	let userSkill = await knexInstance('user_skills')
		.where({ user_id: userId, skill_id: skill.id })
		.first();

	// If not, add it to `user_skills`
	if (!userSkill) {
		const [newUserSkill] = await knexInstance('user_skills')
			.insert({ id: uuidv4(), user_id: userId, skill_id: skill.id })
			.returning('*');
		userSkill = newUserSkill;
	}

	// Add the context (education or experience) to `skill_contexts`
	const existingContext = await knexInstance('skill_contexts')
		.where({
			user_skill_id: userSkill.id,
			education_id: educationId || null,
			experience_id: experienceId || null,
		})
		.first();

	if (!existingContext) {
		await knexInstance('skill_contexts').insert({
			id: uuidv4(),
			user_skill_id: userSkill.id,
			education_id: educationId || null,
			experience_id: experienceId || null,
		});
	}

	return { id: skill.id, name: skillName };
};

export const deleteSkill = async (userId: string, skillId: string) => {
	if (!skillId) {
		throw new Error('Skill ID is required');
	}

	// Check if the skill exists in the `user_skills` table for the given user
	const userSkill = await knexInstance('user_skills')
		.where({ user_id: userId, skill_id: skillId })
		.first();

	if (!userSkill) {
		throw new Error('Skill not found for this user');
	}

	// Start a transaction to ensure atomicity
	return await knexInstance.transaction(async (trx) => {
		// Delete all contexts for the skill in `skill_contexts`
		await trx('skill_contexts').where({ user_skill_id: userSkill.id }).del();

		// Delete the skill from the `user_skills` table
		const [deletedSkill] = await trx('user_skills')
			.where({ id: userSkill.id })
			.del()
			.returning('*');

		return deletedSkill;
	});
};

//--------------------Profile Visibility--------------------//
export const getProfileVisibility = async (userId: string) => {
	return knexInstance('user_privacy_settings')
		.select('profile_visibility as visibility')
		.where({ user_id: userId })
		.first();
};

export const updateProfileVisibility = async (userId: string, visibility: string) => {
	const rowsUpdated = await knexInstance('user_privacy_settings')
		.where({ user_id: userId })
		.update({ profile_visibility: visibility })
		.returning('*');

	if (rowsUpdated.length === 0) return null;

	return rowsUpdated[0];
};
//--------------------Create/Update new User--------------------//

export const createUserProfile = async (userId: string, profileData: any) => {
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
	// Update the `user_profiles` table
	const updatedProfile = {
		headline: profileData.headline || null,
		bio: profileData.bio || null,
		location: profileData.location || null,
		industry: profileData.industry || null,
		last_updated: knexInstance.fn.now(),
	};

	const profileRowsUpdated = await knexInstance('user_profiles')
		.where({ user_id: userId })
		.update(updatedProfile);

	// Update the `users` table for firstName and lastName
	const updatedUser = {
		first_name: profileData.firstName || null,
		last_name: profileData.lastName || null,
	};

	const userRowsUpdated = await knexInstance('users').where({ id: userId }).update(updatedUser);

	if (profileRowsUpdated === 0 && userRowsUpdated === 0) return null;

	// Return the updated profile
	return await knexInstance('user_profiles')
		.join('users', 'user_profiles.user_id', 'users.id')
		.select(
			'user_profiles.headline',
			'user_profiles.location',
			'user_profiles.profile_picture_url as profilePictureUrl',
			'user_profiles.cover_photo_url as coverPhotoUrl',
			'user_profiles.resume_url as resumeUrl',
			'user_profiles.industry',
			'user_profiles.bio',
			'users.user_name as userName',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'users.is_premium',
			'users.is_active',
		)
		.where('user_profiles.user_id', userId)
		.first();
};

export const getUserProfile = async (userId: string) => {
	return await knexInstance('user_profiles')
		.join('users', 'user_profiles.user_id', 'users.id')
		.select(
			'user_profiles.headline',
			'user_profiles.location',
			'user_profiles.profile_picture_url as profilePictureUrl',
			'user_profiles.cover_photo_url as coverPhotoUrl',
			'user_profiles.resume_url as resumeUrl',
			'user_profiles.industry',
			'user_profiles.bio',
			'users.user_name as userName',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'users.is_premium',
			'users.is_active',
		)
		.where('user_profiles.user_id', userId)
		.first();
};

export const getFollowersCount = async (userId: string) => {
	const result = await knexInstance('following')
		.where({ followed_id: userId })
		.count('id as count')
		.first();

	return result?.count || 0;
};

export const getConnectionsCount = async (userId: string) => {
	const result = await knexInstance('connections')
		.where(function () {
			this.where({ requester_id: userId }).orWhere({ receiver_id: userId });
		})
		.andWhere({ status: 'accepted' })
		.count('id as count')
		.first();

	return result?.count || 0;
};

export const areUsersConnected = async (userId1: string, userId2: string): Promise<boolean> => {
	const connection = await knexInstance('connections')
		.where(function () {
			this.where({ requester_id: userId1, receiver_id: userId2 }).orWhere({
				requester_id: userId2,
				receiver_id: userId1,
			});
		})
		.andWhere({ status: 'accepted' })
		.first();

	return !!connection;
};
