import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendEmail = async (
	to: string,
	subject: string,
	text: string,
	html?: string,
): Promise<void> => {
	try {
		await transporter.sendMail({
			from: `"CareerHub" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			text,
			html,
		});
		console.log(`Email sent to ${to}`);
	} catch (error) {
		console.log('Error sending email:', error);
	}
};
