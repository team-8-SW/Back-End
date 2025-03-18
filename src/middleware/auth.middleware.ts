import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Request interface to include the 'user' property
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.header('Authorization')?.replace('Bearer ', '');

	console.log('Token:', token); // Debug: Log the token

	if (!token) {
		return res.status(401).json({ message: 'Access denied. No token provided.' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);
		console.log('Decoded User:', decoded); // Debug: Log the decoded user

		req.user = decoded; // Attach the decoded user to the request object
		next();
	} catch (error) {
		console.error('Token Verification Error:', error); // Debug: Log the error
		res.status(400).json({ message: 'Invalid token.' });
	}
};
//Middleware functions can be used to perform tasks like authentication, logging, or request validation before the request reaches the controller.
