import { Request, Response } from 'express';
import * as paymentsService from '../services/payment.service';

//------------------------------------Make Payment------------------------------------//
export const createPaymentIntent = async (req: Request, res: Response) => {
	try {
		const clientSecret = await paymentsService.createPaymentIntent();
		res.status(200).json({ clientSecret });
	} catch (error) {
		res.status(500).json({ error: 'Failed to create payment intent' });
	}
};

export const markUserAsPremium = async (req: Request, res: Response) => {
	const userId = (req as any).user?.id;

	try {
		const result = await paymentsService.markUserAsPremium(userId);
		if (result === 'not found') {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json({ message: 'User upgraded to premium', isPremium: result.is_premium });
	} catch (error) {
		res.status(500).json({ error: 'Failed to mark user as premium' });
	}
};

//------------------------------------Cancel Subscription------------------------------------//

export const cancelSubscription = async (req: Request, res: Response) => {
	const userId = (req as any).user?.id;

	try {
		const result = await paymentsService.cancelSubscription(userId);
		if (result === 'not found') {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json({
			message: 'Subscription cancelled successfully',
			isPremium: result.is_premium,
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to cancel subscription' });
	}
};
