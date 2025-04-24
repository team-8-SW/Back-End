import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../utils/cloudinary';
import { knexInstance as db } from '../config/db';
import { areUsersConnected } from '../models/connection.model';
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
			.returning(['id', 'content', 'sent_at']);
			return message;
	} else {//send a request
		const [request] = await db('messages')
		.insert({
			id: uuidv4(),
			sender_id: senderId,
			receiver_id: receiverId,
			content,
			status: 'sent',
			is_request: true,
		})
			.returning("*");
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
	return db('messages')
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
};

export const getConversationParticipants = async (userIds: string[]) => {
	const result = await db('users')
		.select('id', 'first_name as firstName', 'last_name as lastName')
		.whereIn('id', userIds);
	return result;
};

export const getAllConversationsForUser = async (userId: string) => {
	// 1. Get all messages where user is sender or receiver
	const rawMessages = await db('messages')
		.where('sender_id', userId)
		.orWhere('receiver_id', userId)
		.select('id', 'sender_id', 'receiver_id', 'content', 'media_url', 'media_type', 'sent_at');

	// 2. Extract unique conversation user IDs
	const userMap = new Map<string, any>();

	for (const msg of rawMessages) {
		const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;

		if (!userMap.has(otherUserId)) {
			userMap.set(otherUserId, msg); // first message we find (will replace below if newer)
		}

		// replace if newer
		const existing = userMap.get(otherUserId);
		if (new Date(msg.sent_at) > new Date(existing.sent_at)) {
			userMap.set(otherUserId, msg);
		}
	}

	const otherUserIds = Array.from(userMap.keys());

	// 3. Fetch user info
	const users = await db('users')
		.select('id', 'first_name as firstName', 'last_name as lastName')
		.whereIn('id', otherUserIds);

	const userMapInfo = new Map(users.map((u) => [u.id, u]));

	// 4. Format response
	const conversations = Array.from(userMap.entries()).map(([otherUserId, lastMsg]) => ({
		id: `${userId}_${otherUserId}`,
		participants: [userMapInfo.get(otherUserId)],
		lastMessage: lastMsg.content || '', // could also append media_type
		timestamp: lastMsg.sent_at,
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
 //getAllRequests
 export const getAllRequests = async (userId: string) => {
	// 1. Get all messages where user is receiver
	const rawMessages = await db('messages_requests')
		.where({ receiver_id: userId, status: 'pending' })
		.select('*');

	// 2. Extract unique conversation user IDs
	const userMap = new Map<string, any>();

	for (const msg of rawMessages) {
		const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;

		if (!userMap.has(otherUserId)) {
			userMap.set(otherUserId, msg); // first message we find (will replace below if newer)
		}

		// replace if newer
		const existing = userMap.get(otherUserId);
		if (new Date(msg.sent_at) > new Date(existing.sent_at)) {
			userMap.set(otherUserId, msg);
		}
	}

	const otherUserIds = Array.from(userMap.keys());

	// 3. Fetch user info
	const users = await db('users')
		.select('id', 'first_name as firstName', 'last_name as lastName')
		.whereIn('id', otherUserIds);

	const userMapInfo = new Map(users.map((u) => [u.id, u]));

	// 4. Format response
	const requests = Array.from(userMap.entries()).map(([otherUserId, lastMsg]) => ({
		id: `${userId}_${otherUserId}`,
		participants: [userMapInfo.get(otherUserId)],
		lastMessage: lastMsg.content || '', // could also append media_type
		timestamp: lastMsg.sent_at,
	}));

	return requests;
};