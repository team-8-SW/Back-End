// import { Response } from 'express';
// import { AuthenticatedRequest } from '../middleware/auth.middleware';
// import { areUsersConnected } from '../models/connection.model';
// import { isUserBlocked } from '../models/block.model';
// import { setUserTyping, isUserTypingTo } from '../utils/typingStatus';
// import {
// 	createTextMessage,
// 	createMediaMessage,
// 	getConversationBetweenUsers,
// 	getConversationParticipants,
// 	getAllConversationsForUser,
// 	getUnreadMessageCount,
// 	markConversationAsRead,
// 	markConversationAsUnread,
// 	getLastMessageReadStatus,
// 	getAllRequests,
// } from '../services/messaging.service';

// /* ======================= Send private messages to connections =============================*/
// export const sendTextMessage = async (req: AuthenticatedRequest, res: Response) => {
// 	try {
// 		const senderId = req.user?.id;
// 		const { receiverId, content } = req.body;

// 		if (!senderId || !receiverId || !content) {
// 			return res.status(400).json({ message: 'Missing required fields' });
// 		}

// 		const blocked = await isUserBlocked(senderId, receiverId);
// 		if (blocked) {
// 			return res.status(403).json({ message: 'You are blocked by this user.' });
// 		}
// 		const message = await createTextMessage(senderId, receiverId, content);

// 		return res.status(201).json({
// 			message: 'Message sent successfully',
// 			content: message.content,
// 		});
// 	} catch (err) {
// 		console.error(err);
// 		return res.status(500).json({ message: 'Internal server error' });
// 	}
// };

/* ======================= Send media messages to connections =============================*/
// export const sendMediaMessage = async (req: AuthenticatedRequest, res: Response) => {
// 	try {
// 		const senderId = req.user?.id;
// 		const receiverId = req.body.receiverId;
// 		const file = req.file;

// 		console.log('senderId:', senderId);
// 		console.log('receiverId:', receiverId);
// 		console.log('file:', file);

// 		if (!senderId || !receiverId || !file) {
// 			console.warn('Missing field(s)', { senderId, receiverId, file });
// 			return res.status(400).json({ message: 'Missing required fields' });
// 		}

// 		const blocked = await isUserBlocked(senderId, receiverId);
// 		if (blocked) {
// 			return res.status(403).json({ message: 'You are blocked by this user.' });
// 		}

// 		const connected = await areUsersConnected(senderId, receiverId);
// 		if (!connected) {
// 			return res.status(403).json({ message: 'You are not connected to this user.' });
// 		}

// 		const message = await createMediaMessage(senderId, receiverId, file);

// 		return res.status(201).json({
// 			message: 'Media sent successfully',
// 			media: {
// 				url: message.media_url,
// 				type: message.media_type,
// 			},
// 		});
// 	} catch (err: any) {
// 		console.error('Media message error:', err);
// 		return res.status(500).json({ message: err?.message || 'Server error' });
// 	}
// };

// /* ======================= Get Conversation History =============================*/
// export const getConversationWithUser = async (req: AuthenticatedRequest, res: Response) => {
// 	try {
// 		const userId = req.user?.id;
// 		const otherUserId = req.params.userId;

// 		if (!userId || !otherUserId) {
// 			return res.status(400).json({ message: 'Missing user ID' });
// 		}

// 		const connected = await areUsersConnected(userId, otherUserId);
// 		if (!connected) {
// 			return res.status(403).json({ message: 'You are not connected to this user.' });
// 		}

// 		const messagesRaw = await getConversationBetweenUsers(userId, otherUserId);
// 		const participants = await getConversationParticipants([userId, otherUserId]);

// 		const messages = messagesRaw.map((msg) => ({
// 			id: msg.id,
// 			senderId: msg.sender_id,
// 			content: msg.content || '',
// 			timestamp: msg.sent_at,
// 		}));

// 		return res.status(200).json({
// 			id: `${userId}_${otherUserId}`,
// 			participants,
// 			messages,
// 		});
// 	} catch (err: any) {
// 		console.error('Get conversation error:', err.message);
// 		return res.status(500).json({ message: 'Internal server error' });
// 	}
// };

// export const getConversations = async (req: AuthenticatedRequest, res: Response) => {
// 	try {
// 		const userId = req.user?.id;

// 		if (!userId) {
// 			return res.status(400).json({ message: 'Missing user ID' });
// 		}

// 		const conversations = await getAllConversationsForUser(userId);

