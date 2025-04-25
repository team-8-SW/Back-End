import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { setupSwagger } from './src/docs/swagger';
import cors from 'cors';
//

// Import routes
import userRoutes from './src/routes/users.routes';
import authRoutes from './src/routes/auth.route';
import companyRoutes from './src/routes/company.route';
import profileRoutes from './src/routes/profile.route';
import followingRoutes from './src/routes/following.route';
import jobRoutes from './src/routes/job.route';
import healthRoutes from './src/routes/health.route';
import postsRoutes from './src/routes/post.route';
import notificationsRouter from './src/routes/notifications.route';
import connectionRoutes from './src/routes/connection.route';
import paymentRoutes from './src/routes/payment.route';
import http from 'http';
import { initializeWebSocket } from './websocket';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandlers } from './src/sockets/index';
const apps = express();
const server1 = http.createServer(apps);

// Initialize WebSocket
initializeWebSocket(server1);

import testRoutes from './src/routes/test.route';

// Initialize environment variables
dotenv.config();

// Create Express app
const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
// Add CORS middleware - PUT THIS BEFORE YOUR ROUTES
app.use(
	cors({
		origin: 'http://localhost:8000', // Your React frontend URL - change if different
		credentials: true,
	}),
);

// Setup Swagger documentation
setupSwagger(app);

// Basic health check route
app.get('/', (req: Request, res: Response) => {
	res.send('API is running. Go to /api-docs for documentation.');
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api/company', companyRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/following', followingRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/health', healthRoutes);
app.use('/api/test', testRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/payments', paymentRoutes);
// 404 handler
app.use((req: Request, res: Response) => {
	res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).json({
		message: 'Internal Server Error',
		error: process.env.NODE_ENV === 'development' ? err.message : undefined,
	});
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
//di elfunctioin ely kanet bet print routes i commented it -noor
//function printRoutes(stack: any[], prefix = '') {
//	stack.forEach((layer) => {
//		if (layer.route) {
//			// This layer is a route
//			//console.log(`${prefix}${layer.route.path}`);
//		} else if (layer.name === 'router' && layer.handle.stack) {
//			// This layer is a router, recursively print its routes
//			//printRoutes(layer.handle.stack, prefix + (layer.regexp?.toString() || ''));
//		}
//	});
//}

//printRoutes(app._router.stack);

// // Start server
// const port1 = process.env.PORT || 8000;

// app.listen(port1, () => {
// 	console.log(`Server running on port ${port1}`);
// 	console.log(`Swagger docs available at http://localhost:${port1}/api-docs`);
// });
// ======================= SOCKET.IO SETUP =========================
const port = process.env.PORT || 3000;

// Create raw server
const server = http.createServer(app);

// Attach Socket.IO
const io = new SocketIOServer(server, {
	cors: {
		origin: '*', // frontend URL
	},
});

// Register all socket events
registerSocketHandlers(io);

// Start server
server.listen(port, () => {
	console.log(`Server running on port ${port}`);
	console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
export default app;
