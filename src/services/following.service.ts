import { v4 as uuidv4 } from 'uuid';
import { knexInstance } from '../config/db';

export const getFollowing = async (userId: string) => {
	return await knexInstance('following')
		.join('users', 'following.followed_id', 'users.id')
		.leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
		.select(
			'users.id as userId',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.headline',
			'user_profiles.profile_picture_url as profilePictureUrl',
		)
		.where('following.follower_id', userId);
};

export const getFollowers = async (userId: string) => {
	const followers = await knexInstance('following')
		.join('users', 'following.follower_id', 'users.id')
		.leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
		.select(
			'users.id as userId',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.headline',
			'user_profiles.profile_picture_url as profilePictureUrl',
		)
		.where('following.followed_id', userId);

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
