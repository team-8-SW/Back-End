import express from 'express';
import * as paymentsController from '../controllers/payment.controller';
import { authMiddleware2 } from '../middleware/auth.middleware';

const router = express.Router();
//------------------------------------Make Payment------------------------------------//
// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', authMiddleware2, paymentsController.createPaymentIntent);
// POST /api/payments/confirm
router.post('/confirm', authMiddleware2, paymentsController.markUserAsPremium);

//------------------------------------Cancel Subscription------------------------------------//
// POST /api/payments/cancel-subscription
router.post('/cancel-subscription', authMiddleware2, paymentsController.cancelSubscription);

export default router;
