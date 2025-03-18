import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	const exists = await knex.schema.hasTable('users');
	if (!exists) {
		return knex.schema.createTable('users', (table) => {
			table.uuid('id').primary();
			table.string('user_name', 100).notNullable().unique();
			table.string('email', 255).notNullable().unique();
			table.string('password_hash', 255).notNullable();
			table.string('first_name', 100).notNullable();
			table.string('last_name', 100).notNullable();
			table.boolean('email_verified').notNullable().defaultTo(false);
			table.boolean('is_premium').notNullable().defaultTo(false);
			table.timestamp('premium_expiry').nullable();
			table.boolean('is_active').notNullable().defaultTo(true);
			table.string('reset_token', 255).nullable();
			table.timestamp('reset_token_expiry').nullable();
			table.boolean('isadmin').nullable().defaultTo(false);
			table.timestamps(true, true); //created_at & updated_at
		});
	}
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('users');
}
