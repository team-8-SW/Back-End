import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	const hasColumn = await knex.schema.hasColumn('users', 'verification_token');
	if (!hasColumn) {
		await knex.schema.alterTable('users', (table) => {
			table.string('verification_token', 255).nullable();
		});
	}
}

export async function down(knex: Knex): Promise<void> {
	const hasColumn = await knex.schema.hasColumn('users', 'verification_token');
	if (hasColumn) {
		await knex.schema.alterTable('users', (table) => {
			table.dropColumn('verification_token');
		});
	}
}
