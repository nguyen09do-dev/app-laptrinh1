-- Migration: Create briefs table
-- Briefs are detailed content briefs generated from approved ideas

CREATE TABLE IF NOT EXISTS briefs (
  id SERIAL PRIMARY KEY,
  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,

  -- Brief content
  title VARCHAR(500) NOT NULL,
  objective TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  key_messages TEXT[] NOT NULL,
  tone_style VARCHAR(200),
  content_structure JSONB,
  seo_keywords TEXT[],

  -- Metadata
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(idea_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_briefs_idea_id ON briefs(idea_id);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON briefs(status);

COMMENT ON TABLE briefs IS 'Content briefs generated from approved ideas';
COMMENT ON COLUMN briefs.idea_id IS 'Reference to the original idea';
COMMENT ON COLUMN briefs.content_structure IS 'JSON structure with sections, word count, etc.';
