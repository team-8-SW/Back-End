import { knexInstance } from '../config/db';
import * as jobModels from '../models/job.model';

export const getJobById = async (id: string) => {
	return await knexInstance('joblistings').where({ id }).select('*');
};
