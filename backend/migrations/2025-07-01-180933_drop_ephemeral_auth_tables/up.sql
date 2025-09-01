-- Drop ephemeral authentication tables that are now handled by Redis/session storage

-- Drop dependent tables first (due to foreign key constraints)
DROP TABLE IF EXISTS user_oauth_providers;
DROP TABLE IF EXISTS email_verifications; 
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS oauth_sessions;
