import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const token = jwt.sign({ userId: 'your-user-id' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
console.log('Verification Token:', token);
