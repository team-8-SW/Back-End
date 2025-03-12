/* eslint-disable prettier/prettier */
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	console.log('Seeding joblistings..');
	await knex('joblistings').del(); //delete existing rows

    const joblistings = []; //geneerate joblistings
    const employmentTypes = ['full-time', 'part-time', 'contract', 'internship'];
    const workplaceTypes = ['On-site', 'Hybrid', 'Remote'];
    const experienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];
	const companies = await knex('companypages').select('id','name','location'); //fetch things from companypages
    for (let i = 0; i < 20; i++) { //20 job listings
        const company = companies[i % companies.length]; // Cycle through companies
		joblistings.push({
			id: uuidv4(), //unique id for job listing
			user_id: uuidv4(),
            company_id: company.id,
            company_name: company.name,
            title: faker.person.jobTitle(), // Generate a random job title
            description: faker.lorem.paragraphs(3), // Generate a random job description
            location: faker.location.city(), // Generate a random city for the job location
            employment_type: employmentTypes[Math.floor(Math.random() * employmentTypes.length)], // Random employment type
            workplace_type: workplaceTypes[Math.floor(Math.random() * workplaceTypes.length)], // Random workplace type
            experience_level: experienceLevels[Math.floor(Math.random() * experienceLevels.length)], // Random experience level
			posted_at: faker.date.recent(), // Generate a recent timestamp for the posting date
            expires_at: faker.date.future(), // Generate a future timestamp for the expiration date
		});
	}

	await knex('joblistings').insert(joblistings);

	console.log('Posts seeding successfully');
}
