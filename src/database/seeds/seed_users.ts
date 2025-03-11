/* eslint-disable prettier/prettier */
// /* eslint-disable prettier/prettier */
// /* eslint-disable @typescript-eslint/naming-convention */
// import pool from '../../config/db';
// import { faker } from '@faker-js/faker';
// import { insertUsers } from '../queries';
// import { v4 as uuidv4 } from 'uuid';

// // console.log(process.env.DATABASE_NAME);

// const seedUsers = async () => {
// 	const client = await pool.connect();
// 	try {
// 		console.log(' Seeding users...');
// 		for (let i = 0; i < 10; i++) {
// 			const id = uuidv4();
// 			const user_name = faker.internet.username();
// 			const email = faker.internet.email();
// 			const password_hash = faker.internet.password();
// 			const first_name = faker.person.firstName();
// 			const last_name = faker.person.lastName();
// 			const email_verified = faker.datatype.boolean();
// 			const is_premium = faker.datatype.boolean();
// 			const premium_expiry = faker.date.future();
// 			const is_active = faker.datatype.boolean();
// 			const is_admin = faker.datatype.boolean();
// 			const reset_token_expiry = faker.date.future();
// 			const reset_token = faker.string.uuid();
// 			await client.query(insertUsers, [
// 				id,
// 				user_name,
// 				email,
// 				password_hash,
// 				first_name,
// 				last_name,
// 				email_verified,
// 				is_premium,
// 				premium_expiry,
// 				is_active,
// 				reset_token,
// 				reset_token_expiry,
// 				is_admin,
// 			]);
// 		}
// 		console.log('Users seeded successfully!');
// 	} catch (error) {
// 		console.error('Error seeding users:', error);
// 	} finally {
// 		client.release();
// 	}
// };

// seedUsers();
import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

export async function seed(knex: Knex): Promise<void> {
	console.log("Seeding users...");

	// ✅ Delete existing users before inserting new ones
	await knex("users").del();

	// ✅ Insert dummy user data
	const users = [];
	for (let i = 0; i < 10; i++) {
		users.push({
			id: uuidv4(),
			user_name: faker.internet.userName(),
			email: faker.internet.email(),
			password_hash: faker.internet.password(),
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			email_verified: faker.datatype.boolean(),
			is_premium: faker.datatype.boolean(),
			premium_expiry: faker.date.future(),
			is_active: faker.datatype.boolean(),
			reset_token: faker.string.uuid(),
			reset_token_expiry: faker.date.future(),
			isadmin: faker.datatype.boolean(),
			created_at: new Date(),
			updated_at: new Date(),
		});
	
	}

	// ✅ Insert into users table
	await knex("users").insert(users);
}