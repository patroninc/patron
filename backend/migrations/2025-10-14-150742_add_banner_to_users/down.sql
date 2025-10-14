-- This file should undo anything in `up.sql`
-- Remove banner column from users table
ALTER TABLE users DROP COLUMN banner;
