-- Restore monetization-related columns to series table
ALTER TABLE series ADD COLUMN is_published BOOLEAN;
ALTER TABLE series ADD COLUMN is_monetized BOOLEAN;
ALTER TABLE series ADD COLUMN pricing_tier VARCHAR;

-- Restore monetization-related column to posts table
ALTER TABLE posts ADD COLUMN is_premium BOOLEAN;
