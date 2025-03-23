import axios from 'axios';

export const verifyRecaptcha = async (recaptchaToken: string): Promise<boolean> => {
	try {
		const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
			params: {
				secret: process.env.RECAPTCHA_SECRET_KEY,
				response: recaptchaToken,
			},
		});
		return response.data.success;
	} catch (error) {
		console.error('reCAPTCHA verification failed:', error);
		return false;
	}
};
