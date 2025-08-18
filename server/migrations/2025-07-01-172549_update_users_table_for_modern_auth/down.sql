-- Remove the new columns added to users table
ALTER TABLE users 
DROP COLUMN display_name,
DROP COLUMN avatar_url,
DROP COLUMN auth_provider,
DROP COLUMN email_verified,
DROP COLUMN last_login;
