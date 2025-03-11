import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	const exists = await knex.schema.hasTable('companypages');
	if (!exists) {
		return knex.schema.createTable('companypages', (table) => {
			table.uuid('id').primary();
			table.string('name', 255).notNullable().collate('pg_catalog.default');
			table.text('description').collate('pg_catalog.default');
			table.string('industry', 100).notNullable().collate('pg_catalog.default');
			table.string('logo_url', 255).nullable().collate('pg_catalog.default');
			table.string('organization_type', 20).notNullable().collate('pg_catalog.default');
			table.string('website', 255).nullable().collate('pg_catalog.default');
			table.string('size', 20).notNullable().collate('pg_catalog.default');
			table.string('location', 100).nullable().collate('pg_catalog.default');
			table.uuid('admin_user_id');
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
			table.text('about').collate('pg_catalog.default');
			table.string('cover_photo_url', 255).nullable().collate('pg_catalog.default');
			table.integer('follower_count').defaultTo(0).notNullable();
			// table.timestamps(true, true); //created_at & updated_at}
		});
	}
}
export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('comapanypages');
}
