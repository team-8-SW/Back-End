/* eslint-disable prettier/prettier */
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding posts..');
	await knex('posts').del();

	const posts = [];
	const companies = await knex('companypages').select('id');
	for (let i = 0; i < 10; i++) {
		posts.push({
			id: uuidv4(),
			user_id: uuidv4(),
			company_id: companies[i % companies.length].id,
			content: faker.lorem.paragraphs(3),
			media_url: faker.internet.url(),
			media_type: faker.system.mimeType().substring(0, 50),
			like_count: faker.datatype.number({ min: 0, max: 1000 }),
			comment_count: faker.datatype.number({ min: 0, max: 1000 }),
			repost_count: faker.datatype.number({ min: 0, max: 1000 }),
			created_at: faker.date.recent(),
			edited_at: faker.date.recent(),
			visibility: faker.helpers.arrayElement(['public', 'private', 'friends-only']),
		});
	}

	await knex('posts').insert(posts);

	console.log('Posts seeding successfully');
}
