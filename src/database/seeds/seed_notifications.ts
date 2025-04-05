import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding notifications...');
	try {
		await knex('notifications').del(); // Delete all existing notifications
		console.log('Existing notifications deleted');

		const users = await knex('users').select('id');
		if (users.length === 0) {
			console.error('No users found. Please seed users first.');
			return;
		}

		const notifications = [];
		for (let i = 0; i < 20; i++) {
			// Generate 20 notifications
			const user = faker.helpers.arrayElement(users); // Randomly pick a user
			const type = faker.helpers.arrayElement(['like', 'comment', 'connection', 'message']); // Random notification type
			const content = generateNotificationContent(type); // Generate content based on type

			notifications.push({
				id: uuidv4(),
				user_id: user.id,
				type: type,
				content: content,
				is_read: faker.datatype.boolean(),
				created_at: faker.date.recent(),
			});
		}

		await knex('notifications').insert(notifications);
		console.log('Inserted notifications into the notifications table');

		console.log('Notifications seeded successfully!');
	} catch (error) {
		console.error('Error seeding notifications:', error);
	}
}

// Helper function to generate notification content based on type
function generateNotificationContent(type: string): string {
	switch (type) {
		case 'like':
			return `${faker.name.fullName()} liked your post.`;
		case 'comment':
			return `${faker.name.fullName()} commented on your post: "${faker.lorem.sentence()}"`;
		case 'connection':
			return `${faker.name.fullName()} sent you a connection request.`;
		case 'message':
			return `${faker.name.fullName()} sent you a message: "${faker.lorem.sentence()}"`;
		default:
			return 'New notification';
	}
}
