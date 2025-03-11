/* eslint-disable prettier/prettier */
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	// ✅ Ensure the table is empty before inserting new data
	await knex('connections').del();

	// ✅ Insert dummy connection data
	const connections = [];
	for (let i = 0; i < 10; i++) {
		connections.push({
			id: uuidv4(),
			requester_id: uuidv4(),
			receiver_id: uuidv4(),
			status: 'pending', // or faker.helpers.arrayElement(["sent", "accepted", "rejected"])
			created_at: new Date(),
		});
	}

	// ✅ Insert data into the connections table
	await knex('connections').insert(connections);
}
