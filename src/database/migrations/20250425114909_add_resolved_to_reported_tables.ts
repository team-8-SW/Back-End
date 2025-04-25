import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('reported_posts', (table) => {
		table.boolean('resolved').defaultTo(false);
	});

	await knex.schema.alterTable('reported_comments', (table) => {
		table.boolean('resolved').defaultTo(false);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('reported_posts', (table) => {
		table.dropColumn('resolved');
	});

	await knex.schema.alterTable('reported_comments', (table) => {
		table.dropColumn('resolved');
	});
}
