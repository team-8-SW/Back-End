import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../utils/cloudinary';
import { knexInstance as db } from '../config/db';
import { areUsersConnected } from '../models/connection.model';
import { notifyUser } from '../utils/notifications';
/* ======================= Send private messages to connections =============================*/
export const createTextMessage = async (senderId: string, receiverId: string, content: string) => {
	//check if user is in my connections or not first
	const connected = await areUsersConnected(senderId, receiverId);
	if (connected) {
		const [message] = await db('messages')
			.insert({
				id: uuidv4(),
				sender_id: senderId,
				receiver_id: receiverId,
				content,
				status: 'sent',
			})
			.returning(['id', 'content', 'sent_at', 'status']);

		const sendername = await db('users').where({ id: senderId }).select('user_name').first();
		// Emit a notification to the post owner
		notifyUser(
			receiverId,
			{
				type: 'message',
				content: `You received a message from ${sendername}`,
			},
			senderId,
		);

		return message;
	} else {
		//send a request
		const [request] = await db('messages')
			.insert({
				id: uuidv4(),
				sender_id: senderId,
				receiver_id: receiverId,
				content,
				status: 'pending',
			})
			.returning(['id', 'content', 'sent_at', 'status']);
		return request;
	}
};
// //acceptRequest -noor
// export const acceptthisRequest = async (userId: string, request_id: string) => {
// 	const [request] = await db('messages_requests')
// 		.where({ id: request_id, receiver_id: userId })
// 		.update({ status: 'accepted' })
// 		.returning("*");
// 		if (!request) {
// 			throw new Error('Message request not found or not authorized to accept.');
// 		}
// 	const [message] = await db('messages')
// 		.insert({
// 			id: uuidv4(),
// 			sender_id: request.sender_id,
// 			receiver_id: request.receiver_id,
// 			content: request.content,
// 			sent_at: request.sent_at,
// 			status: 'sent',
// 		})
// 		.returning("*");
// 	return message;
// };
// //rejectRequest -noor
// export const declinethisRequest = async (userId: string, request_id: string) => {
// 	const [request] = await db('messages_requests')
// 		.where({ id: request_id, receiver_id: userId })
// 		.update({ status: 'declined' })
// 		.returning("*");
// 		if (!request) {
// 			throw new Error('Message request not found or not authorized to accept.');
// 		}
// 	return request;
// };
/* ======================= Send media messages to connections =============================*/
export const createMediaMessage = async (
	senderId: string,
	receiverId: string,
	file: Express.Multer.File,
) => {
	let resourceType: 'image' | 'video' | 'auto' = 'image';

	if (file.mimetype.startsWith('video')) {
		resourceType = 'video';
	} else if (
		file.mimetype.startsWith('audio') ||
		file.mimetype === 'application/pdf' ||
		file.mimetype === 'application/msword' ||
		file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	) {
		resourceType = 'auto';
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

	const [message] = await db('messages')
		.insert({
			id: uuidv4(),
			sender_id: senderId,
			receiver_id: receiverId,
			content: '',
			media_url: uploadResult.secure_url,
			media_type: mediaType,
			status: 'sent',
		})
		.returning(['id', 'media_url', 'media_type', 'sent_at']);
	return message;
};

/* ======================= Get Conversation History =============================*/
export const getConversationBetweenUsers = async (userId: string, otherUserId: string) => {
	const messages = await db('messages')
		.where(function () {
			this.where({ sender_id: userId, receiver_id: otherUserId }).orWhere({
				sender_id: otherUserId,
				receiver_id: userId,
			});
		})
		.andWhere(function () {
			this.where('is_deleted_by_sender', false).orWhere('is_deleted_by_receiver', false);
		})
		.orderBy('sent_at', 'asc');

	const participants = await db('users')
		.select(
			'users.id',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.profile_picture_url as profilePictureUrl',
		)
		.leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
		.whereIn('users.id', [userId, otherUserId]);

	const userMap = new Map(participants.map((u) => [u.id, u]));

	const formattedMessages = messages.map((msg) => ({
		id: msg.id,
		content: msg.content,
		mediaUrl: msg.media_url,
		mediaType: msg.media_type,
		sentAt: msg.sent_at,
		sender: userMap.get(msg.sender_id),
		receiver: userMap.get(msg.receiver_id),
	}));

	return {
		conversationId: `${userId}_${otherUserId}`,
		messages: formattedMessages,
		participants: participants,
	};
};

export const getConversationParticipants = async (userIds: string[]) => {
	const result = await db('users')
		.select('id', 'first_name as firstName', 'last_name as lastName')
		.whereIn('id', userIds);
	return result;
};

export const getAllConversationsForUser = async (userId: string) => {
	const rawMessages = await db('messages')
		.where('sender_id', userId)
		.orWhere('receiver_id', userId)
		.select('id', 'sender_id', 'receiver_id', 'content', 'media_url', 'media_type', 'sent_at');

	const latestMessageMap = new Map<string, any>();

	for (const msg of rawMessages) {
		const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;

		const existing = latestMessageMap.get(otherUserId);
		if (!existing || new Date(msg.sent_at) > new Date(existing.sent_at)) {
			latestMessageMap.set(otherUserId, msg);
		}
	}

	const otherUserIds = Array.from(latestMessageMap.keys());

	if (otherUserIds.length === 0) {
		return [];
	}

	const users = await db('users')
		.select(
			'users.id',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.profile_picture_url as profilePictureUrl',
		)
		.leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
		.whereIn('users.id', otherUserIds);

	const userMap = new Map(users.map((u) => [u.id, u]));

	const conversations = Array.from(latestMessageMap.entries()).map(([otherUserId, lastMsg]) => ({
		conversationId: `${userId}_${otherUserId}`,
		participant: userMap.get(otherUserId),
		lastMessage: {
			content: lastMsg.content,
			mediaUrl: lastMsg.media_url,
			mediaType: lastMsg.media_type,
			timestamp: lastMsg.sent_at,
		},
	}));

	return conversations;
};

/* ======================= Get unseen messages count =============================*/
export const getUnreadMessageCount = async (userId: string) => {
	const result = await db('messages')
		.where({ receiver_id: userId, is_read: false, is_deleted_by_receiver: false })
		.count('id as count')
		.first();
	return Number((result as any)?.count || 0);
};

/* ======================= Mark conversation as read/unread =============================*/
export const markConversationAsRead = async (loggedInUserId: string, otherUserId: string) => {
	return db('messages')
		.where({
			sender_id: otherUserId,
			receiver_id: loggedInUserId,
			is_read: false,
		})
		.update({ is_read: true });
};

export const markConversationAsUnread = async (loggedInUserId: string, otherUserId: string) => {
	return db('messages')
		.where({
			sender_id: otherUserId,
			receiver_id: loggedInUserId,
			is_read: true,
		})
		.update({ is_read: false });
};

/* ======================= Get last message read status =============================*/
export const getLastMessageReadStatus = async (userId1: string, userId2: string) => {
	const message = await db('messages')
		.where(function () {
			this.where({ sender_id: userId1, receiver_id: userId2 }).orWhere({
				sender_id: userId2,
				receiver_id: userId1,
			});
		})
		.orderBy('sent_at', 'desc')
		.first();

	if (!message) return null;

	return {
		id: message.id,
		senderId: message.sender_id,
		isRead: message.is_read,
		timestamp: message.sent_at,
	};
};

/*============================== Get All Requests ===============================*/
export const getAllRequests = async (userId: string) => {
	const rawMessages = await db('messages')
		.where('receiver_id', userId)
		.andWhere('status', 'pending')
		.select('id', 'sender_id', 'receiver_id', 'content', 'media_url', 'media_type', 'sent_at');

	const userMap = new Map<string, any>();

	for (const msg of rawMessages) {
		const otherUserId = msg.sender_id;
		if (!userMap.has(otherUserId)) {
			userMap.set(otherUserId, msg);
		}
		const existing = userMap.get(otherUserId);
		if (new Date(msg.sent_at) > new Date(existing.sent_at)) {
			userMap.set(otherUserId, msg);
		}
	}

	const otherUserIds = Array.from(userMap.keys());

	const users = await db('users')
		.select('id', 'first_name as firstName', 'last_name as lastName')
		.whereIn('id', otherUserIds);

	const userMapInfo = new Map(users.map((u) => [u.id, u]));

	const requests = Array.from(userMap.entries()).map(([otherUserId, lastMsg]) => ({
		id: lastMsg.id,
		participants: [userMapInfo.get(otherUserId)],
		lastMessage: lastMsg.content || '',
		timestamp: lastMsg.sent_at,
	}));

	return requests;
};
