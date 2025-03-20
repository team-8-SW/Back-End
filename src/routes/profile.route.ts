import express from 'express';
import * as profileController from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import multer from 'multer';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); // Save files in 'uploads/' directory
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname); // to avoid having duplicate file names
	},
});

const upload = multer({ storage });

const router = express.Router();
//--------------------View Other user Profiles--------------------//
// GET /api/profiles/:userId
router.get('/:userId', profileController.getProfileById);

//--------------------Profile Managment--------------------//
// POST /api/profiles/me/profile-picture
router.post(
	'/me/profile-picture',
	authMiddleware,
	upload.single('file'),
	profileController.updateProfilePicture,
);

// DELETE /api/profiles/me/profile-picture
router.delete('/me/profile-picture', authMiddleware, profileController.deleteProfilePicture);

//POST /api/profiles/me/cover-photo
router.post(
	'/me/cover-photo',
	authMiddleware,
	upload.single('file'),
	profileController.updateCoverPhoto,
);

//DELETE /api/profiles/me/cover-photo
router.delete('/me/cover-photo', authMiddleware, profileController.deleteCoverPhoto);

//POST /api/profiles/me/resume
router.post('/me/resume', authMiddleware, upload.single('file'), profileController.updateResume);

//DELETE /api/profiles/me/resume
router.delete('/me/resume', authMiddleware, profileController.deleteResume);

//--------------------Work Experience--------------------//
//GET /api/profiles/me/experience
router.get('/me/experience', authMiddleware, profileController.getExperience);

//POST /api/profiles/me/experience
router.post('/me/experience', authMiddleware, profileController.addExperience);

//PUT /api/profiles/me/experience/:experienceId
router.put('/me/experience/:experienceId', authMiddleware, profileController.updateExperience);

//DELETE /api/profiles/me/experience/:experienceId
router.delete('/me/experience/:experienceId', authMiddleware, profileController.deleteExperience);

//--------------------Eductaion--------------------//
//GET /api/profiles/me/education
router.get('/me/education', authMiddleware, profileController.getEducation);

//POST /api/profiles/me/education
router.post('/me/education', authMiddleware, profileController.addEducation);

//PUT /api/profiles/me/education/:educationId
router.put('/me/education/:educationId', authMiddleware, profileController.updateEducation);

//DELETE /api/profiles/me/education/:educationId
router.delete('/me/education/:educationId', authMiddleware, profileController.deleteEducation);

//--------------------Certifications--------------------//
//GET /api/profiles/me/certifications
router.get('/me/certifications', authMiddleware, profileController.getCertifications);

//POST /api/profiles/me/certifications
router.post('/me/certifications', authMiddleware, profileController.addCertification);

//PUT /api/profiles/me/certifications/:certificationId
router.put(
	'/me/certifications/:certificationId',
	authMiddleware,
	profileController.updateCertification,
);

//DELETE /api/profiles/me/certifications/:certificationId
router.delete(
	'/me/certifications/:certificationId',
	authMiddleware,
	profileController.deleteCertification,
);

//--------------------Skills--------------------//
//GET /api/profiles/me/skills
router.get('/me/skills', authMiddleware, profileController.getSkills);

//POST /api/profiles/me/skills
router.post('/me/skills', authMiddleware, profileController.addSkill);

//DELETE /api/profiles/me/skills/:skillId
router.delete('/me/skills/:skillId', authMiddleware, profileController.deleteSkill);

///POST /api/profiles/users/:userId/skills/:skillId/endorse
//router.post('/users/:userId/skills/:skillId/endorse', authMiddleware, profileController.endorseSkill);

//--------------------Profile Visibility--------------------//
//GET /api/profiles/me/visibility
router.get('/me/visibility', authMiddleware, profileController.getProfileVisibility);

//PUT /api/profiles/me/visibility
router.put('/me/visibility', authMiddleware, profileController.updateProfileVisibility);

//--------------------Create/Update new User--------------------//
//POST /api/profiles/me
router.post('/me', authMiddleware, profileController.createUserProfile);

//PUT /api/profiles/me
router.put('/me', authMiddleware, profileController.updateUserProfile);

export default router;
