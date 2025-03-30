import { knexInstance } from '../config/db';
import * as jobModels from '../models/job.model';

export const getJobById = async (id: string) => {
	return await knexInstance('joblistings').where({ id }).select('*');
};

export const searchJob = async (keyword?: string, location?: string, industry?: string) => {
	let query = knexInstance('joblistings').select('*');

	if (keyword)
		query = query
			.where('title', 'ilike', `%${keyword}%`)
			.orWhere('description', 'ilike', `%${keyword}%`);

	if (location) query = query.where('location', 'ilike', `%${location}%`);

	if (industry) query = query.where('industry', 'ilike', `%${industry}%`);

	return query;
};

export const filterJob = async (
	experienceLevel?: string,
	company?: string,
	minSalary?: number,
	maxSalary?: number,
) => {
	return knexInstance('joblistings')
		.where((query) => {
			if (experienceLevel) query.where('experience_level', experienceLevel);
			if (company) query.where('company_name', company);
			if (minSalary) query.where('salary', '>=', minSalary);
			if (maxSalary) query.where('salary', '<=', maxSalary);
		})
		.select('*');
};
