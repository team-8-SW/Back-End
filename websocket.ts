import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export const initializeWebSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: '*', // Allow all origins (adjust for production)
            methods: ['GET', 'POST'],
        },
    });

    console.log('WebSocket server initialized'); // Debugging log
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Listen for the user joining their notification room
        socket.on('join', (userId) => {
            console.log(`User ${userId} joined their notification room`);
            socket.join(userId); // Join a room for the user
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO is not initialized');
    }
    return io;
};