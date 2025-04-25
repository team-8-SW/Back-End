import { knexInstance } from '../config/db';
import * as jobModels from '../models/job.model';
import { v4 as uuidv4 } from 'uuid';

export const getJobById = async (id: string) => {
	return await knexInstance('job_listings').where({ id }).select('*');
};

export const getJobsByUserId = async (userId: string) => {
	return await knexInstance('job_listings').where({ user_id: userId }).select('*');
};

export const getAllJobs = async () => {
	return await knexInstance('job_listings').select('*');
};

export const getSavedJobsByApplicaintId = async (userId: string) => {
	return await knexInstance('saved_jobs').where({ user_id: userId }).select('*');
};

export const getAppliedJobsByApplicaintId = async (applicantId: string) => {
	const applications = await knexInstance('job_applications')
        .select('*')
        .where('applicant_id', applicantId)
		.orderBy('applied_at', 'desc');
	
		return applications;

};

export const getApplicationsByJobId = async (jobId: string) => {
	return await knexInstance('job_applications').where({ job_id: jobId }).select('*');
};

export const searchJob = async (keyword?: string, location?: string, industry?: string) => {
	let query = knexInstance('job_listings').select('*');

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
	return knexInstance('job_listings')
		.where((query) => {
			if (experienceLevel) query.where('experience_level', experienceLevel);
			if (company) query.where('company_name', company);
			if (minSalary) query.where('salary', '>=', minSalary);
			if (maxSalary) query.where('salary', '<=', maxSalary);
		})
		.select('*');
};

export const saveJob = async (userId: string, jobId: string) => {
	return knexInstance('saved_jobs')
		.insert({ id: uuidv4(), user_id: userId, job_id: jobId })
		.returning('*');
};

export const unSaveJob = async (userId: string, jobId: string) => {
	return knexInstance('saved_jobs').where({ user_id: userId, job_id: jobId }).delete();
};

export const postJob = async (userId: string, jobData: Partial<jobModels.job>) => {
	const job = {
		id: uuidv4(),
		company_id: null,
		user_id: userId,
		company_name: null,
		...jobData,
	};

	await knexInstance('job_listings').insert(job);

	return job;
};

export const getSavedJob = async (userId: string, jobId: string) => {
	return knexInstance('saved_jobs').where({ user_id: userId, job_id: jobId }).first();
};

export const applyForJob = async (
	jobId: string,
	applicantId: string,
	firstName: string,
	lastName: string,
	phoneNumber: string,
	email: string,
	country: string,
	address: string,
	resumeUrl: string,
	coverLetter?: string,
) => {
	const appliedJob = await knexInstance('job_applications')
		.insert({
			id: uuidv4(),
			job_id: jobId,
			applicant_id: applicantId,
			first_name: firstName,
			last_name: lastName,
			phone_number: phoneNumber,
			email: email,
			country: country,
			address: address,
			resume_url: resumeUrl,
			cover_letter: coverLetter,
			status: 'pending',
			applied_at: knexInstance.fn.now(),
			last_updated: knexInstance.fn.now(),
		})
		.returning('*');
};

export const getAppliedJob = async (userId: string, jobId: string) => {
	return knexInstance('job_applications').where({ job_id: jobId, applicant_id: userId }).first();
};

export const getApplicationStatus = async (userId: string, jobId: string) => {
	return knexInstance('job_applications')
		.select('status')
		.where({ job_id: jobId, applicant_id: userId })
		.first();
};

//------------------Helper functions------------------//
export const checkJobApplicationLimit = async (userId: string): Promise<boolean> => {
	const result = await knexInstance('job_applications')
		.where({ applicant_id: userId })
		.andWhereRaw("DATE_TRUNC('month', applied_at) = DATE_TRUNC('month', CURRENT_DATE)")
		.count('id as count')
		.first();

	const count = result?.count ? Number(result.count) : 0;
	return count >= 5;
};

export const acceptApplication = async (applicationId: string) => {
	await knexInstance('job_applications')
		.where({ id: applicationId })
		.update({
			status: 'accepted',
			last_updated: knexInstance.fn.now(),
		})
		.returning('*');
};

export const rejectApplication = async (applicationId: string) => {
	await knexInstance('job_applications')
		.where({ id: applicationId })
		.update({
			status: 'rejected',
			last_updated: knexInstance.fn.now(),
		})
		.returning('*');
};
