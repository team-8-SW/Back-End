import pool from '../config/db';

const testConnection = async () => {
	try {
		const ans = await pool.query('SELECT NOW()');
		console.log('Database is connected at', ans.rows[0].now);
	} catch (error) {
		console.log('Database connection error: ', error);
	}
};

testConnection();
