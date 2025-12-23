-- Add brief_id column to content_packs table
-- This column was missing from the initial schema

ALTER TABLE content_packs 
ADD COLUMN IF NOT EXISTS brief_id INTEGER REFERENCES briefs(id);
