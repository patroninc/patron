CREATE TABLE
  users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- nullable for OAuth-only users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  user_oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL, -- the unique ID from the OAuth provider
    access_token TEXT, -- optional, for refresh if needed
    refresh_token TEXT, -- optional
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id)
  );

CREATE TABLE
  oauth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    state TEXT NOT NULL UNIQUE, -- OAuth state parameter to prevent CSRF
    provider TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- optional: when this session should expire
    redirect_uri TEXT, -- optional: where to redirect after callback
    user_id UUID REFERENCES users (id) ON DELETE SET NULL -- optional: link if user is known
  );

-- create an email verification table
CREATE TABLE
  email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    verification_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP
  );

CREATE TABLE
  password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reset_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP
  );