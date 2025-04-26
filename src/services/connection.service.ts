import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { knexInstance } from '../config/db';
import { notifyUser } from '../utils/notifications';
//------------Send connection requests to other users---------//

export const sendConnectionRequest = async (userId: string, targetUserId: string) => {
	const existingUser = await knexInstance('users').where({ id: targetUserId }).first();
	if (!existingUser) {
		return 'not found';
	}

	const existingRequest = await knexInstance('connections')
		.where({ requester_id: userId, receiver_id: targetUserId })
		.orWhere({ requester_id: targetUserId, receiver_id: userId })
		.first();

	if (existingRequest && existingRequest.status === 'accepted') {
		return 'already connected';
	}
	if (existingRequest && existingRequest.status === 'pending') {
		return 'already sent';
	}
	if (existingRequest && existingRequest.status === 'declined') {
		await knexInstance('connections').where({ id: existingRequest.id }).update({
			status: 'pending',
			created_at: new Date(),
		});

		const updatedRequest = await knexInstance('connections')
			.where({ id: existingRequest.id })
			.first();

		return updatedRequest;
	}

	const blockExists = await knexInstance('blocked_users')
		.where({ user_id: userId, blocked_user_id: targetUserId })
		.orWhere({ user_id: targetUserId, blocked_user_id: userId })
		.first();

	if (blockExists) {
		return 'blocked';
	}

	const connectionRequest = {
		id: uuidv4(),
		requester_id: userId,
		receiver_id: targetUserId,
		status: 'pending', // Set initial status to 'pending'
		created_at: new Date(),
	};

	await knexInstance('connections').insert(connectionRequest);
		
	const actionusername = await knexInstance('users')
			.where({ id: userId })
			.select('user_name')
			.first();
	// Emit a notification to the post owner
	notifyUser(
			targetUserId,
			{
				type: 'connection',
				content: `You received a new connection from ${actionusername}`,
			},
			userId,
	);
	return connectionRequest;
};

//------------Accept/Decline connection requests---------//
export const acceptConnectionRequest = async (userId: string, connectionId: string) => {
	const connectionRequest = await knexInstance('connections')
		.where({ id: connectionId, receiver_id: userId, status: 'pending' })
		.first();

	if (!connectionRequest) {
		return 'not found';
	}

	const blockExists = await knexInstance('blocked_users')
		.where({ user_id: userId, blocked_user_id: connectionRequest.requester_id })
		.orWhere({ user_id: connectionRequest.requester_id, blocked_user_id: userId })
		.first();

	if (blockExists) {
		return 'blocked';
	}

	await knexInstance('connections')
		.where({ id: connectionId })
		.update({ status: 'accepted', created_at: new Date() });
	//If they are not already following each other, add them to the following table
	const existingFollow1 = await knexInstance('following')
		.where({ follower_id: userId, followed_id: connectionRequest.requester_id })
		.first();

	if (!existingFollow1) {
		await knexInstance('following').insert({
			id: uuidv4(),
			follower_id: userId,
			followed_id: connectionRequest.requester_id,
		});
	}

	const existingFollow2 = await knexInstance('following')
		.where({ follower_id: connectionRequest.requester_id, followed_id: userId })
		.first();

	if (!existingFollow2) {
		await knexInstance('following').insert({
			id: uuidv4(),
			follower_id: connectionRequest.requester_id,
			followed_id: userId,
		});
	}

	const updatedConnection = await knexInstance('connections').where({ id: connectionId }).first();

	return updatedConnection;
};

export const declineConnectionRequest = async (userId: string, connectionId: string) => {
	const connectionRequest = await knexInstance('connections')
		.where({ id: connectionId, receiver_id: userId, status: 'pending' })
		.first();

	if (!connectionRequest) {
		return 'not found';
	}

	const blockExists = await knexInstance('blocked_users')
		.where({ user_id: userId, blocked_user_id: connectionRequest.requester_id })
		.orWhere({ user_id: connectionRequest.requester_id, blocked_user_id: userId })
		.first();

	if (blockExists) {
		return 'blocked';
	}

	await knexInstance('connections')
		.where({ id: connectionId })
		.update({ status: 'declined', created_at: new Date() });

	const updatedConnection = await knexInstance('connections').where({ id: connectionId }).first();

	return updatedConnection;
};

