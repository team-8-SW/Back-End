import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('reported_posts', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE');
		table.text('reason').defaultTo('No reason provided');
		table.timestamp('created_at').defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('reported_posts');
}
await knex.schema.alterTable('reported_posts', (table) => {
	table.boolean('resolved').defaultTo(false);
});
