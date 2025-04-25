import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { setupMessagingSocket } from './messaging.socket';

export const registerSocketHandlers = (io: Server) => {
	io.use((socket, next) => {
		const token = socket.handshake.auth?.token;
		if (!token) return next(new Error('Unauthorized'));

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
			socket.data.user = decoded;
			next();
		} catch (err) {
			next(new Error('Invalid token'));
		}
	});

	setupMessagingSocket(io);
};
