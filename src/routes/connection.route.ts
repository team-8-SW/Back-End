import express from 'express';
import * as connectionController from '../controllers/connection.controller';
import { authMiddleware2 } from '../middleware/auth.middleware';

const router = express.Router();
//------------Send connection requests to other users---------//
//POST /api/connections/users/{userId}
router.post('/users/:userId', authMiddleware2, connectionController.sendConnectionRequest);

//------------Accept/Decline connection requests---------//
//POST /api/connections/{connectionId}/accept
router.post('/:connectionId/accept', authMiddleware2, connectionController.acceptConnectionRequest);
//POST /api/connections/{connectionId}/decline
router.post(
	'/:connectionId/decline',
	authMiddleware2,
	connectionController.declineConnectionRequest,
);

//------------Remove a connection---------//
//DELETE /api/connections/{connectionId}
router.delete('/:connectionId', authMiddleware2, connectionController.removeConnection);

//------------Get a list of connections---------//
//GET /api/connections
router.get('/', authMiddleware2, connectionController.getAllConnections);

//------------Get a list of pending/sent connection requests---------//
//GET /api/connections/pending
router.get('/pending', authMiddleware2, connectionController.getPendingConnectionRequests);

//GET /api/connections/sent
router.get('/sent', authMiddleware2, connectionController.getSentConnectionRequests);

export default router;
