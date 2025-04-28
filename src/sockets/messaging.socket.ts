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
	acceptthisRequest,
	declinehisRequest,
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
			socket.join(decoded.id);
			next();
		} catch (err) {
			next(new Error('Authentication error: Invalid token'));
		}
	});

	io.on('connection', (socket: Socket) => {
		const userId = socket.data.userId;
		console.log('🔌 New WebSocket connection:', socket.id);
		console.log('User connected:', userId);

		socket.on('send_text', async ({ receiverId, content }: MessagePayload) => {
			try {
				if (!receiverId || !content) return;
				if (await isUserBlocked(userId, receiverId)) return;

				const message = await createTextMessage(userId, receiverId, content);

				// Emit to the receiver
				io.to(receiverId).emit('receive_message', message);
				// Emit to the sender as well
				io.to(userId).emit('receive_message', message);
			} catch (error) {
				console.error('Error in send_text:', error);
			}
		});

		socket.on('send_media', async ({ receiverId, file }: MessagePayload) => {
			try {
				if (!receiverId || !file) return;
				if (await isUserBlocked(userId, receiverId)) return;

				const message = await createMediaMessage(userId, receiverId, file);
				// Emit to both receiver and sender
				io.to(receiverId).emit('receive_message', message);
				io.to(userId).emit('receive_message', message);
			} catch (error) {
				console.error('Error in send_media:', error);
			}
		});

		socket.on('send_message_request', async ({ receiverId, content }: MessagePayload) => {
			try {
				if (!receiverId || !content) return;
				if (await isUserBlocked(userId, receiverId)) return;

				const [message] = await db('messages')
					.insert({
						id: uuidv4(),
						sender_id: userId,
						receiver_id: receiverId,
						content,
						status: 'pending',
					})
					.returning(['id', 'sender_id', 'receiver_id', 'content', 'sent_at', 'status']);

				io.to(receiverId).emit('receive_message_request', message);
			} catch (error) {
				console.error('Error in send_message_request:', error);
			}
		});

		socket.on('accept_message_request', async ({ requestId }: { requestId: string }) => {
			try {
				if (!requestId) return;

				const receiverId = socket.data.userId;

				const request = await db('messages')
					.where({ id: requestId, receiver_id: receiverId, status: 'pending' })
					.first();

				if (!request) {
					socket.emit('error', { message: 'Request not found or not authorized.' });
					return;
				}

				await db('messages').where({ id: requestId }).update({
					status: 'sent',
				});

				io.to(request.sender_id).emit('message_request_accepted', {
					requestId,
					senderId: request.sender_id,
					receiverId: request.receiver_id,
				});

				socket.emit('accept_success', {
					message: 'Message request accepted successfully.',
					requestId,
				});
			} catch (error) {
				console.error('Error in accept_message_request:', error);
				socket.emit('error', { message: 'Failed to accept message request.' });
			}
		});

		socket.on('typing', ({ receiverId }: { receiverId: string }) => {
			if (receiverId) {
				setUserTyping(userId, receiverId);
				io.to(receiverId).emit('typing', { from: userId });
			}
		});

		socket.on('get_typing_status', ({ receiverId }: { receiverId: string }) => {
			if (!receiverId) return;
			const isTyping = isUserTypingTo(userId, receiverId);
			socket.emit('typing_status_response', { senderId: userId, receiverId, isTyping });
		});

		socket.on('mark_as_read', async ({ otherUserId }: { otherUserId: string }) => {
			try {
				if (!otherUserId) return;
				await markConversationAsRead(userId, otherUserId);
				io.to(otherUserId).emit('conversation_read', { by: userId });
			} catch (error) {
				console.error('Error in mark_as_read:', error);
			}
		});

		socket.on('mark_as_unread', async ({ otherUserId }: { otherUserId: string }) => {
			try {
				if (!otherUserId) return;
				await markConversationAsUnread(userId, otherUserId);
				io.to(otherUserId).emit('conversation_unread', { by: userId });
			} catch (error) {
				console.error('Error in mark_as_unread:', error);
			}
		});

		socket.on('get_conversation', async ({ otherUserId }: { otherUserId: string }) => {
			try {
				if (!otherUserId) return;
				const messages = await getConversationBetweenUsers(userId, otherUserId);
				socket.emit('conversation_history', messages);
			} catch (error) {
				console.error('Error in get_conversation:', error);
			}
		});

		socket.on('get_all_conversations', async () => {
			try {
				const conversations = await getAllConversationsForUser(userId);
				socket.emit('all_conversations', conversations);
			} catch (error) {
				console.error('Error in get_all_conversations:', error);
			}
		});

		socket.on('get_unseen_count', async () => {
			try {
				const count = await getUnreadMessageCount(userId);
				socket.emit('unseen_count', count);
			} catch (error) {
				console.error('Error in get_unseen_count:', error);
			}
		});

		socket.on('get_read_status', async ({ userId2 }: { userId2: string }) => {
			try {
				if (!userId2) return;
				const status = await getLastMessageReadStatus(userId, userId2);
				socket.emit('read_status', status);
			} catch (error) {
				console.error('Error in get_read_status:', error);
			}
		});

		socket.on('get_message_requests', async () => {
			try {
				const requests = await getAllRequests(userId);
				socket.emit('message_requests', requests);
			} catch (error) {
				socket.emit('error', {
					type: 'message_requests',
					message: 'Failed to fetch requests',
				});
			}
		});
	});
};
