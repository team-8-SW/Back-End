import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('universities', (table) => {
		table.uuid('id').primary();
		table.string('university_name', 255).notNullable().unique();
	});

	await knex.schema.createTable('skills', (table) => {
		table.uuid('id').primary();
		table.string('skill_name', 100).notNullable().unique();
	});

	// Create tables that reference the core tables
	await knex.schema.createTable('user_profiles', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.string('headline', 255);
		table.text('bio');
		table.string('location', 100);
		table.string('industry', 100);
		table.string('profile_picture_url', 255);
		table.string('cover_photo_url', 255);
		table.string('resume_url', 255);
		table.timestamp('last_updated').notNullable().defaultTo(knex.fn.now());
	});

	await knex.schema.createTable('work_experience', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.string('company_name', 255).notNullable();
		table.string('position', 255).notNullable();
		table.date('start_date').notNullable();
		table.date('end_date');
		table.boolean('current_job').notNullable().defaultTo(false);
		table.text('description');
		table.string('location', 100);
	});

	await knex.schema.createTable('user_education', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table
			.uuid('university_id')
			.notNullable()
			.references('id')
			.inTable('universities')
			.onDelete('CASCADE');
		table.string('degree', 255);
		table.string('field_of_study', 255);
		table.date('start_date').notNullable();
		table.date('end_date');
		table.boolean('current_education').notNullable().defaultTo(false);
		table.text('description');
		table.string('grade', 80);
	});

	// Updated user_skills table with UUID primary key
	await knex.schema.createTable('user_skills', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('skill_id').notNullable().references('id').inTable('skills').onDelete('CASCADE');
		table.unique(['user_id', 'skill_id']);
	});

	// New skill_contexts table
	await knex.schema.createTable('skill_contexts', (table) => {
		table.uuid('id').primary();
		table
			.uuid('user_skill_id')
			.notNullable()
			.references('id')
			.inTable('user_skills')
			.onDelete('CASCADE');
		table
			.uuid('education_id')
			.nullable()
			.references('id')
			.inTable('user_education')
			.onDelete('CASCADE');
		table
			.uuid('experience_id')
			.nullable()
			.references('id')
			.inTable('work_experience')
			.onDelete('CASCADE');
		table.timestamp('created_at').defaultTo(knex.fn.now());
		table.unique(['user_skill_id', 'education_id', 'experience_id']);
	});

	// Create remaining tables
	await knex.schema.createTable('projects', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.string('project_name', 255).notNullable();
		table.string('institution', 255);
		table.date('start_date');
		table.date('end_date');
		table.boolean('is_active').defaultTo(false);
		table.text('description');
	});

	await knex.schema.createTable('project_contributors', (table) => {
		table
			.uuid('project_id')
			.notNullable()
			.references('id')
			.inTable('projects')
			.onDelete('CASCADE');
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.primary(['project_id', 'user_id']);
	});

	await knex.schema.createTable('certifications', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.string('name', 255).notNullable();
		table.string('issuing_organization', 255).notNullable();
		table.date('issue_date').notNullable();
		table.date('expiration_date');
		table.string('credential_url', 255);
	});
}

export async function down(knex: Knex): Promise<void> {
	// Drop tables in reverse order of creation
	await knex.schema.dropTableIfExists('skill_contexts');
	await knex.schema.dropTableIfExists('user_skills');
	await knex.schema.dropTableIfExists('certifications');
	await knex.schema.dropTableIfExists('project_contributors');
	await knex.schema.dropTableIfExists('projects');
	await knex.schema.dropTableIfExists('user_education');
	await knex.schema.dropTableIfExists('work_experience');
	await knex.schema.dropTableIfExists('user_profiles');
	await knex.schema.dropTableIfExists('skills');
	await knex.schema.dropTableIfExists('universities');
	await knex.schema.dropTableIfExists('users');
}
