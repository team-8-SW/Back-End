import app from './app.js';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

console.log(process.env);

const server = app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});

const someVar_port = 'unused';
