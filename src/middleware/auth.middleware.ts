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
