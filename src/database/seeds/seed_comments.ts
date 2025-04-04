import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('seeding comments');
	try {
		await knex('comments').del();
		console.log('Existing comments deleted');
		const users = await knex('users').select('id');
		if (users.length === 0) {
			console.error('No users found. Please seed users first.');
			return;
        }
        const posts = await knex('posts').select('id');
		if (posts.length === 0) {
			console.error('No posts found. Please seed posts first.');
			return;
		}
	const comments = [];
		for (let i = 0; i < 10; i++) {
            const user = faker.helpers.arrayElement(users); // Randomly pick a user
            const post = faker.helpers.arrayElement(posts); // Randomly pick a user
			comments.push({
                id: uuidv4(),
                post_id: post.id,
                user_id: user.id,
                content: faker.lorem.sentence(),
                created_at: faker.date.recent(30),
                edited_at: faker.date.recent(30),
                parent_comment_id: null, // Assuming no parent comment for simplicity
			});
	}

		await knex('comments').insert(comments);
		console.log('Inserted comments into the comments table');
		console.log('comments seeded successfully!');
	} catch (error) {
		console.error('Error seeding comments:', error);
	}
}
