import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
	host: process.env.EMAIL_HOST,
	port: Number(process.env.EMAIL_PORT),
	secure: false, // `true` for port 465, `false` for port 587
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

/**
 * Sends a password reset email to the user.
 *
 * @param {string} to - Recipient email address.
 * @param {string} resetToken - The reset token generated for the user.
 * @returns {Promise<void>} - A promise that resolves once the email is sent.
 */
export const sendResetEmail = async (to: string, resetToken: string): Promise<void> => {
	const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

	const mailOptions = {
		from: process.env.EMAIL_FROM, // Sender email
		to,
		subject: 'Password Reset Request',
		text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
		html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="color:blue;">Reset Password</a>
      <p>If you did not request this, ignore this email.</p>
    `,
	};

	await transporter.sendMail(mailOptions);
};
