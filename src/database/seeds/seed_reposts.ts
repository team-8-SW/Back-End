import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
    console.log('seeding reposts');
    try {
        await knex('reposts').del();
        console.log('Existing reposts deleted');
        const users = await knex('users').select('id');
        if (users.length === 0) {
            console.error('No users found. Please seed users first.');
            return;
        }
        const postss = await knex('posts').select('id');
        if (postss.length === 0) {
            console.error('No posts found. Please seed posts first.');
            return;
        }
    const reposts = [];
        for (let i = 0; i < 10; i++) {
            const user1 = faker.helpers.arrayElement(users); // Randomly pick a user
            const post = faker.helpers.arrayElement(postss); // Randomly pick a post
            console.log('Selected user:', user1);
            console.log('Selected post:', post);

            reposts.push({
                id: uuidv4(),
                user_id: user1.id,
                reposted_post_id: post.id,
                reposted_at: faker.date.recent(30),
            });
    }

        await knex('reposts').insert(reposts);
        console.log('Inserted reposts into the reposts table');

        console.log('reposts seeded successfully!');
    } catch (error) {
        console.error('Error seeding reposts:', error);
    }
}
