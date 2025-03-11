import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
	development: {
		client: 'pg',
		connection: {
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			port: Number(process.env.DATABASE_PORT),
		},
		migrations: {
			directory: './src/database/migrations',
			extension: 'ts',
		},
		seeds: {
			directory: './src/database/seeds',
			extension: 'ts',
		},
	},
};

export default config;
