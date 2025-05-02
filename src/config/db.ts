import dotenv from 'dotenv';
import { Pool } from 'pg';
import knex from 'knex';
import knexConfig from '../../knexfile';

dotenv.config();

if (!process.env.DATABASE_URL) {
	console.error('❌ DATABASE_URL is not set in .env');
	process.exit(1);
}

// PostgreSQL connection using pg
export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false, // required for Railway
	},
});

// Knex setup
const environment = process.env.NODE_ENV || 'development';

// Inject DATABASE_URL into knex config dynamically
const configOptions = {
	...knexConfig[environment],
	connection: process.env.DATABASE_URL,
};

export const knexInstance = knex(configOptions);
