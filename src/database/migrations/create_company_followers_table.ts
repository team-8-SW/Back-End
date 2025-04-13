import { Knex } from 'knex';

export async function up(knex: Knex) {
	return knex.schema.createTable('company_followers', (table) => {
		table.uuid('id').primary();
		table
			.uuid('company_id')
			.notNullable()
			.references('id')
			.inTable('companypages')
			.onDelete('CASCADE');
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.timestamp('followed_at').defaultTo(knex.fn.now());
		table.unique(['company_id', 'user_id']);
	});
}

export async function down(knex: Knex) {
	return knex.schema.dropTableIfExists('company_followers');
}
