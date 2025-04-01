import multer from 'multer';

// Memory storage keeps files in buffer (not saved to disk)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	const allowedTypes = [
		'image/jpeg',
		'image/png',
		'video/mp4',
		'application/pdf',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Unsupported file type.'));
	}
};

export const upload = multer({
	storage,
	limits: {
		fileSize: 20 * 1024 * 1024, // 20 MB limit
	},
	fileFilter,
});
