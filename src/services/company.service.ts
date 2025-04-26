import { knexInstance } from '../config/db';
import * as companyModels from '../models/company.model';
import { v4 as uuidv4 } from 'uuid';
import * as jobModel from '../models/job.model';

export const getAllCompanies = async () => {
	return await knexInstance('company_pages').select('*');
};

export async function getAllCompaniesByUserId(id: string): Promise<companyModels.company[]> {
	return knexInstance('company_pages').where({ admin_user_id: id }).select('*');
}

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
		logo_url: data.logo_url,
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
//getJobs
export const getJobs = async (companyId: string) => {
	const jobs = await knexInstance('job_listings')
		.select('*') // Select all columns
		.where('company_id', companyId); // Filter by company_id
	return jobs;
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
			'job_applications.id AS application_id',
			'job_applications.status',
			'job_applications.applied_at',
			'users.id AS user_id',
			'users.first_name',
			'users.last_name',
			'job_listings.id AS job_id',
			'job_listings.title AS job_title',
		)
		.join('users', 'job_applications.applicant_id', '=', 'users.id')
		.join('job_listings', 'job_applications.job_id', '=', 'job_listings.id')
		.where('job_listings.company_id', companyId)
		.orderBy('job_applications.applied_at', 'desc');
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

export const getTotalPageViews = async (companyId: string) => {
	return await knexInstance('page_views').where({ page_id: companyId }).count('* as total');
};

export const getViewsPerDay = async (companyId: string) => {
	return await knexInstance('page_views')
		.select(knexInstance.raw('DATE(viewed_at) as day'))
		.count('* as views')
		.where({ page_id: companyId })
		.groupByRaw('DATE(viewed_at)')
		.orderBy('day', 'asc');
};

export const pageViewService = async (companyId: string, userId: string) => {
	const recentView = await knexInstance('page_views')
		.where({
			page_id: companyId,
			user_id: userId,
		})
		.andWhere('viewed_at', '>', knexInstance.raw("NOW() - INTERVAL '30 days'"))
		.first();

	if (recentView) {
		return { alreadyLogged: true };
	}

	await knexInstance('page_views').insert({
		id: uuidv4(),
		page_id: companyId,
		user_id: userId,
		viewed_at: new Date(),
	});

	return { alreadyLogged: false };
};

export const getCompanyContentAnalytics = async (companyId: string) => {
	const updateIds = await knexInstance('company_updates')
		.where({ company_id: companyId })
		.pluck('id');

	if (!updateIds.length) return [];

	const formatDate = (date: any) => {
		if (!date) return null;
		return new Date(date).toISOString().split('T')[0];
	};

	const dateMap: Record<string, any> = {};

	const tables = [
		{
			name: 'company_update_impressions',
			column: 'update_id',
			alias: 'impressions',
		},
		{
			name: 'company_update_reactions',
			column: 'update_id',
			alias: 'reactions',
		},
		{
			name: 'company_update_comments',
			column: 'update_id',
			alias: 'comments',
		},
		{
			name: 'company_update_reposts',
			column: 'original_update_id',
			alias: 'reposts',
		},
	];

	for (const table of tables) {
		const rows = await knexInstance(table.name)
			.select(knexInstance.raw('DATE(created_at) as date'))
			.count('* as count')
			.whereIn(table.column, updateIds)
			.groupByRaw('DATE(created_at)');

		for (const row of rows) {
			const formattedDate = formatDate(String(row.date));
			if (formattedDate) {
				dateMap[formattedDate] ??= {
					date: formattedDate,
					impressions: 0,
					reactions: 0,
					comments: 0,
					reposts: 0,
				};
				dateMap[formattedDate][table.alias] += Number(row.count);
			}
		}
	}

	return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
};

export const getUpdateByCompanyId = async (companyId: string) => {
	return await knexInstance('company_updates')
		.where({ company_id: companyId })
		.select('*')
		.orderBy('created_at', 'desc');
};

export const getUpdateById = async (updateId: string) => {
	return await knexInstance('company_updates').where({ id: updateId }).first();
};

export const getAllUpdates = async () => {
	return await knexInstance('company_updates').select('*');
};

export const updateLogo = async (companyId: string, logoURL: string) => {
	const rowsUpdated = await knexInstance('company_pages')
		.where({ id: companyId })
		.update({ logo_url: logoURL });

	if (rowsUpdated === 0) return null;

	return knexInstance('company_pages')
		.select('logo_url as logoURL')
		.where({ id: companyId })
		.first();
};

export const insertLogo = async (companyId: string, logoURL: string) => {
	await knexInstance('company_pages').insert({
		id: companyId,
		logo_url: logoURL,
	});

	return knexInstance('company_pages')
		.select('logo_url as logoURL')
		.where({ id: companyId })
		.first();
};

export const addRepost = async (originalUpdateId: string, userId: string) => {
	const [newRepost] = await knexInstance('company_update_reposts')
		.insert({
			id: uuidv4(),
			original_update_id: originalUpdateId,
			user_id: userId,
		})
		.returning('*');

	return newRepost;
};

export const addReaction = async (updateId: string, userId: string, type: string): Promise<any> => {
	const [newReaction] = await knexInstance('company_update_reactions')
		.insert({
			id: uuidv4(),
			update_id: updateId,
			user_id: userId,
			type, // Add reaction type
			created_at: new Date(),
		})
		.returning('*');

	return newReaction;
};

export const addComment = async (
	updateId: string,
	userId: string,
	content: string,
): Promise<any> => {
	const [newComment] = await knexInstance('company_update_comments')
		.insert({
			id: uuidv4(),
			update_id: updateId,
			user_id: userId,
			content, // Add comment content
			created_at: new Date(),
		})
		.returning('*');

	return newComment;
};

export const addImpression = async (updateId: string, userId: string) => {
	const [newImpression] = await knexInstance('company_update_impressions')
		.insert({
			id: uuidv4(),
			update_id: updateId,
			user_id: userId,
			created_at: new Date(),
		})
		.returning('*');

	return newImpression;
};

export const getCommentCountByUpdateId = async (updateId: string): Promise<number> => {
	const result = await knexInstance('company_update_comments')
		.where({ update_id: updateId })
		.count<{ count: string }>('id as count')
		.first();
	return Number(result?.count || 0);
};

export const updateCoverPhoto = async (companyId: string, coverPhotoURL: string) => {
	const rowsUpdated = await knexInstance('company_pages')
		.where({ id: companyId })
		.update({ cover_photo_url: coverPhotoURL });

	if (rowsUpdated === 0) return null;

	return knexInstance('company_pages')
		.select('cover_photo_url as coverPhotoURL')
		.where({ id: companyId })
		.first();
};
