import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { setupSwagger } from './src/docs/swagger';
//
// Import routes
import userRoutes from './src/routes/users.routes'; // Adjust the path as needed
import authRoutes from './src/routes/auth.route';
//import router from './src/routes/users.routes';
import companyRoutes from './src/routes/company.route';

import notificationsRouter from './src/routes/notifications.route';
// Initialize environment variables
dotenv.config();

// Create Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// Basic health check route
app.get('/', (req: Request, res: Response) => {
	res.send('API is running. Go to /api-docs for documentation');
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api/company', companyRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
	res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).json({
		message: 'Internal Server Error',
		error: process.env.NODE_ENV === 'development' ? err.message : undefined,
	});
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function printRoutes(stack: any[], prefix = '') {
	stack.forEach((layer) => {
		if (layer.route) {
			// This layer is a route
			console.log(`${prefix}${layer.route.path}`);
		} else if (layer.name === 'router' && layer.handle.stack) {
			// This layer is a router, recursively print its routes
			printRoutes(layer.handle.stack, prefix + (layer.regexp?.toString() || ''));
		}
	});
}

printRoutes(app._router.stack);

// Start server
const port = process.env.port || 3000;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
	console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});

export default app;
