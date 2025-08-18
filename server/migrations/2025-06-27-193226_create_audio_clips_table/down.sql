-- This file should undo anything in `up.sql`
ALTER TABLE generations DROP COLUMN audio_clip_id;
ALTER TABLE generations DROP COLUMN prediction_id;
ALTER TABLE generations ADD COLUMN prompt TEXT;
DROP TABLE audio_clips;