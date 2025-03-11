import { Pool } from 'pg';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
	user: process.env.DATABASE_USER,
	host: process.env.DATABASE_HOST,
	database: process.env.DATBASE_NAME,
	password: process.env.DATABASE_PASSWORD,
	port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

export default pool;
