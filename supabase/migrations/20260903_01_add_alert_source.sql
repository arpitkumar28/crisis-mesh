-- Keep the alert entity and deployed database schema aligned.
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS source VARCHAR(100);
