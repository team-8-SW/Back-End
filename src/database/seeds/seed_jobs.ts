import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding joblistings');
	await knex('joblistings').del();

	const users = await knex('users').select('id');

	const companies = await knex('companypages').select('id', 'name');

	const jobs = [];
	for (let i = 0; i < 10; i++) {
		const user = faker.helpers.arrayElement(users);
		const company = faker.helpers.arrayElement(companies);
		const industries = [
			'Technology',
			'Healthcare',
			'Finance',
			'Education',
			'Retail',
			'Manufacturing',
			'Construction',
			'Transportation',
			'Hospitality',
			'Energy',
		];

		jobs.push({
			id: uuidv4(),
			user_id: user.id,
			company_id: company.id,
			company_name: company.name,
			title: faker.name.jobTitle(),
			description: faker.lorem.paragraph(),
			location: faker.address.city(),
			employment_type: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract']),
			workplace_type: faker.helpers.arrayElement(['On-site', 'Remote', 'Hybrid']),
			experience_level: faker.helpers.arrayElement([
				'Entry-level',
				'Mid-level',
				'Senior-level',
			]),
			posted_at: new Date(),
			expires_at: faker.date.future(),
			industry: faker.helpers.arrayElement(industries),
			salary: faker.finance.amount(30000, 150000, 0, '$'),
		});
	}

	await knex('joblistings').insert(jobs);
	console.log('Joblistings seeded successfully!');
}
