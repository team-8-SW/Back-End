import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
	// First get all seeded users
	const users = await knex('users').select('id');
	if (users.length === 0) {
		throw new Error('No users found - run users seed first');
	}

	// Seed universities
	await knex('universities').del();
	const universities = [
		{ id: uuidv4(), university_name: 'Cairo University' },
		{ id: uuidv4(), university_name: 'Stanford University' },
		{ id: uuidv4(), university_name: 'Massachusetts Institute of Technology' },
		{ id: uuidv4(), university_name: 'Harvard University' },
		{ id: uuidv4(), university_name: 'University of Oxford' },
		{ id: uuidv4(), university_name: 'ETH Zurich' },
		{ id: uuidv4(), university_name: 'University of Tokyo' },
		{ id: uuidv4(), university_name: 'National University of Singapore' },
		{ id: uuidv4(), university_name: 'University of Cambridge' },
		{ id: uuidv4(), university_name: 'Imperial College London' },
	];
	await knex('universities').insert(universities);
	console.log('Inserted universities');

	// Seed skills
	await knex('skills').del();
	const skills = [
		{ id: uuidv4(), skill_name: 'Java' },
		{ id: uuidv4(), skill_name: 'Python' },
		{ id: uuidv4(), skill_name: 'JavaScript' },
		{ id: uuidv4(), skill_name: 'TypeScript' },
		{ id: uuidv4(), skill_name: 'C++' },
		{ id: uuidv4(), skill_name: 'Go' },
		{ id: uuidv4(), skill_name: 'Rust' },
		{ id: uuidv4(), skill_name: 'Swift' },
		{ id: uuidv4(), skill_name: 'UI/UX Design' },
		{ id: uuidv4(), skill_name: 'Machine Learning' },
	];
	await knex('skills').insert(skills);
	console.log('Inserted skills');

	// Seed user_profiles
	await knex('user_profiles').del();
	const userProfiles = users.map((user) => ({
		id: uuidv4(),
		user_id: user.id,
		headline: `${faker.name.jobTitle()} | ${faker.company.name()}`,
		bio: `I am a ${faker.name.jobTitle()} with over ${faker.datatype.number({
			min: 2,
			max: 15,
		})} years of experience in ${faker.helpers.arrayElement([
			'software development',
			'data analysis',
			'project management',
			'digital marketing',
			'financial services',
			'healthcare technology',
		])}. I specialize in ${faker.helpers.arrayElement([
			'building scalable web applications',
			'analyzing complex datasets',
			'leading cross-functional teams',
			'developing innovative marketing strategies',
			'streamlining business processes',
			'designing user-friendly interfaces',
		])}. My passion lies in ${faker.helpers.arrayElement([
			'solving challenging problems',
			'mentoring junior team members',
			'staying ahead of industry trends',
			'delivering high-quality results',
			'collaborating with diverse teams',
		])}.`,
		location: `${faker.address.city()}, ${faker.address.country()}`,
		industry: faker.helpers.arrayElement([
			'Computer Software',
			'Higher Education',
			'Information Technology',
			'Financial Services',
			'Marketing & Advertising',
			'Healthcare',
		]),
		profile_picture_url: null,
		cover_photo_url: null,
		resume_url: null,
		last_updated: faker.date.recent(30),
	}));
	await knex('user_profiles').insert(userProfiles);
	console.log('Inserted user profiles');

	// Seed work_experience
	await knex('work_experience').del();
	const workExperiences = users.flatMap((user) => {
		const count = faker.datatype.number({ min: 1, max: 5 });
		// eslint-disable-next-line @typescript-eslint/naming-convention
		return Array.from({ length: count }, (_, i) => {
			const isCurrent = i === 0;
			const startDate = faker.date.past(10);
			const endDate = isCurrent ? null : faker.date.between(startDate, new Date());

			return {
				id: uuidv4(),
				user_id: user.id,
				company_name: faker.company.name(),
				position: faker.name.jobTitle(),
				start_date: startDate,
				end_date: endDate,
				current_job: isCurrent,
				description: faker.lorem.sentences(3),
				location: `${faker.address.city()}, ${faker.address.country()}`,
			};
		});
	});
	await knex('work_experience').insert(workExperiences);
	console.log('Inserted work experiences');

	// Seed user_education
	await knex('user_education').del();
	const userEducations = users.flatMap((user) => {
		const count = faker.datatype.number({ min: 1, max: 3 });
		return Array.from({ length: count }, () => {
			const university = faker.helpers.arrayElement(universities);
			const startDate = faker.date.past(15);
			const endDate = faker.date.between(startDate, new Date());

			return {
				id: uuidv4(),
				user_id: user.id,
				university_id: university.id,
				degree: faker.helpers.arrayElement(['Bachelor', 'Master', 'PhD']),
				field_of_study: faker.helpers.arrayElement([
					'Computer Science',
					'Mathematics',
					'Physics',
					'Business Administration',
				]),
				start_date: startDate,
				end_date: endDate,
				current_education: faker.datatype.boolean(),
				description: faker.lorem.sentences(2),
				grade: faker.helpers.arrayElement(['A', 'B+', '3.8/4.0', 'First Class Honors']),
			};
		});
	});
	await knex('user_education').insert(userEducations);
	console.log('Inserted user education');

	// Seed certifications
	await knex('certifications').del();
	const certifications = users.flatMap((user) => {
		const count = faker.datatype.number({ min: 0, max: 4 });
		return Array.from({ length: count }, () => {
			const issueDate = faker.date.past(5);
			return {
				id: uuidv4(),
				user_id: user.id,
				name: faker.helpers.arrayElement([
					'AWS Certified Solutions Architect',
					'Google Cloud Professional Data Engineer',
					'Microsoft Certified: Azure Solutions Architect Expert',
				]),
				issuing_organization: faker.company.name(),
				issue_date: issueDate,
				expiration_date: faker.date.future(3, issueDate),
				credential_url: `https://${faker.internet.domainName()}/certificates/${uuidv4()}`,
			};
		});
	});
	await knex('certifications').insert(certifications);
	console.log('Inserted certifications');

	// Seed user_skills (updated for new schema)
	await knex('user_skills').del();
	const userSkills = users.flatMap((user) => {
		const skillCount = faker.datatype.number({ min: 5, max: 10 });
		const usedSkillIds = new Set();

		return Array.from({ length: skillCount }, () => {
			let skill;
			do {
				skill = faker.helpers.arrayElement(skills);
			} while (usedSkillIds.has(skill.id));

			usedSkillIds.add(skill.id);

			return {
				id: uuidv4(), // Added UUID primary key
				user_id: user.id,
				skill_id: skill.id,
			};
		});
	});
	await knex('user_skills').insert(userSkills);
	console.log('Inserted user skills');

	// Seed skill_contexts (new table)
	await knex('skill_contexts').del();
	const skillContexts = [];

	// Get all work experiences and educations grouped by user
	const experiencesByUser = workExperiences.reduce<Record<string, (typeof workExperiences)[0][]>>(
		(acc, exp) => {
			if (!acc[exp.user_id]) acc[exp.user_id] = [];
			acc[exp.user_id].push(exp);
			return acc;
		},
		{},
	);

	const educationsByUser = userEducations.reduce<Record<string, (typeof userEducations)[0][]>>(
		(acc, edu) => {
			if (!acc[edu.user_id]) acc[edu.user_id] = [];
			acc[edu.user_id].push(edu);
			return acc;
		},
		{},
	);

	// For each user_skill, decide if it should have contexts
	for (const userSkill of userSkills) {
		const userExperiences = experiencesByUser[userSkill.user_id as string] || [];
		const userEducations = educationsByUser[userSkill.user_id as string] || [];

		// Track used combinations to avoid repetition
		const usedCombinations = new Set<string>();

		// 80% chance to add at least one context
		if (faker.datatype.float({ min: 0, max: 1 }) < 0.8) {
			// Prefer both education and experience if available
			if (userEducations.length > 0 && userExperiences.length > 0) {
				const education = faker.helpers.arrayElement(userEducations);
				const experience = faker.helpers.arrayElement(userExperiences);

				const combinationKey = `${userSkill.id}-${education.id}-${experience.id}`;
				if (!usedCombinations.has(combinationKey)) {
					skillContexts.push({
						id: uuidv4(),
						user_skill_id: userSkill.id,
						education_id: education.id,
						experience_id: experience.id,
						created_at: faker.date.recent(30),
					});
					usedCombinations.add(combinationKey);
				}
			} else if (userEducations.length > 0) {
				// Add only education context if no experiences are available
				const education = faker.helpers.arrayElement(userEducations);
				const combinationKey = `${userSkill.id}-${education.id}-null`;
				if (!usedCombinations.has(combinationKey)) {
					skillContexts.push({
						id: uuidv4(),
						user_skill_id: userSkill.id,
						education_id: education.id,
						experience_id: null,
						created_at: faker.date.recent(30),
					});
					usedCombinations.add(combinationKey);
				}
			} else if (userExperiences.length > 0) {
				// Add only experience context if no educations are available
				const experience = faker.helpers.arrayElement(userExperiences);
				const combinationKey = `${userSkill.id}-null-${experience.id}`;
				if (!usedCombinations.has(combinationKey)) {
					skillContexts.push({
						id: uuidv4(),
						user_skill_id: userSkill.id,
						education_id: null,
						experience_id: experience.id,
						created_at: faker.date.recent(30),
					});
					usedCombinations.add(combinationKey);
				}
			}
		} else {
			// Very few entries will have both education_id and experience_id as null
			if (faker.datatype.float({ min: 0, max: 1 }) < 0.1) {
				const combinationKey = `${userSkill.id}-null-null`;
				if (!usedCombinations.has(combinationKey)) {
					skillContexts.push({
						id: uuidv4(),
						user_skill_id: userSkill.id,
						education_id: null,
						experience_id: null,
						created_at: faker.date.recent(30),
					});
					usedCombinations.add(combinationKey);
				}
			}
		}
	}

	await knex('skill_contexts').insert(skillContexts);
	console.log(`Inserted ${skillContexts.length} skill contexts`);

	// Seed user_privacy_settings
	await knex('user_privacy_settings').del();
	const userPrivacySettings = users.map((user) => ({
		id: uuidv4(),
		user_id: user.id,
		profile_visibility: 'public',
		show_email: false,
		allow_connection_requests: true,
		allow_messages_from_non_connections: false,
		show_active_status: true,
	}));
	await knex('user_privacy_settings').insert(userPrivacySettings);
	console.log('Inserted user privacy settings');
}
