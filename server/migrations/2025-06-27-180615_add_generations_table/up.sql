-- Your SQL goes here
ALTER TABLE celebs RENAME TO characters;

CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clip_id UUID NOT NULL REFERENCES clips(id),
    character_id UUID NOT NULL REFERENCES characters(id),
    prompt TEXT NOT NULL,
    video_url TEXT,
    status TEXT NOT NULL,
    error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);