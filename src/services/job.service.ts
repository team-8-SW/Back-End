import { knexInstance } from '../config/db';
import * as jobModels from '../models/job.model';
import { v4 as uuidv4 } from 'uuid';

export const getJobById = async (id: string) => {
	return await knexInstance('job_listings').where({ id }).select('*');
};

export const getAllJobs = async () => {
	return await knexInstance('job_listings').select('*');
};

export const getSavedJobsByApplicaintId = async (userId: string) => {
	return await knexInstance('saved_jobs').where({ user_id: userId }).select('*');
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

export const getSavedJob = async (userId: string, jobId: string) => {
	return knexInstance('saved_jobs').where({ user_id: userId, job_id: jobId }).first();
};

export const applyForJob = async (
	userId: string,
	jobId: string,
	status: string,
	resumeUrl?: string,
	coverLetter?: string,
) => {
	return knexInstance('job_applications')
		.insert({
			id: uuidv4(),
			job_id: jobId,
			applicant_id: userId,
			resume_url: resumeUrl,
			cover_letter: coverLetter,
			status: 'pending',
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
