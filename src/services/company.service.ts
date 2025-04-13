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

export const updateCompany = async (
	id: string,
	data: Partial<companyModels.company>,
): Promise<number> => {
	return await knexInstance('companypages').where({ id }).update(data);
};
