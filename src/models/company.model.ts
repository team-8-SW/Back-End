import { knexInstance } from '../config/db';

export interface company {
	id: string;
	name: string;
	description?: string;
	industry: string;
	logo_url?: string;
	organization_type: string;
	website?: string;
	size: string;
	location?: string;
	admin_user: number;
	created_at: Date;
	about?: string;
	cover_photo_url?: string;
	follower_count: number;
}
