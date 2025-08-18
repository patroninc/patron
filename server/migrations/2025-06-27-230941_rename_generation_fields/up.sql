-- Your SQL goes here
ALTER TABLE generations
RENAME COLUMN video_url TO s3_key;
