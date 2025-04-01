import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../utils/cloudinary';
import knex from 'knex';
import { pool } from '../config/db';
import { createMessage } from '../models/message.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { areUsersConnected } from '../models/connection.model';

const db = knex({
	client: 'pg',
	connection: pool.options,
});

export const sendTextMessage = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const senderId = req.user?.id;
		const { receiverId, content } = req.body;

		if (!senderId || !receiverId || !content) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const connected = await areUsersConnected(senderId, receiverId);
		if (!connected) {
			return res.status(403).json({ message: 'You are not connected to this user.' });
		}

		const message = await createMessage({
			senderId,
			receiverId,
			content,
		});

		return res.status(201).json({
			message: 'Message sent successfully',
			content: message.content,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export const sendMediaMessage = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const senderId = req.user?.id;
		const receiverId = req.body.receiverId;
		const file = req.file;

		if (!senderId || !receiverId || !file) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const connected = await areUsersConnected(senderId, receiverId);
		if (!connected) {
			return res.status(403).json({ message: 'You are not connected to this user.' });
		}

		let resourceType: 'image' | 'video' | 'raw' = 'image';

		if (file.mimetype.startsWith('video')) {
			resourceType = 'video';
		} else if (
			file.mimetype === 'application/pdf' ||
			file.mimetype === 'application/msword' ||
			file.mimetype ===
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.mimetype.startsWith('audio')
		) {
			resourceType = 'raw';
		}

		let mediaType: 'image' | 'video' | 'document' | 'audio' = 'document';

		if (file.mimetype.startsWith('image')) {
			mediaType = 'image';
		} else if (file.mimetype.startsWith('video')) {
			mediaType = 'video';
		} else if (file.mimetype.startsWith('audio')) {
			mediaType = 'audio';
		}

		const uploadToCloudinary = (): Promise<any> => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{
						folder: 'linkedin-clone/messages',
						resource_type: resourceType,
						type: 'upload',
					},
					(error, result) => {
						if (error) return reject(error);
						resolve(result);
					},
				);
				stream.end(file.buffer);
			});
		};

		const uploadResult = await uploadToCloudinary();
		const mediaUrl = uploadResult.secure_url;

		const [saved] = await db('messages')
			.insert({
				id: uuidv4(),
				sender_id: senderId,
				receiver_id: receiverId,
				content: '',
				media_url: mediaUrl,
				media_type: mediaType,
				status: 'sent',
			})
			.returning(['id', 'media_url', 'media_type']);

		return res.status(201).json({
			message: 'Media sent successfully',
			media: {
				url: saved.media_url,
				type: saved.media_type,
			},
		});
	} catch (err: any) {
		console.error('Media message error:', err.message);
		return res.status(500).json({ message: err.message || 'Server error' });
	}
};
