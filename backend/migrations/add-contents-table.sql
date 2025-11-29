-- Migration: Create contents table
-- Contents are actual written content generated from briefs

CREATE TABLE IF NOT EXISTS contents (
  id SERIAL PRIMARY KEY,
  brief_id INTEGER NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,

  -- Content data
  title VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  format VARCHAR(50) DEFAULT 'markdown', -- markdown, html, plain
  word_count INTEGER NOT NULL,

  -- Metadata
  status VARCHAR(50) DEFAULT 'draft', -- draft, review, published
  author VARCHAR(200),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(brief_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contents_brief_id ON contents(brief_id);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at);

COMMENT ON TABLE contents IS 'Actual written content from briefs';
COMMENT ON COLUMN contents.body IS 'Full content text';
COMMENT ON COLUMN contents.word_count IS 'Calculated word count';
