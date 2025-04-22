import { Knex } from 'knex';

export async function up(knex: Knex) {
	return knex.schema.createTable('company_updates', (table) => {
		table.uuid('id').primary();
		table
			.uuid('company_id')
			.notNullable()
			.references('id')
			.inTable('companypages')
			.onDelete('CASCADE');
		table
			.uuid('admin_user_id')
			.notNullable()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE');
		table.string('title').notNullable();
		table.text('content').notNullable();
		table.timestamp('created_at').defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex) {
	return knex.schema.dropTableIfExists('company_updates');
}
