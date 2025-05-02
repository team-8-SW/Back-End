import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../utils/cloudinary';
import { knexInstance as db } from '../config/db';
import { areUsersConnected } from '../models/connection.model';
import { notifyUser } from '../utils/notifications';

/* ======================= Send private messages to connections =============================*/
export const createTextMessage = async (senderId: string, receiverId: string, content: string) => {
	// Check if user is in my connections or not first
	const connected = await areUsersConnected(senderId, receiverId);

	//premium check --adam
	
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

		// Emit a notification to the receiver
		notifyUser(
			receiverId,
			{
				type: 'message',
				content: `You received a message from ${sendername.user_name}`,
			},
			senderId,
		);

		// Add `isSender: true` to the response
		return {
			...message,
			isSender: true,
		};
	} else {
		// Send a request
		const [request] = await db('messages')
			.insert({
				id: uuidv4(),
				sender_id: senderId,
				receiver_id: receiverId,
				content,
				is_request: true,
			})
			.returning(['id', 'content', 'sent_at', 'status']);

		const sendername = await db('users').where({ id: senderId }).select('user_name').first();

		// Emit a notification to the receiver
		notifyUser(
			receiverId,
			{
				type: 'message',
				content: `You received a message request from ${sendername.user_name}`,
			},
			senderId,
		);

		// Add `isSender: true` to the response
		return {
			...request,
			isSender: true,
		};
	}
};
//acceptRequest -noor
export const acceptthisRequest = async (userId: string, senderId: string) => {
	const requests = await db('messages')
		.where({ sender_id: senderId, receiver_id: userId })
		.update({ is_request: false })
		.returning('*');

	if (!requests || requests.length === 0) {
		throw new Error('No messages found or not authorized to accept.');
	}

	return requests;
};

//rejectRequest -noor
export const declinehisRequest = async (userId: string, senderId: string) => {
	const requests = await db('messages')
		.where({ sender_id: senderId, receiver_id: userId })
		.update({ is_request: true })
		.returning('*');

	if (!requests || requests.length === 0) {
		throw new Error('No messages found or not authorized to accept.');
	}

	return requests;
};
/* ======================= Send media messages to connections =============================*/
export const createMediaMessage = async (
	senderId: string,
	receiverId: string,
	file: Express.Multer.File,
) => {
	let resourceType: 'image' | 'video' | 'auto' = 'image';
	//premium check --adam
	

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
		.orderBy('sent_at', 'asc')
		.select(
			'id',
			'sender_id',
			'receiver_id',
			'content',
			'media_url',
			'media_type',
			'sent_at',
			'is_read',
		);

	// Add `isSender` field to each message
	const formattedMessages = messages.map((msg) => ({
		...msg,
		isSender: msg.sender_id === userId, // true if the user is the sender
	}));

	return formattedMessages;
};

export const getConversationParticipants = async (userIds: string[]) => {
	const result = await db('users')
		.select('id', 'first_name as firstName', 'last_name as lastName', 'user_name')
		.whereIn('id', userIds);
	return result;
};

export const getAllConversationsForUser = async (userId: string) => {
	// 1. Get all messages where user is sender or receiver
	const rawMessages = await db('messages')
		.where('sender_id', userId)
		.orWhere('receiver_id', userId)
		.andWhere('is_request', false)
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

	// 3. Fetch user info (include profile_picture and user_name)
	const users = await db('users')
		.select('id', 'first_name as firstName', 'last_name as lastName', 'user_name')
		.whereIn('id', otherUserIds);

	const userMapInfo = new Map(users.map((u) => [u.id, u]));

	// 4. Format response
	const conversations = Array.from(userMap.entries()).map(([otherUserId, lastMsg]) => ({
		id: `${userId}_${otherUserId}`,
		participants: [userMapInfo.get(otherUserId)],
		lastMessage: lastMsg.content || '', // could also append media_type
		timestamp: lastMsg.sent_at,
		profilePicture: userMapInfo.get(otherUserId)?.profile_picture || null,
		userName: userMapInfo.get(otherUserId)?.user_name || null,
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
	// 1. Get all messages where the user is the receiver and `is_request` is true
	const rawMessages = await db('messages')
		.where('receiver_id', userId)
		.andWhere('is_request', true)
		.select('id', 'sender_id', 'receiver_id', 'content', 'media_url', 'media_type', 'sent_at');

	// 2. Extract unique conversation user IDs
	const userMap = new Map<string, any>();

	for (const msg of rawMessages) {
		const otherUserId = msg.sender_id;

		if (!userMap.has(otherUserId)) {
			userMap.set(otherUserId, msg); // First message we find (will replace below if newer)
		}

		// Replace if newer
		const existing = userMap.get(otherUserId);
		if (new Date(msg.sent_at) > new Date(existing.sent_at)) {
			userMap.set(otherUserId, msg);
		}
	}

	const otherUserIds = Array.from(userMap.keys());

	// 3. Fetch user info (include first name, last name, and user name)
	const users = await db('users')
		.select('id', 'first_name as firstName', 'last_name as lastName', 'user_name')
		.whereIn('id', otherUserIds);

	const userMapInfo = new Map(users.map((u) => [u.id, u]));

	// 4. Format response
	const requests = Array.from(userMap.entries()).map(([otherUserId, lastMsg]) => ({
		id: lastMsg.id,
		participants: [userMapInfo.get(otherUserId)],
		lastMessage: lastMsg.content || '',
		timestamp: lastMsg.sent_at,
	}));

	return requests;
};
