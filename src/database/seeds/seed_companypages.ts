import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('seeding company_pages');
	try {
		await knex('company_pages').del();
		console.log('Existing company_pages deleted');
		const users = await knex('users').select('id');
		if (users.length === 0) {
			console.error('No users found. Please seed users first.');
			return;
		}
	const companies = [];
		for (let i = 0; i < 10; i++) {
			const user = faker.helpers.arrayElement(users); // Randomly pick a user
			companies.push({
				id: uuidv4(),
				name: faker.company.name(),
				description: faker.lorem.paragraphs(2),
				industry: faker.commerce.department(),
				logo_url: faker.internet.url(),
				organization_type: faker.helpers.arrayElement([
					'Public company',
					'Self-employed',
					'Government agency',
					'Nonprofit',
					'Sole proprietorship',
					'Privately held',
					'Partnership',
				]),
				website: faker.internet.url(),
				size: faker.helpers.arrayElement([
					'0-1 employees',
					'2-10 employees',
					'11-50 employees',
					'51-200 employees',
					'201-500 employees',
					'501-1000 employees',
					'1001-5000 employees',
					'5001-10000 employees',
					'10000+ employees',
				]),
				location: faker.address.city(),
				admin_user_id: user.id,
				created_at: faker.date.recent(30),
				about: faker.lorem.sentences(3),
				cover_photo_url: faker.internet.url(),
				follower_count: faker.datatype.number({ min: 0, max: 10000 }),
			});
	}

		await knex('company_pages').insert(companies);
		console.log('Inserted company_pages into the company_pages table');

		console.log('Company pages seeded successfully!');
	} catch (error) {
		console.error('Error seeding notifications:', error);
	}
}
