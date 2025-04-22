import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	await knex('company_followers').del();

	const followers: { id: string; company_id: string; user_id: string; followed_at: Date }[] = [];
	const users = await knex('users').select('id');
	const companies = await knex('company_pages').select('id');

	for (let i = 0; i < 10; i++) {
		const user = faker.helpers.arrayElement(users);
		const company = faker.helpers.arrayElement(companies);
		followers.push({
			id: uuidv4(),
			company_id: company.id,
			user_id: user.id,
			followed_at: faker.date.recent(30),
		});
	}

	await knex('company_followers').insert(followers);

	console.log('Company followers seeded successfully!');
}
