import express from 'express';
import * as profileController from '../controllers/profile.controller';
import { authMiddleware2 } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer';

const router = express.Router();
//--------------------View Other user Profiles--------------------//
// GET /api/profiles/:userId
router.get('/:userId', profileController.getProfileById);

//--------------------Profile Managment--------------------//
// POST /api/profiles/me/profile-picture
router.post(
	'/me/profile-picture',
	authMiddleware2,
	upload.single('file'),
	profileController.updateProfilePicture,
);

// DELETE /api/profiles/me/profile-picture
router.delete('/me/profile-picture', authMiddleware2, profileController.deleteProfilePicture);

//POST /api/profiles/me/cover-photo
router.post(
	'/me/cover-photo',
	authMiddleware2,
	upload.single('file'),
	profileController.updateCoverPhoto,
);

//DELETE /api/profiles/me/cover-photo
router.delete('/me/cover-photo', authMiddleware2, profileController.deleteCoverPhoto);

//POST /api/profiles/me/resume
router.post('/me/resume', authMiddleware2, upload.single('file'), profileController.updateResume);

//DELETE /api/profiles/me/resume
router.delete('/me/resume', authMiddleware2, profileController.deleteResume);

//--------------------Work Experience--------------------//
//GET /api/profiles/me/experience
router.get('/me/experience', authMiddleware2, profileController.getExperience);

//POST /api/profiles/me/experience
router.post('/me/experience', authMiddleware2, profileController.addExperience);

//PUT /api/profiles/me/experience/:experienceId
router.put('/me/experience/:experienceId', authMiddleware2, profileController.updateExperience);

//DELETE /api/profiles/me/experience/:experienceId
router.delete('/me/experience/:experienceId', authMiddleware2, profileController.deleteExperience);

//--------------------Eductaion--------------------//
//GET /api/profiles/me/education
router.get('/me/education', authMiddleware2, profileController.getEducation);

//POST /api/profiles/me/education
router.post('/me/education', authMiddleware2, profileController.addEducation);

//PUT /api/profiles/me/education/:educationId
router.put('/me/education/:educationId', authMiddleware2, profileController.updateEducation);

//DELETE /api/profiles/me/education/:educationId
router.delete('/me/education/:educationId', authMiddleware2, profileController.deleteEducation);

//--------------------Certifications--------------------//
//GET /api/profiles/me/certifications
router.get('/me/certifications', authMiddleware2, profileController.getCertifications);

//POST /api/profiles/me/certifications
router.post('/me/certifications', authMiddleware2, profileController.addCertification);

//PUT /api/profiles/me/certifications/:certificationId
router.put(
	'/me/certifications/:certificationId',
	authMiddleware2,
	profileController.updateCertification,
);

//DELETE /api/profiles/me/certifications/:certificationId
router.delete(
	'/me/certifications/:certificationId',
	authMiddleware2,
	profileController.deleteCertification,
);

//--------------------Skills--------------------//
//GET /api/profiles/me/skills
router.get('/me/skills', authMiddleware2, profileController.getSkills);

//POST /api/profiles/me/skills
router.post('/me/skills', authMiddleware2, profileController.addSkill);

//DELETE /api/profiles/me/skills/:skillId
router.delete('/me/skills/:skillId', authMiddleware2, profileController.deleteSkill);

///POST /api/profiles/users/:userId/skills/:skillId/endorse
//router.post('/users/:userId/skills/:skillId/endorse', authMiddleware2, profileController.endorseSkill);

//--------------------Profile Visibility--------------------//
//GET /api/profiles/me/visibility
router.get('/me/visibility', authMiddleware2, profileController.getProfileVisibility);

//PUT /api/profiles/me/visibility
router.put('/me/visibility', authMiddleware2, profileController.updateProfileVisibility);

//--------------------Create/Update new User--------------------//
//POST /api/profiles/me
router.post('/me', authMiddleware2, profileController.createUserProfile);

//PUT /api/profiles/me
router.put('/me', authMiddleware2, profileController.updateUserProfile);
//GET /api/profiles/me
router.get('/', authMiddleware2, profileController.getMyProfile);

export default router;
