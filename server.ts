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
