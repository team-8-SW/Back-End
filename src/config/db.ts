import knex from 'knex';
import dotenv from 'dotenv';
import Knex from 'knex';
import knexConfig from '../../knexfile';

dotenv.config();

// const pool = new Pool({
// 	user: process.env.DATABASE_USER,
// 	host: process.env.DATABASE_HOST,
// 	database: process.env.DATABASE_NAME,
// 	password: process.env.DATABASE_PASSWORD,
// 	port: parseInt(process.env.DATABASE_PORT || '5432', 10),
// });

// const environment = process.env.NODE_ENV || 'development';
// const configOptions = knexConfig[environment];

// const knexInstance = Knex(configOptions);

// export { pool, knexInstance };
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
