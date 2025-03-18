import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Ensure required environment variables are set
if (
	!process.env.DATABASE_USER ||
	!process.env.DATABASE_HOST ||
	!process.env.DATABASE_NAME ||
	!process.env.DATABASE_PASSWORD
) {
	console.error('❌ Missing required database environment variables');
	process.exit(1);
}

// Create Knex instance
export const knexInstance = knex({
	client: 'pg',
	connection: {
		host: process.env.DATABASE_HOST,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE_NAME,
		port: parseInt(process.env.DATABASE_PORT || '5432', 10),
	},
});
