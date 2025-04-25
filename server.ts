import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import { initializeWebSocket } from './websocket.ts';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandlers } from './src/sockets/index';
dotenv.config({ path: './config.env' });
const app = express();

const server = http.createServer(app);

const port = process.env.PORT || 3000;

const io = new SocketIOServer(server, {
	cors: {
		origin: '*',
	},
});

// Initialize WebSocket
initializeWebSocket(server);

registerSocketHandlers(io);

server.listen(port, () => {
	console.log(`Server running on http://localhost:${port}` );
});