-- Your SQL goes here
-- add a new table to relate generations to users
CREATE TABLE
  user_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    generation_id UUID NOT NULL REFERENCES generations (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- add a unique constraint to ensure a user can only have one relation per generation
ALTER TABLE user_generations ADD CONSTRAINT unique_user_generation UNIQUE (user_id, generation_id);

-- add an index for faster lookups
CREATE INDEX idx_user_generations_user_id ON user_generations (user_id);

CREATE INDEX idx_user_generations_generation_id ON user_generations (generation_id);

-- add a new table to relate audio clips to users
CREATE TABLE
  user_audio_clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    audio_clip_id UUID NOT NULL REFERENCES audio_clips (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- add a unique constraint to ensure a user can only have one relation per audio clip
ALTER TABLE user_audio_clips ADD CONSTRAINT unique_user_audio_clip UNIQUE (user_id, audio_clip_id);

-- add an index for faster lookups
CREATE INDEX idx_user_audio_clips_user_id ON user_audio_clips (user_id);

CREATE INDEX idx_user_audio_clips_audio_clip_id ON user_audio_clips (audio_clip_id);