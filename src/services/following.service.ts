import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { knexInstance } from '../config/db';

export const getFollowing = async (userId: string) => {
	return await knexInstance('following')
		.join('users', 'following.followed_id', 'users.id') // Get followed users' details
		.leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
		.select(
			'users.id',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.headline',
		)
		.where('following.follower_id', userId); // Get users the current user is following
};

export const getFollowers = async (userId: string) => {
	const followers = await knexInstance('following')
		.join('users', 'following.follower_id', 'users.id') // Get follower details
		.leftJoin('user_profiles', 'users.id', 'user_profiles.user_id') // Join to get headline
		.select(
			'users.id',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.headline',
		)
		.where('following.followed_id', userId); // Get followers of this user

	return followers;
};

export const followAUser = async (userId: string, followUserId: string) => {
	// Check if already following
	const existingFollow = await knexInstance('following')
		.where({ follower_id: userId, followed_id: followUserId })
		.first();

	if (existingFollow) {
		throw new Error('You are already following this user');
	}

	const [newFollow] = await knexInstance('following')
		.insert({
			id: uuidv4(),
			follower_id: userId,
			followed_id: followUserId,
		})
		.returning('*');

	return newFollow;
};

export const deleteFollow = async (userId: string, unfollowUserId: string) => {
	const existingUnfollow = await knexInstance('following')
		.where({ follower_id: userId, followed_id: unfollowUserId })
		.first();

	if (!existingUnfollow) {
		throw new Error('You are not following this user');
	}

	const [newFollow] = await knexInstance('following')
		.where({ follower_id: userId, followed_id: unfollowUserId })
		.del()
		.returning('*');

	return newFollow;
};
