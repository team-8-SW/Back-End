import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized: No token provided' });
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
		return res.status(401).json({ error: 'Unauthorized: Invalid token' });
	}
};
