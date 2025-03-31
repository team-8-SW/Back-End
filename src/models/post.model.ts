// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { knexInstance } from '../config/db';

export interface posts {
	id: string;
	user_id: string;
	company_id: string;
	content: string;
	media_url: string;
    media_type: string;
    like_count: number;
    comment_count: number;
    repost_count: number;
    created_at: Date;
    edited_at: Date;
    visibility: string;
    
}
