CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Human-readable name for the API key
    key_hash TEXT NOT NULL UNIQUE, -- Hashed version of the API key
    key_prefix TEXT NOT NULL, -- First few characters of the key for identification
    permissions TEXT[], -- Array of permissions this key has
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP, -- Optional expiration date
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
