import { Pool } from 'pg';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from 'dotenv';
import Knex from 'knex';
import knexConfig from '../../knexfile';

dotenv.config();

const pool = new Pool({
	user: process.env.DATABASE_USER,
	host: process.env.DATABASE_HOST,
	database: process.env.DATABASE_NAME,
	password: process.env.DATABASE_PASSWORD,
	port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

const environment = process.env.NODE_ENV || 'development';
const configOptions = knexConfig[environment];

const knexInstance = Knex(configOptions);

export { pool, knexInstance };
