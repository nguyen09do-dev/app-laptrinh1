-- Initial Schema Setup
-- Creates all base tables for the AI Content Platform

-- Enable pgvector extension for RAG
-- NOTE: Commented out for Railway free tier - pgvector not available
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  persona TEXT,
  industry VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  persona VARCHAR(255),
  industry VARCHAR(255),
  status VARCHAR(50) DEFAULT 'generated',
  batch_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Briefs table
CREATE TABLE IF NOT EXISTS briefs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  idea_id INTEGER REFERENCES ideas(id),
  title TEXT NOT NULL,
  topic TEXT,
  target_audience TEXT,
  tone VARCHAR(100),
  word_count INTEGER,
  content_structure JSONB,
  key_messages TEXT[],
  seo_keywords TEXT[],
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contents table
CREATE TABLE IF NOT EXISTS contents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  brief_id INTEGER REFERENCES briefs(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content Packs table
CREATE TABLE IF NOT EXISTS content_packs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Derivatives table
CREATE TABLE IF NOT EXISTS derivatives (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents table (for RAG)
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Chunks table (for RAG with embeddings)
CREATE TABLE IF NOT EXISTS document_chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding TEXT, -- Changed from vector(1536) to TEXT for Railway compatibility
  chunk_index INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Versions table
CREATE TABLE IF NOT EXISTS content_versions (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Integration Credentials table
CREATE TABLE IF NOT EXISTS integration_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  platform VARCHAR(100) NOT NULL,
  credentials JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_batch_id ON ideas(batch_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_idea_id ON briefs(idea_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contents_user_id ON contents(user_id);
CREATE INDEX IF NOT EXISTS idx_contents_brief_id ON contents(brief_id);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_derivatives_content_id ON derivatives(content_id);
CREATE INDEX IF NOT EXISTS idx_derivatives_type ON derivatives(type);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);

-- Vector similarity search index
-- NOTE: Commented out for Railway free tier - requires pgvector extension
-- CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
-- ON document_chunks USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_integration_credentials_user_id ON integration_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_credentials_platform ON integration_credentials(platform);

