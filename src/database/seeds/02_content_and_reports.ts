import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding content and report data...');

	// Fetch existing users
	const users = await knex('users').select('id');
	if (users.length < 2) {
		throw new Error('Need at least 2 users to seed content');
	}

	// Insert Posts
	const posts = Array.from({ length: 3 }, () => {
		const author = faker.helpers.arrayElement(users);
		return {
			id: uuidv4(),
			user_id: author.id,
			content: faker.lorem.paragraph(),
			visibility: 'public',
		};
	});

	await knex('posts').insert(posts);
	console.log(`Seeded ${posts.length} posts`);

	// Insert Comments (on seeded posts)
	const comments = posts.map((post) => ({
		id: uuidv4(),
		post_id: post.id,
		user_id: faker.helpers.arrayElement(users).id,
		content: faker.lorem.sentence(),
	}));

	await knex('comments').insert(comments);
	console.log(`Seeded ${comments.length} comments`);

	// Insert Reported Posts (with resolved)
	const reportedPosts = posts.map((post) => ({
		id: uuidv4(),
		user_id: faker.helpers.arrayElement(users).id,
		post_id: post.id,
		resolved: false,
	}));

	try {
		await knex('reported_posts').insert(reportedPosts);
		console.log(`Seeded ${reportedPosts.length} reported posts`);
	} catch (err) {
		console.error('Failed to insert reported posts:', err);
	}

	// Insert Reported Comments (with resolved)
	const reportedComments = comments.map((comment) => ({
		id: uuidv4(),
		user_id: faker.helpers.arrayElement(users).id,
		comment_id: comment.id,
		resolved: false,
	}));

	try {
		await knex('reported_comments').insert(reportedComments);
		console.log(`Seeded ${reportedComments.length} reported comments`);
	} catch (err) {
		console.error('Failed to insert reported comments:', err);
	}

	console.log('Done seeding content and reports!');
}
