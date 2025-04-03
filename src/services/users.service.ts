import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { knexInstance } from '../config/db';

//------------Block/Unblock users---------//
export const blockUser = async (userId: string, targetUserId: string) => {
	const targetUser = await knexInstance('users').where({ id: targetUserId }).first();

	if (!targetUser) {
		return 'not found';
	}

	const existingBlock = await knexInstance('blocked_users')
		.where({ user_id: userId, blocked_user_id: targetUserId })
		.first();

	if (existingBlock) {
		return 'already blocked';
	}
	// removing follow and connection if they exist
	await knexInstance('following').where({ follower_id: userId, followed_id: targetUserId }).del();
	await knexInstance('following').where({ follower_id: targetUserId, followed_id: userId }).del();

	await knexInstance('connections')
		.where({ receiver_id: userId, requester_id: targetUserId })
		.orWhere({ receiver_id: targetUserId, requester_id: userId })
		.del();

	const block = {
		id: uuidv4(),
		user_id: userId,
		blocked_user_id: targetUserId,
	};

	await knexInstance('blocked_users').insert(block);
	return block;
};

export const unblockUser = async (userId: string, targetUserId: string) => {
	const targetUser = await knexInstance('users').where({ id: targetUserId }).first();

	if (!targetUser) {
		return 'not found';
	}

	const existingBlock = await knexInstance('blocked_users')
		.where({ user_id: userId, blocked_user_id: targetUserId })
		.first();

	if (!existingBlock) {
		return 'not blocked';
	}

	await knexInstance('blocked_users').where({ id: existingBlock.id }).del();
	return existingBlock;
};

//------------Get a list of blocked users---------//
export const getBlockedUsers = async (userId: string) => {
	const blockedCount = await knexInstance('blocked_users')
		.where({ user_id: userId })
		.count('id as count')
		.first();

	if (!blockedCount || blockedCount.count === 0) {
		return [];
	}
	const blockedUsers = await knexInstance('blocked_users')
		.join('users', 'blocked_users.blocked_user_id', '=', 'users.id')
		.join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
		.select(
			'users.id as userId',
			'users.user_name as user_name',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.headline',
			'user_profiles.profile_picture_url as profilePictureUrl',
		)
		.where({ 'blocked_users.user_id': userId });

	return blockedUsers;
};

//------------Search for users by name, company, or industry---------//
export const searchUsers = async (query?: string, company?: string, industry?: string) => {
	const usersQuery = knexInstance('users')
		.select(
			'users.id as userId',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'users.user_name as userName',
			'user_profiles.headline',
			'user_profiles.profile_picture_url as profilePictureUrl',
		)
		.leftJoin('user_profiles', 'users.id', 'user_profiles.user_id');

	// Apply search filter for name
	if (query) {
		usersQuery.where(function () {
			this.whereRaw('LOWER(users.first_name) LIKE ?', [`%${query.toLowerCase()}%`])
				.orWhereRaw('LOWER(users.last_name) LIKE ?', [`%${query.toLowerCase()}%`])
				.orWhereRaw('LOWER(users.user_name) LIKE ?', [`%${query.toLowerCase()}%`]);
		});
	}

	// Apply industry filter
	if (industry) {
		usersQuery.andWhereRaw('LOWER(user_profiles.industry) LIKE ?', [
			`%${industry.toLowerCase()}%`,
		]);
	}

	// Apply company filter
	if (company) {
		usersQuery.whereExists(function () {
			this.select('*')
				.from('work_experience')
				.whereRaw('work_experience.user_id = users.id')
				.andWhereRaw('LOWER(work_experience.company_name) LIKE ?', [
					`%${company.toLowerCase()}%`,
				]);
		});
	}

	const users = await usersQuery;
	return users.length > 0 ? users : [];
};
