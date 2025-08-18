-- This file should undo anything in `up.sql`
ALTER TABLE clips RENAME COLUMN s3_key TO s3_url;