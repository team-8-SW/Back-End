import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import knex from 'knex';
import { pool } from '../config/db';
import {
	createTextMessage,
	createMediaMessage,
	getConversationBetweenUsers,
	getAllConversationsForUser,
	getUnreadMessageCount,
	markConversationAsRead,
	markConversationAsUnread,
	getLastMessageReadStatus,
	getAllRequests,
} from '../services/messaging.service';
import { isUserBlocked } from '../models/block.model';
import { isUserTypingTo, setUserTyping } from '../utils/typingStatus';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET!;

const db = knex({
	client: 'pg',
	connection: pool.options,
});

interface MessagePayload {
	receiverId: string;
	content?: string;
	file?: Express.Multer.File;
}

export const setupMessagingSocket = (io: Server) => {
	io.use((socket, next) => {
		const token = socket.handshake.auth?.token;
		if (!token) return next(new Error('Authentication error: Token missing'));

		try {
			const decoded = jwt.verify(token, jwtSecret) as { id: string };
			socket.data.userId = decoded.id;
			next();
		} catch (err) {
			next(new Error('Authentication error: Invalid token'));
		}
	});

	io.on('connection', (socket: Socket) => {
		const userId = socket.data.userId;
		console.log('🔌 New WebSocket connection:', socket.id);
		console.log('User connected:', userId);

		socket.on('join_room', (roomId: string) => {
			if (roomId) socket.join(roomId);
		});

		socket.on('send_text', async ({ receiverId, content }: MessagePayload) => {
			const senderId = socket.data.userId;
			if (!receiverId || !content) return;
			if (await isUserBlocked(senderId, receiverId)) return;

			console.log(`[send_text] ${senderId} ➡ ${receiverId}: ${content}`);

			if (await isUserBlocked(senderId, receiverId)) {
				console.log(`[send_text] blocked`);
				return;
			}

			const message = await createTextMessage(senderId, receiverId, content);
			console.log(`[send_text] Message created`, message);

			const rooms = Array.from(io.sockets.adapter.rooms.keys());
			console.log(`[send_text] All current rooms:`, rooms);
			io.to(receiverId).emit('receive_message', message);
		});

		socket.on('send_media', async ({ receiverId, file }: MessagePayload) => {
			const senderId = socket.data.userId;
			if (!receiverId || !file) return;
			if (await isUserBlocked(senderId, receiverId)) return;

			const message = await createMediaMessage(senderId, receiverId, file);
			io.to(receiverId).emit('receive_message', message);
		});

		socket.on('send_message_request', async ({ receiverId, content }: MessagePayload) => {
			const senderId = socket.data.userId;
			if (!receiverId || !content) return;
			if (await isUserBlocked(senderId, receiverId)) return;

			const message = await db('messages')
				.insert({
					id: uuidv4(),
					sender_id: senderId,
					receiver_id: receiverId,
					content,
					status: 'pending',
				})
				.returning(['id', 'sender_id', 'receiver_id', 'content', 'sent_at', 'status']);

			io.to(receiverId).emit('receive_message_request', message);
		});

		socket.on('typing', ({ receiverId }: { receiverId: string }) => {
			const senderId = socket.data.userId;
			if (receiverId) {
				setUserTyping(senderId, receiverId);
				io.to(receiverId).emit('typing', { from: senderId });
			}
		});

		socket.on('get_typing_status', ({ receiverId }: { receiverId: string }) => {
			const senderId = socket.data.userId;
			if (!receiverId) return;
			const isTyping = isUserTypingTo(senderId, receiverId);
			socket.emit('typing_status_response', { senderId, receiverId, isTyping });
		});

		socket.on('mark_as_read', async ({ otherUserId }: { otherUserId: string }) => {
			const senderId = socket.data.userId;
			if (otherUserId) {
				await markConversationAsRead(senderId, otherUserId);
				io.to(otherUserId).emit('conversation_read', { by: senderId });
			}
		});

		socket.on('mark_as_unread', async ({ otherUserId }: { otherUserId: string }) => {
			const senderId = socket.data.userId;
			if (otherUserId) {
				await markConversationAsUnread(senderId, otherUserId);
				io.to(otherUserId).emit('conversation_unread', { by: senderId });
			}
		});

		socket.on('get_conversation', async ({ otherUserId }: { otherUserId: string }) => {
			const senderId = socket.data.userId;
			if (!otherUserId) return;
			const messages = await getConversationBetweenUsers(senderId, otherUserId);
			socket.emit('conversation_history', messages);
		});

		socket.on('get_all_conversations', async () => {
			const senderId = socket.data.userId;
			const conversations = await getAllConversationsForUser(senderId);
			socket.emit('all_conversations', conversations);
		});

		socket.on('get_unseen_count', async () => {
			const senderId = socket.data.userId;
			const count = await getUnreadMessageCount(senderId);
			socket.emit('unseen_count', count);
		});

		socket.on('get_read_status', async ({ userId2 }: { userId2: string }) => {
			const userId1 = socket.data.userId;
			if (!userId2) return;
			const status = await getLastMessageReadStatus(userId1, userId2);
			socket.emit('read_status', status);
		});

		socket.on('get_message_requests', async () => {
			const userId = socket.data.userId;
			try {
				const requests = await getAllRequests(userId);
				socket.emit('message_requests', requests);
			} catch (err) {
				socket.emit('error', {
					type: 'message_requests',
					message: 'Failed to fetch requests',
				});
			}
		});

		socket.on('accept_message_request', async ({ requestId }: { requestId: string }) => {
			if (!requestId) return;

			const request = await db('messages')
				.where({ id: requestId, status: 'pending' })
				.first();
			if (!request) return;

			const [newMessage] = await db('messages')
				.insert({
					id: uuidv4(),
					sender_id: request.sender_id,
					receiver_id: request.receiver_id,
					content: request.content,
					media_url: request.media_url,
					media_type: request.media_type,
					status: 'sent',
					sent_at: new Date(),
				})
				.returning(['id', 'sender_id', 'receiver_id', 'content', 'sent_at']);

			await db('messages').where({ id: requestId }).update({ status: 'sent' });

			io.to(request.receiver_id).emit('receive_message', {
				...request,
				status: 'sent',
			});
		});
	});
};
