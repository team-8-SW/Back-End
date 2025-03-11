import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	const exists = await knex.schema.hasTable('connections');
	if (!exists) {
		return knex.schema.createTable('connections', (table) => {
			table.uuid('id').primary();
			table.uuid('requester_id').notNullable();
			table.uuid('receiver_id').notNullable();
			table.string('status', 20).collate('pg_catalog.default').notNullable();
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
		});
	}
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('connections');
}
