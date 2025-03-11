export const insertUsers =
	'INSERT INTO users (id,user_name, email, password_hash, first_name, last_name, email_verified, is_premium, premium_expiry, is_active, reset_token, reset_token_expiry, isadmin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
