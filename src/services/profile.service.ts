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
		.select('id', 'institution', 'degree', 'start_date as startDate', 'end_date as endDate')
		.where({ user_id: userId });
};

export const addEducation = async (userId: string, education: any) => {
	if (!userId) {
		throw new Error('User ID is missing in addEducation function');
	}

	const [newEducation] = await knexInstance('education')
		.insert({ id: uuidv4(), user_id: userId, ...education })
		.returning('*');

	return newEducation;
};

export const updateEducation = async (userId: string, educationId: string, education: any) => {
	if (!userId) {
		throw new Error('User ID is missing in updateEducation function');
	}

	const rowsUpdated = await knexInstance('education')
		.where({ id: educationId, user_id: userId })
		.update(education);

	if (rowsUpdated === 0) return null;

	return knexInstance('education').where({ id: educationId }).first();
};

export const deleteEducation = async (userId: string, educationId: string) => {
	if (!userId) {
		throw new Error('User ID is missing in deleteEducation function');
	}

	const deletedEducation = await knexInstance('education')
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

//--------------------Profile Visibility--------------------//

export const updateProfileVisibility = async (userId: string, visibility: string) => {
	if (!userId) {
		throw new Error('User ID is missing in updateProfileVisibility function');
	}

	const rowsUpdated = await knexInstance('userprivacysettings')
		.where({ user_id: userId })
		.update({ profile_visibility: visibility })
		.returning('*');

	if (rowsUpdated.length === 0) return null;

	return rowsUpdated[0];
};
