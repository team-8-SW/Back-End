// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	admin_user_id: string;
	created_at: Date;
	about?: string;
	cover_photo_url?: string;
	follower_count: number;
}
