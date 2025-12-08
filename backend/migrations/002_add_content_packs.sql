-- Migration: Create content_packs table
-- Content packs are draft content generated from briefs with LLM streaming

-- Enable uuid-ossp extension for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM type for pack status (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pack_status') THEN
        CREATE TYPE pack_status AS ENUM ('draft', 'review', 'approved', 'published');
    END IF;
END $$;

-- Create content_packs table
CREATE TABLE IF NOT EXISTS content_packs (
    pack_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id INTEGER NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
    
    -- Content data
    draft_content TEXT,
    word_count INTEGER DEFAULT 0,
    
    -- Status tracking
    status pack_status DEFAULT 'draft',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_content_packs_updated_at ON content_packs;
CREATE TRIGGER trigger_content_packs_updated_at
    BEFORE UPDATE ON content_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_content_packs_updated_at();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_packs_brief_id ON content_packs(brief_id);
CREATE INDEX IF NOT EXISTS idx_content_packs_status ON content_packs(status);
CREATE INDEX IF NOT EXISTS idx_content_packs_created_at ON content_packs(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE content_packs IS 'Content packs generated from briefs using LLM streaming';
COMMENT ON COLUMN content_packs.pack_id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN content_packs.brief_id IS 'Reference to the source brief';
COMMENT ON COLUMN content_packs.draft_content IS 'Full draft content text';
COMMENT ON COLUMN content_packs.word_count IS 'Calculated word count of draft_content';
COMMENT ON COLUMN content_packs.status IS 'Workflow status: draft, review, approved, published';
COMMENT ON COLUMN content_packs.updated_at IS 'Auto-updated on each modification';



