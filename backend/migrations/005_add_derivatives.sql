-- Migration: Add derivatives JSONB column and derivative_versions table
-- Version: 005
-- Description: Multi-platform Derivatives system for content packs

-- =====================================================
-- 1. Add derivatives column to content_packs (idempotent)
-- =====================================================
DO $$
BEGIN
    -- Check if derivatives column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_packs' AND column_name = 'derivatives'
    ) THEN
        ALTER TABLE content_packs 
        ADD COLUMN derivatives JSONB DEFAULT '{}'::jsonb;
        
        RAISE NOTICE '✅ Added derivatives column to content_packs';
    ELSE
        RAISE NOTICE '⏭️  derivatives column already exists';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN content_packs.derivatives IS 'Multi-platform content derivatives: twitter_thread, linkedin, email, blog_summary, seo_description';

-- =====================================================
-- 2. Create derivative_versions table for versioning
-- =====================================================
CREATE TABLE IF NOT EXISTS derivative_versions (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES content_packs(pack_id) ON DELETE CASCADE,
    derivative_type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for efficient queries
    CONSTRAINT valid_derivative_type CHECK (
        derivative_type IN ('twitter_thread', 'linkedin', 'email', 'blog_summary', 'seo_description', 'all')
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_derivative_versions_pack_id ON derivative_versions(pack_id);
CREATE INDEX IF NOT EXISTS idx_derivative_versions_type ON derivative_versions(derivative_type);
CREATE INDEX IF NOT EXISTS idx_derivative_versions_created_at ON derivative_versions(created_at DESC);

-- Add comments
COMMENT ON TABLE derivative_versions IS 'Versioning table for content derivatives - stores history of all generated derivatives';
COMMENT ON COLUMN derivative_versions.derivative_type IS 'Type: twitter_thread, linkedin, email, blog_summary, seo_description, or all';
COMMENT ON COLUMN derivative_versions.content IS 'The derivative content (string for most, array for twitter_thread)';

-- =====================================================
-- 3. Create index on derivatives JSONB for queries
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_content_packs_derivatives ON content_packs USING GIN (derivatives);

-- =====================================================
-- 4. Verify migration
-- =====================================================
DO $$
DECLARE
    col_exists BOOLEAN;
    table_exists BOOLEAN;
BEGIN
    -- Check derivatives column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_packs' AND column_name = 'derivatives'
    ) INTO col_exists;
    
    -- Check derivative_versions table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'derivative_versions'
    ) INTO table_exists;
    
    IF col_exists AND table_exists THEN
        RAISE NOTICE '✅ Migration 005 completed successfully!';
        RAISE NOTICE '   - content_packs.derivatives column: OK';
        RAISE NOTICE '   - derivative_versions table: OK';
    ELSE
        RAISE EXCEPTION '❌ Migration verification failed';
    END IF;
END $$;


