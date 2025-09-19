CREATE TABLE user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT NOT NULL, -- SHA-256 hash for deduplication and integrity
    status TEXT NOT NULL DEFAULT 'uploaded', -- uploaded, processing, processed, failed, deleted
    metadata JSONB, -- flexible storage for file-specific metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- soft delete support
);

-- Indexes for common queries
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_status ON user_files(status);
CREATE INDEX idx_user_files_file_hash ON user_files(file_hash);
CREATE INDEX idx_user_files_created_at ON user_files(created_at);
CREATE INDEX idx_user_files_deleted_at ON user_files(deleted_at) WHERE deleted_at IS NULL;

-- Unique constraint to prevent duplicate files for the same user (based on hash)
CREATE UNIQUE INDEX idx_user_files_unique_user_hash ON user_files(user_id, file_hash) WHERE deleted_at IS NULL;
