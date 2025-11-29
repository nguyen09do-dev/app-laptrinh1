-- Add reading_time column to contents table
ALTER TABLE contents ADD COLUMN IF NOT EXISTS reading_time INTEGER;

-- Update existing records with estimated reading time (200 words per minute)
UPDATE contents
SET reading_time = CEIL(word_count::numeric / 200)
WHERE reading_time IS NULL;
