import { ispremium } from '../services/users.service';
import { knexInstance as db } from '../config/db';

export const canSendMessageToday = async (userId: string): Promise<boolean> => {
	const isPremium = await ispremium(userId);
	if (isPremium) return true;

	const result = await db('messages')
		.where({ sender_id: userId })
		.andWhereRaw('DATE(sent_at) = CURRENT_DATE')
		.count<{ count: string }>('id as count')
		.first();

	const sentCount = result?.count ? parseInt(result.count, 10) : 0;
	return sentCount < 5;
};
