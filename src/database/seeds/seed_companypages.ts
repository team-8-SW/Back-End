import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('seeding companypages');
	await knex('companypages').del();

	const companies = [];
	for (let i = 0; i < 10; i++) {
		companies.push({
			id: uuidv4(),
			name: faker.company.companyName(),
			description: faker.lorem.paragraphs(2),
			industry: faker.commerce.department(),
			logo_url: faker.internet.url(),
			organization_type: faker.helpers.arrayElement(['Startup', 'Enterprise', 'Non-Profit']),
			website: faker.internet.url(),
			size: faker.helpers.arrayElement([
				'1-10 employees',
				'11-50 employees',
				'51-200 employees',
			]),
			location: faker.address.city(),
			admin_user_id: uuidv4(),
			created_at: faker.date.recent(30),
			about: faker.lorem.sentences(3),
			cover_photo_url: faker.internet.url(),
			follower_count: faker.datatype.number({ min: 0, max: 10000 }),
		});
	}

	await knex('companypages').insert(companies);

	console.log('Company pages seeded successfully!');
}
