-- This file should undo anything in `up.sql`
ALTER TABLE generations
RENAME COLUMN s3_key TO video_url;