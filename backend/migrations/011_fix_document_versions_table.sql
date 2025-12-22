-- Migration: Fix document_versions table schema
-- Version: 011
-- Description: Add missing columns to document_versions table

-- =====================================================
-- 1. Add missing 'url' column
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_versions' AND column_name = 'url'
    ) THEN
        ALTER TABLE document_versions ADD COLUMN url TEXT;
        RAISE NOTICE 'Added url column to document_versions';
    END IF;
END $$;

-- =====================================================
-- 2. Add missing 'content' column if needed
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_versions' AND column_name = 'content'
    ) THEN
        ALTER TABLE document_versions ADD COLUMN content TEXT;
        RAISE NOTICE 'Added content column to document_versions';
    END IF;
END $$;

-- =====================================================
-- 3. Add missing 'embedding' column if needed
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_versions' AND column_name = 'embedding'
    ) THEN
        ALTER TABLE document_versions ADD COLUMN embedding vector(1536);
        RAISE NOTICE 'Added embedding column to document_versions';
    END IF;
END $$;

-- =====================================================
-- 4. Add missing 'author' column if needed
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_versions' AND column_name = 'author'
    ) THEN
        ALTER TABLE document_versions ADD COLUMN author TEXT;
        RAISE NOTICE 'Added author column to document_versions';
    END IF;
END $$;

-- =====================================================
-- 5. Add missing 'published_date' column if needed
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_versions' AND column_name = 'published_date'
    ) THEN
        ALTER TABLE document_versions ADD COLUMN published_date TIMESTAMP;
        RAISE NOTICE 'Added published_date column to document_versions';
    END IF;
END $$;

-- =====================================================
-- 6. Add missing 'tags' column if needed
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_versions' AND column_name = 'tags'
    ) THEN
        ALTER TABLE document_versions ADD COLUMN tags TEXT[];
        RAISE NOTICE 'Added tags column to document_versions';
    END IF;
END $$;



