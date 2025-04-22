import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
	user?: { id: string; email: string };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(' ')[1]; // Extract token from header

	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
			id: string;
			email: string;
		};
		req.user = decoded; // Attach decoded user data to request
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

export const authMiddleware2 = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
		if (typeof decoded === 'object' && 'id' in decoded) {
			(req as any).user = { id: decoded.id };
		} else {
			throw new Error("Token does not contain 'id' field");
		}

		next();
	} catch (error) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
};
export const newAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	try {
		console.log('Token:', token);
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
			id: string; // If the token contains `id` instead of `user_id`
		};
		if (!decoded.id) {
			throw new Error('Token does not contain id');
		}
		(req as any).user = { user_id: decoded.id }; // Map `id` to `user_id`
		console.log('Decoded token:', decoded);
		console.log('Attached user:', (req as any).user);
		next();
	} catch (error) {
		console.error('Error decoding token:', error);
		return res.status(401).json({ message: 'Invalid token' });
	}
};
