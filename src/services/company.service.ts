import { knexInstance } from '../config/db';
import * as companyModels from '../models/company.model';
import { v4 as uuidv4 } from 'uuid';
import * as jobModel from '../models/job.model';

export const getAllCompanies = async () => {
	return await knexInstance('company_pages').select('*');
};

export async function getCompanyById(id: string): Promise<companyModels.company | null> {
	return knexInstance('company_pages').where({ id }).first() || null;
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
	await knexInstance('company_pages').insert(newCompany);
	return newCompany;
};

export const updateCompany = async (
	id: string,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	admin_user_id: string,
	data: Partial<companyModels.company>,
): Promise<number> => {
	return await knexInstance('company_pages')
		.where({ id: id, admin_user_id: admin_user_id })
		.update(data);
};

export const postJob = async (
	companyId: string,
	cretedBy: string,
	companyName: string,
	jobData: Partial<jobModel.job>,
) => {
	const company = await knexInstance('company_pages')
		.where({ id: companyId, admin_user_id: cretedBy })
		.first();

	if (!company) {
		throw new Error('Company not found or unauthorized');
	}

	const job = {
		id: uuidv4(),
		company_id: companyId,
		user_id: cretedBy,
		company_name: companyName,
		...jobData,
	};

	await knexInstance('job_listings').insert(job);

	return job;
};

export const postUpdate = async (
	companyId: string,
	adminUserId: string,
	title: string,
	content: string,
) => {
	const newUpdate = {
		id: uuidv4(),
		company_id: companyId,
		admin_user_id: adminUserId,
		title: title,
		content: content,
		created_at: new Date(),
	};

	await knexInstance('company_updates').insert(newUpdate);

	return newUpdate;
};

export const getCompanyFollowers = async (companyId: string) => {
	return await knexInstance('company_followers')
		.join('users', 'company_followers.user_id', 'users.id')
		.select(
			'users.id as user_id',
			knexInstance.raw(`users.first_name || ' ' || users.last_name as full_name`),
			'company_followers.followed_at',
		)
		.where('company_followers.company_id', companyId);
};

export const removeFollower = async (companyId: string, userId: string) => {
	return await knexInstance('company_followers')
		.where({ company_id: companyId, user_id: userId })
		.del();
};

export const getJobApplications = async (companyId: string) => {
	return await knexInstance('job_applications')
		.select(
			'jobapplications.id AS application_id',
			'jobapplications.status',
			'jobapplications.applied_at',
			'users.id AS user_id',
			'users.first_name',
			'users.last_name',
			'joblistings.id AS job_id',
			'joblistings.title AS job_title',
		)
		.join('users', 'jobapplications.applicant_id', '=', 'users.id')
		.join('joblistings', 'jobapplications.job_id', '=', 'joblistings.id')
		.where('joblistings.company_id', companyId)
		.orderBy('jobapplications.applied_at', 'desc');
};

export const getCompanyTotalFollowers = async (companyId: string) => {
	return await knexInstance('company_followers')
		.where({ company_id: companyId })
		.count('id as total')
		.first();
};

export const getFollowersLast30 = async (companyId: string) => {
	return await knexInstance('company_followers')
		.where({ company_id: companyId })
		.andWhere('followed_at', '>=', knexInstance.raw("NOW() - INTERVAL '30 days'"))
		.count('* as total')
		.first();
};

export const getFollowersPerDay = async (companyId: string) => {
	return await knexInstance('company_followers')
		.where({ company_id: companyId })
		.groupByRaw('DATE(followed_at)')
		.select(
			knexInstance.raw('DATE(followed_at) as date'),
			knexInstance.raw('COUNT(*) as count'),
		)
		.orderBy('date', 'asc');
};
