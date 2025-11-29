-- Tạo bảng ideas
CREATE TABLE IF NOT EXISTS ideas (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    persona TEXT NOT NULL,
    industry TEXT NOT NULL,
    status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'shortlisted', 'approved', 'archived')),
    rationale TEXT,
    batch_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tạo index cho batch_id để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_ideas_batch_id ON ideas(batch_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

-- Tạo bảng briefs
CREATE TABLE IF NOT EXISTS briefs (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    key_messages TEXT,
    tone TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_briefs_idea_id ON briefs(idea_id);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON briefs(status);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);

-- Tạo bảng contents
CREATE TABLE IF NOT EXISTS contents (
    id SERIAL PRIMARY KEY,
    brief_id INTEGER REFERENCES briefs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contents_brief_id ON contents(brief_id);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);

-- Tạo bảng system_settings
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);