//------------Remove a connection---------//
export const removeConnection = async (userId: string, connectionId: string) => {
	const connection = await knexInstance('connections')
		.where({ id: connectionId })
		.whereIn('status', ['accepted', 'pending'])
		.where(function () {
			this.where({ requester_id: userId }).orWhere({ receiver_id: userId });
		})
		.first();
	if (!connection) {
		return 'not found';
	}
	const blockExists = await knexInstance('blocked_users')
		.where({ user_id: userId, blocked_user_id: connection.requester_id })
		.orWhere({ user_id: connection.requester_id, blocked_user_id: userId })
		.first();
	if (blockExists) {
		return 'blocked';
	}
	//if the connection is removed, remove the mutual following
	await knexInstance('following')
		.where({ follower_id: userId, followed_id: connection.requester_id })
		.del();
	await knexInstance('following')
		.where({ follower_id: connection.requester_id, followed_id: userId })
		.del();

	await knexInstance('connections').where({ id: connectionId }).delete();
	return 'deleted';
};

//------------Get a list of connections---------//
export const getAllConnections = async (userId: string) => {
	const connections = await knexInstance('connections')
		.where(function () {
			this.where({ requester_id: userId }).orWhere({ receiver_id: userId });
		})
		.andWhere({ status: 'accepted' })
		.join('users', function () {
			this.on('connections.requester_id', '=', 'users.id').orOn(
				'connections.receiver_id',
				'=',
				'users.id',
			);
		})
		.join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
		.whereNot('users.id', userId) // Exclude the logged-in user's own details
		.select(
			'connections.id as connectionId',
			'users.id as userId',
			'users.first_name as firstName',
			'users.last_name as lastName',
			'user_profiles.headline',
			'user_profiles.profile_picture_url as profilePictureUrl',
			'connections.created_at as connectedAt',
		);
	const totalConnections = connections.length;

	return { connections, totalConnections };
};

//------------Get a list of pending/sent connection requests---------//
export const getPendingConnectionRequests = async (userId: string) => {
	const pendingRequests = await knexInstance('connections')
		.where({ receiver_id: userId, status: 'pending' })
		.join('users', 'connections.requester_id', '=', 'users.id')
		.join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
		.select(
			'connections.id as connection_id',
			'users.id as user_id',
			'users.first_name',
			'users.last_name',
			'user_profiles.headline',
			'user_profiles.profile_picture_url',
			'connections.created_at as requested_at',
		);
	const totalPendingRequests = pendingRequests.length;

	return { pendingRequests, totalPendingRequests };
};

export const getSentConnectionRequests = async (userId: string) => {
	const sentRequests = await knexInstance('connections')
		.where({ requester_id: userId, status: 'pending' })
		.join('users', 'connections.receiver_id', '=', 'users.id')
		.join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
		.select(
			'users.id as user_id',
			'users.first_name',
			'users.last_name',
			'user_profiles.headline',
			'user_profiles.profile_picture_url',
			'connections.created_at as requested_at',
		);
	const totalSentRequests = sentRequests.length;

	return { sentRequests, totalSentRequests };
};
//--------------------------Helper functions--------------------------//
export const checkConnectionLimit = async (userId: string) => {
	const connectionCount = await knexInstance('connections')
		.where(function () {
			this.where({ requester_id: userId });
		})
		.andWhere({ status: 'accepted' })
		.count('* as count');

	return parseInt(connectionCount[0].count.toString(), 10) >= 50;
};

export const getRequesterId = async (connectionId: string) => {
	const connection = await knexInstance('connections')
		.where({ id: connectionId })
		.select('requester_id')
		.first();

	if (!connection) {
		return null;
	}

	return connection.requester_id;
};
