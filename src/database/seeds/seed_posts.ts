/* eslint-disable prettier/prettier */
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding posts..');
	try {
		await knex('posts').del();
		console.log('Existing posts deleted');
		const companies = await knex('company_pages').select('id');
		if (companies.length === 0) {
			console.error('No companies found. Please seed companies first.');
			return;
		}
		const users = await knex('users').select('id');
		if (users.length === 0) {
			console.error('No users found. Please seed users first.');
			return;
		}
	const posts = [];
		for (let i = 0; i < 10; i++) {
			const user = faker.helpers.arrayElement(users); // Randomly pick a user
			const company = faker.helpers.arrayElement(companies); // Randomly pick a user
			posts.push({
				id: uuidv4(),
				user_id: user.id,
				company_id: company.id,
				content: faker.lorem.paragraphs(3),
				media_url: faker.internet.url(),
				link_url: null,
				media_type: faker.system.mimeType().substring(0, 50),
				like_count: faker.datatype.number({ min: 0, max: 1000 }),
				comment_count: faker.datatype.number({ min: 0, max: 1000 }),
				repost_count: faker.datatype.number({ min: 0, max: 1000 }),
				created_at: faker.date.recent(),
				edited_at: faker.date.recent(),
				visibility: faker.helpers.arrayElement(['public', 'connections', 'private']),
		});
	}

		await knex('posts').insert(posts);
		console.log('Inserted posts into the posts table');

		console.log('Posts seeded successfully!');
	} catch (error) {
		console.error('Error seeding posts:', error);
	}
}
