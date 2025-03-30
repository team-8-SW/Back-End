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
