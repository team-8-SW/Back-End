import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { knexInstance } from '../config/db';

export const getProfileById = async (id: string) => {
	return await knexInstance('userprofiles')
		.select(
			'userprofiles.id', // Specify the table for the id
			'users.first_name as firstName',
			'users.last_name as lastName',
			'userprofiles.headline',
			'userprofiles.location',
			'userprofiles.profile_picture_url as profilePictureUrl',
		)
		.join('users', 'userprofiles.user_id', 'users.id') // Join with users table
		.where({ 'userprofiles.user_id': id })
		.first();
};

//--------------------Profile Picture--------------------//

export const updateProfilePicture = async (userId: string, profilePictureUrl: string) => {
	if (!userId) {
		throw new Error('User ID is missing in updateProfilePicture function');
	}

	const rowsUpdated = await knexInstance('userprofiles')
		.where({ user_id: userId })
		.update({ profile_picture_url: profilePictureUrl });

	if (rowsUpdated === 0) return null;

	return knexInstance('userprofiles')
		.select('profile_picture_url as profilePictureUrl')
		.where({ user_id: userId })
		.first();
};

export const deleteProfilePicture = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteProfilePicture function');
	}

	const rowsUpdated = await knexInstance('userprofiles')
		.where({ user_id: userId })
		.update({ profile_picture_url: null });

	if (rowsUpdated === 0) return null;

	return knexInstance('userprofiles')
		.select('profile_picture_url as profilePictureUrl')
		.where({ user_id: userId })
		.first();
};

//--------------------Cover Photo--------------------//

export const updateCoverPicture = async (userId: string, coverPhotoUrl: string) => {
	if (!userId) {
		throw new Error('User ID is missing in updateCoverPicture function');
	}

	const rowsUpdated = await knexInstance('userprofiles')
		.where({ user_id: userId })
		.update({ cover_photo_url: coverPhotoUrl });

	if (rowsUpdated === 0) return null;

	return knexInstance('userprofiles')
		.select('cover_photo_url as coverPhotoUrl')
		.where({ user_id: userId })
		.first();
};

export const deleteCoverPicture = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteCoverPicture function');
	}

	const rowsUpdated = await knexInstance('userprofiles')
		.where({ user_id: userId })
		.update({ cover_photo_url: null });

	if (rowsUpdated === 0) return null;

	return knexInstance('userprofiles')
		.select('cover_photo_url as coverPhotoUrl')
		.where({ user_id: userId })
		.first();
};

//--------------------Resume--------------------//
export const updateResume = async (userId: string, resumeUrl: string) => {
	if (!userId) {
		throw new Error('User ID is missing in updateResume function');
	}

	const rowsUpdated = await knexInstance('userprofiles')
		.where({ user_id: userId })
		.update({ resume_url: resumeUrl });

	if (rowsUpdated === 0) return null;

	return knexInstance('userprofiles')
		.select('resume_url as resumeUrl')
		.where({ user_id: userId })
		.first();
};

export const deleteResume = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteResume function');
	}

	const rowsUpdated = await knexInstance('userprofiles')
		.where({ user_id: userId })
		.update({ resume_url: null });

	if (rowsUpdated === 0) return null;

	return knexInstance('userprofiles')
		.select('resume_url as resumeUrl')
		.where({ user_id: userId })
		.first();
};

//--------------------Experience--------------------//
export const getExperience = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in getExperience function');
	}

	return await knexInstance('workexperience')
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

	const [newExperience] = await knexInstance('workexperience')
		.insert({ id: uuidv4(), user_id: userId, ...experience })
		.returning('*');

	return newExperience;
};

export const updateExperience = async (userId: string, experienceId: string, experience: any) => {
	if (!userId) {
		throw new Error('User ID is missing in updateExperience function');
	}

	const rowsUpdated = await knexInstance('workexperience')
		.where({ id: experienceId, user_id: userId })
		.update(experience);

	if (rowsUpdated === 0) return null;

	return knexInstance('workexperience').where({ id: experienceId }).first();
};

export const deleteExperience = async (userId: string, experienceId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteExperience function');
	}

	const deletedExperience = await knexInstance('workexperience')
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

	return await knexInstance('education')
		.select(
			'id',
			'school',
			'degree',
			'field_of_study as fieldOfStudy',
			'start_date as startDate',
			'end_date as endDate',
		)
		.where({ user_id: userId });
};
