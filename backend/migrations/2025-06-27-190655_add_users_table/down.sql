-- This file should undo anything in `up.sql`
DROP TABLE IF EXISTS oauth_sessions;

DROP TABLE IF EXISTS user_oauth_providers;

DROP TYPE IF EXISTS oauth_provider;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS email_verifications;

DROP TABLE IF EXISTS password_resets;