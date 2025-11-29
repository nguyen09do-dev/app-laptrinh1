-- Migration: Add brief, flowmap, and approved status
-- Run this to update existing database schema

-- Add brief column (TEXT for content brief)
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS brief TEXT;

-- Add flowmap column (JSONB for storing flowmap data)
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS flowmap JSONB;

-- Update status check constraint to include 'approved'
ALTER TABLE ideas DROP CONSTRAINT IF EXISTS ideas_status_check;
ALTER TABLE ideas ADD CONSTRAINT ideas_status_check
  CHECK (status IN ('draft', 'selected', 'archived', 'approved'));

-- Add approved_at timestamp
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_approved_at ON ideas(approved_at);

-- Comment
COMMENT ON COLUMN ideas.brief IS 'AI-generated content brief';
COMMENT ON COLUMN ideas.flowmap IS 'AI-generated flowmap with nodes, edges, and feasibility';
COMMENT ON COLUMN ideas.approved_at IS 'Timestamp when idea was approved';
