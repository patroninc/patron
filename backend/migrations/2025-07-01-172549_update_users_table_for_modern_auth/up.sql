-- Add new columns to users table for modern authentication
ALTER TABLE users 
ADD COLUMN display_name VARCHAR(255),
ADD COLUMN avatar_url TEXT,
ADD COLUMN auth_provider VARCHAR(50) NOT NULL DEFAULT 'email',
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN last_login TIMESTAMP;

-- Update existing users to have email verified if they have OAuth providers
UPDATE users 
SET email_verified = true 
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM user_oauth_providers 
    WHERE provider = 'google'
);

-- Update auth_provider for users with OAuth
UPDATE users 
SET auth_provider = 'google'
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM user_oauth_providers 
    WHERE provider = 'google'
) AND password_hash IS NULL;

-- Update auth_provider for users with both OAuth and password
UPDATE users 
SET auth_provider = 'both'
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM user_oauth_providers 
    WHERE provider = 'google'
) AND password_hash IS NOT NULL;

-- Update email_verified for users who have verified email verification records
UPDATE users 
SET email_verified = true 
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM email_verifications 
    WHERE verified_at IS NOT NULL
);
