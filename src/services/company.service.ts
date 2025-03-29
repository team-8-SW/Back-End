import { knexInstance } from '../config/db';
import * as companyModels from '../models/company.model';
import { v4 as uuidv4 } from 'uuid';

export const getAllCompanies = async () => {
	return await knexInstance('companypages').select('*');
};

export async function getCompanyById(id: string): Promise<companyModels.company | null> {
	return knexInstance('companypages').where({ id }).first() || null;
}

export const createCompany = async (
	data: Omit<companyModels.company, 'id' | 'created_at' | 'follower_count'>,
): Promise<companyModels.company> => {
	const newCompany: companyModels.company = {
		id: uuidv4(),
		created_at: new Date(),
		follower_count: 0,
		...data,
	};
	await knexInstance('companypages').insert(newCompany);
	return newCompany;
};

export const updateCompany = async (id: string, data: Partial<companyModels.company>) => {
	return await knexInstance('companypages').where({ id }).update(data).returning('*');
};

export const postJob = async (jobData: {
	id: string;
	user_id: string;
	company_id: string;
	company_name: string;
	title: string;
	description: string;
	location?: string;
	employment_type?: string;
	workplace_type?: string;
	experience_level?: string;
	expires_at?: Date;
}) => {
	return await knexInstance('joblistings').insert(jobData).returning('*');
};
