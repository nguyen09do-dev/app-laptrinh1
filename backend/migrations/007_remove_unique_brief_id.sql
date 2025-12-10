-- Migration: Remove UNIQUE constraint on brief_id in contents table
-- This allows multiple versions of content from the same brief

-- Drop the unique constraint if it exists
ALTER TABLE contents
DROP CONSTRAINT IF EXISTS contents_brief_id_key;

-- Also drop any other unique constraint on brief_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'contents_brief_id_key'
    ) THEN
        ALTER TABLE contents DROP CONSTRAINT contents_brief_id_key;
    END IF;
END $$;

