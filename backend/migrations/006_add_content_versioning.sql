-- Migration: Add versioning support for contents
-- This allows multiple versions of content from the same brief

-- 1. Add version_number column to contents table
ALTER TABLE contents
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- 2. Add content_id (UUID) for grouping versions
ALTER TABLE contents
ADD COLUMN IF NOT EXISTS content_id UUID;

-- 3. Create content_versions table for version history
CREATE TABLE IF NOT EXISTS content_versions (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL, -- Groups all versions of the same content
    version_number INTEGER NOT NULL,
    brief_id INTEGER NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    format VARCHAR(50) DEFAULT 'markdown',
    word_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    pack_id UUID REFERENCES content_packs(pack_id) ON DELETE SET NULL, -- Track which pack created this version
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, version_number)
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_brief_id ON content_versions(brief_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_version_number ON content_versions(version_number DESC);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON content_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_content_id ON contents(content_id);

-- 5. Update existing contents to have content_id
-- Generate UUID for each existing content as its content_id
UPDATE contents
SET content_id = gen_random_uuid()
WHERE content_id IS NULL;

-- 6. Set version_number for existing contents
UPDATE contents
SET version_number = 1
WHERE version_number IS NULL;

-- 7. Add comments
COMMENT ON TABLE content_versions IS 'Version history of contents - stores all versions of content';
COMMENT ON COLUMN content_versions.content_id IS 'Groups all versions of the same content together';
COMMENT ON COLUMN content_versions.version_number IS 'Version number (1, 2, 3, ...)';
COMMENT ON COLUMN content_versions.pack_id IS 'The pack that created this version';

