-- This file should undo anything in `up.sql`
ALTER TABLE characters RENAME TO celebs;

DROP TABLE generations;