import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('reported_comments', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table
			.uuid('comment_id')
			.notNullable()
			.references('id')
			.inTable('comments')
			.onDelete('CASCADE');
		table.text('reason').defaultTo('No reason provided');
		table.timestamp('created_at').defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('reported_comments');
}
