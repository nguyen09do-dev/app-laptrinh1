-- Migration 004: Setup RAG System with pgvector
-- Knowledge-Enhanced Writer with document embeddings and versioning

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create documents table with metadata
CREATE TABLE IF NOT EXISTS documents (
    doc_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    author TEXT,
    published_date TIMESTAMPTZ,
    tags TEXT[],
    version_number INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create document_versions table for versioning
CREATE TABLE IF NOT EXISTS document_versions (
    version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    content TEXT NOT NULL,
    embedding vector(1536),
    author TEXT,
    published_date TIMESTAMPTZ,
    tags TEXT[],
    metadata JSONB, -- snapshot of all metadata at this version
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(doc_id, version_number)
);

-- 4. Create document_chunks table for better retrieval
CREATE TABLE IF NOT EXISTS document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    token_count INTEGER,
    metadata JSONB, -- stores chunk-specific metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(doc_id, chunk_index)
);

-- 5. Create citations table to track document usage
CREATE TABLE IF NOT EXISTS citations (
    citation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id INTEGER REFERENCES briefs(id) ON DELETE CASCADE,
    content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
    doc_id UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES document_chunks(chunk_id) ON DELETE SET NULL,
    citation_index INTEGER, -- [1], [2], [3] in the content
    snippet TEXT, -- the actual text cited
    relevance_score FLOAT, -- similarity score from RAG
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (brief_id IS NOT NULL OR content_id IS NOT NULL)
);

-- 6. Create indexes for performance

-- Vector similarity search indexes (HNSW for better performance)
CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw
    ON documents USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw
    ON document_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Metadata filter indexes
CREATE INDEX IF NOT EXISTS idx_documents_author ON documents(author);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_is_active ON documents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_documents_published_date ON documents(published_date DESC);

-- Document chunks indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_id ON document_chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON document_chunks(doc_id, chunk_index);

-- Citations indexes
CREATE INDEX IF NOT EXISTS idx_citations_doc_id ON citations(doc_id);
CREATE INDEX IF NOT EXISTS idx_citations_brief_id ON citations(brief_id);
CREATE INDEX IF NOT EXISTS idx_citations_content_id ON citations(content_id);

-- Version indexes
CREATE INDEX IF NOT EXISTS idx_document_versions_doc_id ON document_versions(doc_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at DESC);

-- 7. Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for documents updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Create function for cosine similarity search with metadata filters
CREATE OR REPLACE FUNCTION search_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    filter_author text DEFAULT NULL,
    filter_tags text[] DEFAULT NULL
)
RETURNS TABLE (
    doc_id UUID,
    title TEXT,
    content TEXT,
    url TEXT,
    author TEXT,
    tags TEXT[],
    similarity float,
    published_date TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.doc_id,
        d.title,
        d.content,
        d.url,
        d.author,
        d.tags,
        1 - (d.embedding <=> query_embedding) as similarity,
        d.published_date
    FROM documents d
    WHERE
        d.is_active = true
        AND (1 - (d.embedding <=> query_embedding)) > match_threshold
        AND (filter_author IS NULL OR d.author = filter_author)
        AND (filter_tags IS NULL OR d.tags && filter_tags)
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 10. Create function for chunk-based similarity search
CREATE OR REPLACE FUNCTION search_document_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_author text DEFAULT NULL,
    filter_tags text[] DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    doc_id UUID,
    title TEXT,
    chunk_text TEXT,
    chunk_index INTEGER,
    url TEXT,
    author TEXT,
    tags TEXT[],
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.chunk_id,
        dc.doc_id,
        d.title,
        dc.chunk_text,
        dc.chunk_index,
        d.url,
        d.author,
        d.tags,
        1 - (dc.embedding <=> query_embedding) as similarity
    FROM document_chunks dc
    JOIN documents d ON dc.doc_id = d.doc_id
    WHERE
        d.is_active = true
        AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
        AND (filter_author IS NULL OR d.author = filter_author)
        AND (filter_tags IS NULL OR d.tags && filter_tags)
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 11. Create function to validate citations
CREATE OR REPLACE FUNCTION validate_citation_doc_ids(doc_ids UUID[])
RETURNS TABLE (
    doc_id UUID,
    doc_exists BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        unnest(doc_ids) as doc_id,
        unnest(doc_ids) IN (SELECT d.doc_id FROM documents d WHERE d.is_active = true) as doc_exists;
END;
$$;

-- 12. Add comments for documentation
COMMENT ON TABLE documents IS 'Main document storage with embeddings for RAG';
COMMENT ON TABLE document_chunks IS 'Chunked documents for more granular retrieval';
COMMENT ON TABLE document_versions IS 'Version history of documents';
COMMENT ON TABLE citations IS 'Tracks which documents are cited in briefs/contents';
COMMENT ON COLUMN documents.embedding IS 'Vector embedding from OpenAI text-embedding-3-small (1536 dimensions)';
COMMENT ON COLUMN documents.is_active IS 'Soft delete flag - false means document is archived';
COMMENT ON FUNCTION search_documents IS 'Semantic search across documents with optional metadata filters';
COMMENT ON FUNCTION search_document_chunks IS 'Semantic search across document chunks with optional metadata filters';