// 		return res.status(200).json(conversations);
// 	} catch (err: any) {
// 		console.error('Get conversations error:', err.message);
// 		return res.status(500).json({ message: 'Internal server error' });
// 	}
// };

// /* ======================= Get unseen messages count =============================*/
// export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
// 	try {
// 		const userId = req.user?.id;

// 		if (!userId) {
// 			return res.status(400).json({ message: 'Missing user ID' });
// 		}

// 		const unreadCount = await getUnreadMessageCount(userId);

// 		return res.status(200).json({ unreadCount });
// 	} catch (err: any) {
// 		console.error('Unread count error:', err.message);
// 		return res.status(500).json({ message: 'Internal server error' });
// 	}
// };

// /* ======================= Mark conversation as read/unread =============================*/
// export const markConversationRead = async (req: AuthenticatedRequest, res: Response) => {
// 	try {
// 		const receiverId = req.user?.id;
// 		const senderId = req.params.userId;

// 		if (!receiverId || !senderId) {
// 			return res.status(400).json({ message: 'Missing user ID' });
// 		}

// 		await markConversationAsRead(receiverId, senderId);

// 		return res.status(200).json({ message: 'Conversation marked as read' });
// 	} catch (err: any) {
// 		console.error('Error marking conversation as read:', err.message);
// 		return res.status(500).json({ message: 'Internal server error' });
// 	}
// };
// export const markConversationUnread = async (req: AuthenticatedRequest, res: Response) => {
// 	try {
// 		const receiverId = req.user?.id;
// 		const senderId = req.params.userId;

// 		if (!receiverId || !senderId) {
// 			return res.status(400).json({ message: 'Missing user ID' });
// 		}

// 		await markConversationAsUnread(receiverId, senderId);

// 		return res.status(200).json({ message: 'Conversation marked as unread' });
// 	} catch (err: any) {
// 		console.error('Error marking conversation as unread:', err.message);
// 		return res.status(500).json({ message: 'Internal server error' });
// 	}
// };

// /* ======================= Get last message read status =============================*/
// export const getLastMessageReadStatusController = async (
// 	req: AuthenticatedRequest,
// 	res: Response,
// ) => {
// 	try {
// 		const userId = req.user?.id;
// 		const otherUserId = req.params.userId;

// 		if (!userId || !otherUserId) {
// 			return res.status(400).json({ message: 'Missing user ID' });
// 		}

// 		const status = await getLastMessageReadStatus(userId, otherUserId);

// 		if (!status) {
// 			return res.status(404).json({ message: 'No messages found' });
// 		}

// 		return res.status(200).json({
// 			lastMessageId: status.id,
// 			senderId: status.senderId,
// 			isRead: status.isRead,
// 			timestamp: status.timestamp,
// 		});
// 	} catch (err: any) {
// 		console.error('Get read status error:', err.message);
// 		return res.status(500).json({ message: 'Internal server error' });
// 	}
// };

// /* ======================= Typing Indicators =============================*/

// // POST /api/messages/typing-indicators
// export const postTypingIndicator = (req: AuthenticatedRequest, res: Response) => {
// 	const senderId = req.user?.id;
// 	const receiverId = req.body.receiverId;

// 	if (!senderId || !receiverId) {
// 		return res.status(400).json({ message: 'Missing user IDs' });
// 	}

// 	setUserTyping(senderId, receiverId); // 5s default
// 	return res.status(200).json({ message: 'Typing status recorded' });
// };

// // GET /api/messages/typing-indicators?userId=...
// export const getTypingIndicator = (req: AuthenticatedRequest, res: Response) => {
// 	const me = req.user?.id;
// 	const otherUserId = req.query.userId as string;

// 	if (!me || !otherUserId) {
// 		return res.status(400).json({ message: 'Missing user ID' });
// 	}

// 	const typing = isUserTypingTo(otherUserId, me); // Are they typing *to me*
// 	return res.status(200).json({ isTyping: typing });
// };

// //noor
// export const getRequests = async (req: AuthenticatedRequest, res: Response) => {
// 	try {
// 		const userId = req.user?.id;

// 		if (!userId) {
// 			return res.status(400).json({ message: 'Missing user ID' });
// 		}

// 		const conversations = await getAllRequests(userId);

// 		return res.status(200).json(conversations);
// 	} catch (err: any) {
// 		console.error('Get conversations error:', err.message);
// 		return res.status(500).json({ message: 'Internal server error' });
// 	}
// };
