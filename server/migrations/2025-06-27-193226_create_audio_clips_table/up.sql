-- Your SQL goes here
CREATE TABLE audio_clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT NOT NULL,
    character_id UUID NOT NULL REFERENCES characters(id),
    s3_key TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE generations ADD COLUMN audio_clip_id UUID NOT NULL REFERENCES audio_clips(id);
ALTER TABLE generations ADD COLUMN prediction_id TEXT NOT NULL;
ALTER TABLE generations DROP COLUMN prompt;