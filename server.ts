import app from './app.ts';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

console.log(process.env);

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
