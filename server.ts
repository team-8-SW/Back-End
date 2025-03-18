import app from './app.ts';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
async function testDB() {
	try {
		const { rows } = await pool.query('SELECT NOW()');
		console.log('✅ Database connected successfully at:', rows[0].now);
	} catch (error) {
		console.error('❌ Database connection failed:', error);
	}
}
testDB();
console.log(process.env);
app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
