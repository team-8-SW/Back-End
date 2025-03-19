import dotenv from 'dotenv';
import { Pool } from 'pg';
import knex from 'knex';
import knexConfig from '../../knexfile';

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

// Create a PostgreSQL Pool instance
export const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

// Determine the environment and load the corresponding Knex configuration
const environment = process.env.NODE_ENV || 'development';
const configOptions = knexConfig[environment];

// Create a Knex instance
export const knexInstance = knex(configOptions);