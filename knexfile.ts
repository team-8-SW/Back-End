import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const sharedConfig = {
	migrations: {
		directory: './src/database/migrations',
		extension: 'ts',
	},
	seeds: {
		directory: './src/database/seeds',
		extension: 'ts',
	},
};

const config: { [key: string]: Knex.Config } = {
	development: {
		client: 'pg',
		connection: process.env.DATABASE_URL, // <--- Railway-style
		...sharedConfig,
	},
	production: {
		client: 'pg',
		connection: process.env.DATABASE_URL, // <--- Same for prod
		...sharedConfig,
	},
};

export default config;
