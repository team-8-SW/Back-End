import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	const exists = await knex.schema.hasTable('messages');
	if (!exists) {
		return knex.schema.createTable('messages', (table) => {
			table.uuid('id').primary().notNullable();
			table.uuid('sender_id').notNullable();
			table.uuid('receiver_id').notNullable();
			table.text('content').collate('pg_catalog.default').notNullable();
			table.string('media_url', 255).collate('pg_catalog.default');
			table.string('media_type', 20).collate('pg_catalog.default');
			table.boolean('is_read').notNullable().defaultTo(false);
			table.timestamp('sent_at').notNullable().defaultTo(knex.fn.now());
			table.boolean('is_deleted_by_sender').notNullable().defaultTo(false);
			table.boolean('is_deleted_by_receiver').notNullable().defaultTo(false);
			table
				.string('status', 20)
				.collate('pg_catalog.default')
				.notNullable()
				.defaultTo('sent');
			table.boolean('is_typing').defaultTo(false);
		});
	}
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('messages');
}
