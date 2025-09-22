CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    is_monetized BOOLEAN DEFAULT false,
    pricing_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_series_user_id ON series(user_id);
CREATE INDEX idx_series_slug ON series(slug);
CREATE INDEX idx_series_created_at ON series(created_at);
