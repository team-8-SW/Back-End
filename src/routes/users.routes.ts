import express, { Express, Request, Response } from 'express';

// function routes(app: Express) {}

const router = express.Router();
import { User } from '../interfaces/user';
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the user was created
 *       example:
 *         id: "123456"
 *         name: "John Doe"
 *         email: "john@example.com"
 *         createdAt: "2023-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns a list of users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', (req: Request, res: Response) => {
	const users: User[] = [
		{ id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
		{ id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() },
	];
	res.json(users);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id', (req: Request, res: Response) => {
	// Mock implementation
	if (req.params.id === '1') {
		const user: User = {
			id: '1',
			name: 'John Doe',
			email: 'john@example.com',
			createdAt: new Date(),
		};
		res.json(user);
	} else {
		res.status(404).json({ message: 'User not found' });
	}
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request data
 */
router.post('/', (req: Request, res: Response) => {
	// Mock implementation
	const { name, email } = req.body;
	if (!name || !email) {
		return res.status(400).json({ message: 'Name and email are required' });
	}
	const newUser: User = {
		id: Math.floor(Math.random() * 1000).toString(),
		name,
		email,
		createdAt: new Date(),
	};

	res.status(201).json(newUser);
});

export default router;
