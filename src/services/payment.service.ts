import { knexInstance } from '../config/db';
import stripe from '../config/stripe';

//------------------------------------Make Payment------------------------------------//
export const createPaymentIntent = async (): Promise<string> => {
	const paymentIntent = await stripe.paymentIntents.create({
		amount: 5000, // $50.00
		currency: 'usd',
		automatic_payment_methods: { enabled: true },
	});

	return paymentIntent.client_secret!;
};

export const markUserAsPremium = async (userId: string) => {
	const user = await knexInstance('users').where({ id: userId }).first();

	if (!user) {
		return 'not found';
	}

	await knexInstance('users').where({ id: userId }).update({ is_premium: true });
	return knexInstance('users').select('is_premium').where({ id: userId }).first();
};

//------------------------------------Cancel Subscription------------------------------------//
export const cancelSubscription = async (userId: string) => {
	const user = await knexInstance('users').where({ id: userId }).first();

	if (!user) {
		return 'not found';
	}

	await knexInstance('users').where({ id: userId }).update({ is_premium: false });
	return knexInstance('users').select('is_premium').where({ id: userId }).first();
};
