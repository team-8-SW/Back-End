import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	// Check if the 'notifications' table already exists
	const exists = await knex.schema.hasTable('notifications');
	if (!exists) {
		// Create the 'notifications' table if it doesn't exist
		return knex.schema.createTable('notifications', (table) => {
			table.uuid('id').primary().notNullable();
			table
				.uuid('user_id')
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('type', 50).notNullable(); // Type of notification (e.g., 'like', 'comment', 'connection', 'message')
			table.text('content').notNullable();
			table.boolean('is_read').notNullable().defaultTo(false);
			table.integer('unseen_count').notNullable().defaultTo(0);
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
		});
	}
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('notifications');
}
