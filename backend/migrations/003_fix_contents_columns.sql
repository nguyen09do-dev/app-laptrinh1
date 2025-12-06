-- Migration: Fix contents table - add missing columns
-- This adds the 'format' column if it doesn't exist

-- Add format column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contents' AND column_name = 'format'
    ) THEN
        ALTER TABLE contents ADD COLUMN format VARCHAR(50) DEFAULT 'markdown';
        RAISE NOTICE 'Added format column to contents table';
    ELSE
        RAISE NOTICE 'format column already exists';
    END IF;
END $$;

-- Add reading_time column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contents' AND column_name = 'reading_time'
    ) THEN
        ALTER TABLE contents ADD COLUMN reading_time INTEGER;
        RAISE NOTICE 'Added reading_time column to contents table';
    ELSE
        RAISE NOTICE 'reading_time column already exists';
    END IF;
END $$;

