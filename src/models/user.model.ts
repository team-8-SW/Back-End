export interface User {
	id: string;
	userName: string;
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
	emailVerified: boolean;
	isPremium: boolean;
	premiumExpiry?: Date | null;
	isActive: boolean;
	resetToken?: string | null;
	resetTokenExpiry?: Date | null;
	isAdmin: boolean;
}
