-- Remove monetization-related columns from series table
ALTER TABLE series DROP COLUMN IF EXISTS is_published;
ALTER TABLE series DROP COLUMN IF EXISTS is_monetized;
ALTER TABLE series DROP COLUMN IF EXISTS pricing_tier;

-- Remove monetization-related column from posts table
ALTER TABLE posts DROP COLUMN IF EXISTS is_premium;
