CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    number INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    audio_file_id UUID REFERENCES user_files(id),
    video_file_id UUID REFERENCES user_files(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT unique_series_slug UNIQUE(series_id, slug),
    CONSTRAINT unique_series_number UNIQUE(series_id, number)
);

CREATE INDEX idx_posts_series_id ON posts(series_id);
CREATE INDEX idx_posts_number ON posts(series_id, number);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_is_published ON posts(is_published);
