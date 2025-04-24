import { Request, Response } from 'express';
import * as connectionService from '../services/connection.service';
import { ispremium } from '../services/users.service';

//------------Send connection requests to other users---------//

export const sendConnectionRequest = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { userId: targetUserId } = req.params;

		if (userId === targetUserId) {
			return res
				.status(400)
				.json({ message: 'You cannot send a connection request to yourself.' });
		}

		const isPremium = await ispremium(userId);

		if (!isPremium) {
			const overConnectionLimit = await connectionService.checkConnectionLimit(userId);
			if (overConnectionLimit) {
				return res
					.status(403)
					.json({ message: 'Connection limit reached. Upgrade to premium.' });
			}
		}

		const connectionRequest = await connectionService.sendConnectionRequest(
			userId,
			targetUserId,
		);

		if (connectionRequest === 'not found') {
			return res.status(404).json({ message: 'User not found.' });
		}

		// Handle cases where the request cannot be sent
		if (connectionRequest === 'already connected') {
			return res.status(400).json({ message: 'Already connected.' });
		}
		if (connectionRequest === 'already sent') {
			return res.status(400).json({ message: 'Connection request already sent.' });
		}

		if (connectionRequest === 'blocked') {
			return res.status(403).json({
				message:
					'Cannot send a connection request. One of the users has blocked the other.',
			});
		}

		if (!connectionRequest) {
			return res.status(404).json({ message: 'User not found.' });
		}

		res.status(200).json({
			message: 'Connection request sent successfully.',
			connectionRequest,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//------------Accept/Decline connection requests---------//
export const acceptConnectionRequest = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { connectionId } = req.params;

		// Check if connectionId is missing or invalid
		if (!connectionId || connectionId.trim() === '') {
			return res.status(400).json({ message: 'Connection ID is required.' });
		}
		// Check if the user can accept the connection request

		const requesterId = await connectionService.getRequesterId(connectionId);

		const isAcceptorPremium = await ispremium(userId);
		const isRequesterPremium = await ispremium(requesterId);

		const acceptorLimit = await connectionService.checkConnectionLimit(userId);
		const requesterLimit = await connectionService.checkConnectionLimit(requesterId);

		if (!isAcceptorPremium && acceptorLimit) {
			return res
				.status(403)
				.json({ message: 'Connection limit reached. Upgrade to premium.' });
		}
		if (!isRequesterPremium && requesterLimit) {
			return res.status(403).json({
				message: 'The user who sent this request has reached their connection limit.',
			});
		}

		const result = await connectionService.acceptConnectionRequest(userId, connectionId);

		// Handle cases where the request cannot be accepted
		if (result === 'not found') {
			return res.status(404).json({ message: 'Connection request not found.' });
		}

		if (result === 'blocked') {
			return res.status(403).json({
				message:
					'Cannot accept the connection request. One of the users has blocked the other.',
			});
		}

		res.status(200).json({
			message: 'Connection request accepted successfully.',
			connectionRequest: result,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const declineConnectionRequest = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { connectionId } = req.params;

		// Check if connectionId is missing or invalid
		if (!connectionId || connectionId.trim() === '') {
			return res.status(400).json({ message: 'Connection ID is required.' });
		}

		const result = await connectionService.declineConnectionRequest(userId, connectionId);

		// Handle cases where the request cannot be declined
		if (result === 'not found') {
			return res.status(404).json({ message: 'Connection request not found.' });
		}

		if (result === 'blocked') {
			return res.status(403).json({
				message:
					'Cannot decline the connection request. One of the users has blocked the other.',
			});
		}

		res.status(200).json({
			message: 'Connection request declined successfully.',
			connectionRequest: result,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//------------Remove a connection---------//
export const removeConnection = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const { connectionId } = req.params;

		// Check if connectionId is missing or invalid
		if (!connectionId || connectionId.trim() === '') {
			return res.status(400).json({ message: 'Connection ID is required.' });
		}

		const result = await connectionService.removeConnection(userId, connectionId);

		// Handle cases where the connection cannot be removed
		if (result === 'not found') {
			return res.status(404).json({ message: 'No connection found to remove' });
		}
		if (result === 'blocked') {
			return res.status(403).json({
				message: 'Cannot remove the connection. One of the users has blocked the other.',
			});
		}

		res.status(200).json({
			message: 'Connection removed successfully.',
			connection: result,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//------------Get a list of connections---------//
export const getAllConnections = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const { connections, totalConnections } = await connectionService.getAllConnections(userId);

		res.status(200).json({ totalConnections, connections });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

//------------Get a list of pending/sent connection requests---------//
export const getPendingConnectionRequests = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const { pendingRequests, totalPendingRequests } =
			await connectionService.getPendingConnectionRequests(userId);

		res.status(200).json({ totalPendingRequests, pendingRequests });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};

export const getSentConnectionRequests = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		const { sentRequests, totalSentRequests } =
			await connectionService.getSentConnectionRequests(userId);

		res.status(200).json({ totalSentRequests, sentRequests });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		res.status(500).json({ error: 'Internal server error', details: errorMessage });
	}
};
