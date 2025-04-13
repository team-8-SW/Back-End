// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { knexInstance } from '../config/db';

export interface notifications {
	id: string;
	user_id: string;
	type: string;
	content: string;
	is_read: boolean;
	created_at: Date;
	action_userid: string;
	comment_id: string;
	post_id: string;
}
