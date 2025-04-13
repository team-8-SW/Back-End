import { knexInstance } from '../config/db';

export interface job {
	id: string;
	user_id: string;
	company_id: string;
	company_name: string;
	title: string;
	description: string;
	location?: string;
	employement_type?: string;
	workplace_type?: string;
	experience_level?: string;
	posted_at: Date;
	expires_at?: Date;
}
