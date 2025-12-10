-- Migration: Add pack_id column to contents table
-- This tracks which pack created each content version

ALTER TABLE contents
ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES content_packs(pack_id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contents_pack_id ON contents(pack_id);

-- Add comment
COMMENT ON COLUMN contents.pack_id IS 'The pack that created this content version';

