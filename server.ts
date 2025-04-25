import app from './app.ts';
import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import { initializeWebSocket } from './websocket.ts';
dotenv.config({ path: './config.env' });
const apps = express();
const server = http.createServer(apps);

// Initialize WebSocket
initializeWebSocket(server);

// Start the server
server.listen(5000, () => {
	console.log('Server is running on port 3000');
});
import app from './app';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandlers } from './src/sockets/index';

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
	cors: {
		origin: '*',
	},
});

registerSocketHandlers(io);

server.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
