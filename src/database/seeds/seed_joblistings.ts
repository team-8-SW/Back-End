/* eslint-disable prettier/prettier */
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding joblistings..');
	await knex('job_listings').del(); //delete existing rows
	interface JobListing {
		id: string;
		user_id: string;
		company_id: string;
		company_name: string;
		title: string;
		description: string;
		location: string;
		employment_type: string;
		workplace_type: string;
		experience_level: string;
		posted_at: Date;
		expires_at: Date;
	}
	const joblistings: JobListing[] = [];
	const users = await knex('users').select('id');
	if (users.length === 0) {
		console.error('No users found. Please seed users first.');
		return;
	}
	const employmentTypes = ['full-time', 'part-time', 'contract'];
	const workplaceTypes = ['On-site', 'Hybrid', 'Remote'];
	const experienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];
	const companies = await knex('company_pages').select('id', 'name', 'location'); //fetch things from companypages
	for (let i = 0; i < 20; i++) {
		//20 job listings
		const company = companies[i % companies.length]; // Cycle through companies
		const user = faker.helpers.arrayElement(users); // Randomly pick a user
		/* eslint-disable prettier/prettier */
		joblistings.push({
			id: uuidv4(), // Unique id for job listing
			user_id: user.id, // Generate a random user_id (you might want to fetch actual user ids instead)
			company_id: company.id, // Use the company id from the fetched companies
			company_name: company.name, // Use the company name from the fetched companies
			title: faker.name.jobTitle(), // Corrected to use faker.name.jobTitle()
			description: faker.lorem.paragraphs(3), // Generate a random job description
			location: company.location.city || faker.address.city(), // Use company location or generate a random city
			employment_type: faker.helpers.arrayElement(employmentTypes), // Random employment type
			workplace_type: faker.helpers.arrayElement(workplaceTypes), // Random workplace type
			experience_level: faker.helpers.arrayElement(experienceLevels), // Random experience level
			posted_at: faker.date.recent(), // Generate a recent timestamp for the posting date
			expires_at: faker.date.future(), // Generate a future timestamp for the expiration date
		});
	}

	await knex('job_listings').insert(joblistings);

	console.log('Posts seeding successfully');
}
