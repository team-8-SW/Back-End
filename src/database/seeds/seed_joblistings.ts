/* eslint-disable prettier/prettier */
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding joblistings..');
	await knex('joblistings').del(); //delete existing rows

	const joblistings = []; //geneerate joblistings
	const companies = await knex('companypages').select('id','name','location'); //fetch things from companypages
    for (let i = 0; i < 20; i++) { //20 job listings
        const company = companies[i % companies.length]; // Cycle through companies
		joblistings.push({
			id: uuidv4(), //unique id for job listing
			user_id: uuidv4(),
            company_id: company.id,
            company_name: company.name,
            title: faker.person.jobTitle(),,
            description: faker.lorem.paragraphs(3), // Generate a random job description
            location: faker.location.city(), // Generate a random city for the job location
            employment_type: faker.helpers.arrayElement(['full-time', 'part-time', 'contract', 'internship']),
            workplace_type: faker.helpers.arrayElement(['On-site', 'Hybrid', 'Remote']),
            experience_level: faker.helpers.arrayElement(['Entry', 'Mid', 'Senior', 'Executive']), // Random experience level
			posted_at: faker.date.recent(), // Generate a recent timestamp for the posting date
            expires_at: faker.date.future(), // Generate a future timestamp for the expiration date
		});
	}

	await knex('joblistings').insert(joblistings);

	console.log('Posts seeding successfully');
}
