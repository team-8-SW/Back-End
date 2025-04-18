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
