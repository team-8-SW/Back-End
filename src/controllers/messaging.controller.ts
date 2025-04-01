import { Response } from 'express';
import { createMessage } from '../models/message.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { areUsersConnected } from '../models/connection.model';

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
