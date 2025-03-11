/* eslint-disable prettier/prettier */
import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('posts');
    if (!exists) {
        return knex.schema.createTable('posts', (table) => {
            table.uuid('id').notNullable();
            table.uuid('user_id').notNullable();
            // Foreign keys
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.uuid('company_id').nullable().references('id').inTable('companypages').onDelete('CASCADE');
            // Content fields
            table.text('content').collate('pg_catalog.default');
            table.string('media_url', 255).collate('pg_catalog.default');
            table.string('media_type', 50).nullable();
            // Counters
            table.integer('like_count').notNullable().defaultTo(0);
            table.integer('comment_count').notNullable().defaultTo(0);
            table.integer('repost_count').notNullable().defaultTo(0);
            // Timestamps
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.timestamp('edited_at').defaultTo(knex.fn.now());
            // Settings
            table.string('visibility', 20).notNullable().collate('pg_catalog.default');
            // Primary key constraint
            table.primary(['id'], 'posts_pkey');
            // Indexes
            table.index('user_id', 'idx_posts_user_id');
            table.index('company_id', 'idx_posts_company_id');
        });
    }

}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('posts');
}