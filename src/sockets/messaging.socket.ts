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
import { canSendMessageToday } from '../models/payment.model';
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

		 // Send text message
		 socket.on('send_text', async ({ receiverId, content }: MessagePayload) => {
            try {
                if (!receiverId || !content) return;
                if (await isUserBlocked(userId, receiverId)) return;

                const canSend = await canSendMessageToday(userId);
                if (!canSend) {
                    socket.emit('error', {
                        type: 'send_text',
                        message: 'Daily message limit reached. Upgrade to Premium to send unlimited messages.',
                    });
                    return;
				}
				const message = await createTextMessage(userId, receiverId, content);
                io.to(receiverId).emit('receive_message', message);
                io.to(userId).emit('receive_message', message);
            } catch (error) {
                console.error('Error in send_text:', error);
                socket.emit('error', { type: 'send_text', message: 'Failed to send text message.' });
            }
        });

		socket.on('send_media', async ({ receiverId, file }: MessagePayload) => {
            try {
                if (!receiverId || !file) return;
                if (await isUserBlocked(userId, receiverId)) return;

                const message = await createMediaMessage(userId, receiverId, file);
                io.to(receiverId).emit('receive_message', message);
                io.to(userId).emit('receive_message', message);
            } catch (error) {
                console.error('Error in send_media:', error);
                socket.emit('error', { type: 'send_media', message: 'Failed to send media message.' });
            }
		});
		socket.on('accept_request', async ({ senderId }: { senderId: string }) => {
            try {
                if (!senderId) return;

                const requests = await acceptthisRequest(userId, senderId);
                io.to(senderId).emit('request_accepted', { by: userId });
                socket.emit('accept_success', { requests });
            } catch (error) {
                console.error('Error in accept_request:', error);
                socket.emit('error', { type: 'accept_request', message: 'Failed to accept request.' });
            }
		});
		
		 // Decline message request
		 socket.on('decline_request', async ({ senderId }: { senderId: string }) => {
            try {
                if (!senderId) return;

                const requests = await declinehisRequest(userId, senderId);
                io.to(senderId).emit('request_declined', { by: userId });
                socket.emit('decline_success', { requests });
            } catch (error) {
                console.error('Error in decline_request:', error);
                socket.emit('error', { type: 'decline_request', message: 'Failed to decline request.' });
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
				socket.emit('error', { type: 'mark_as_read', message: 'Failed to mark conversation as read.' });
			}
		});

		socket.on('mark_as_unread', async ({ otherUserId }: { otherUserId: string }) => {
			try {
				if (!otherUserId) return;
				await markConversationAsUnread(userId, otherUserId);
				io.to(otherUserId).emit('conversation_unread', { by: userId });
			} catch (error) {
				console.error('Error in mark_as_unread:', error);
				socket.emit('error', { type: 'mark_as_unread', message: 'Failed to mark conversation as unread.' });
			}
		});

		socket.on('get_conversation', async ({ otherUserId }: { otherUserId: string }) => {
            try {
                if (!otherUserId) return;

                const messages = await getConversationBetweenUsers(userId, otherUserId);
                socket.emit('conversation_history', messages);
            } catch (error) {
                console.error('Error in get_conversation:', error);
                socket.emit('error', { type: 'get_conversation', message: 'Failed to fetch conversation history.' });
            }
        });

		socket.on('get_all_conversations', async () => {
            try {
                const conversations = await getAllConversationsForUser(userId);
                socket.emit('all_conversations', conversations);
            } catch (error) {
                console.error('Error in get_all_conversations:', error);
                socket.emit('error', { type: 'get_all_conversations', message: 'Failed to fetch all conversations.' });
            }
        });

		socket.on('get_unseen_count', async () => {
            try {
                const count = await getUnreadMessageCount(userId);
                socket.emit('unseen_count', count);
            } catch (error) {
                console.error('Error in get_unseen_count:', error);
                socket.emit('error', { type: 'get_unseen_count', message: 'Failed to fetch unseen message count.' });
            }
        });

		socket.on('get_read_status', async ({ userId2 }: { userId2: string }) => {
            try {
                if (!userId2) return;

                const status = await getLastMessageReadStatus(userId, userId2);
                socket.emit('read_status', status);
            } catch (error) {
                console.error('Error in get_read_status:', error);
                socket.emit('error', { type: 'get_read_status', message: 'Failed to fetch read status.' });
            }
        });

		 // Get message requests
		 socket.on('get_message_requests', async () => {
            try {
                const requests = await getAllRequests(userId);
                socket.emit('message_requests', requests);
            } catch (error) {
                console.error('Error in get_message_requests:', error);
                socket.emit('error', { type: 'get_message_requests', message: 'Failed to fetch message requests.' });
            }
        });
	});
};
