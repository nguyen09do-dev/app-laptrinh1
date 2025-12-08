# RAG System Implementation Guide

## Knowledge-Enhanced Writer với Retrieval Augmented Generation (RAG)

Hệ thống RAG đầy đủ cho phép backend tạo nội dung dựa trên knowledge base thực tế với citations.

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc](#kiến-trúc)
3. [Cài đặt](#cài-đặt)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Workflow](#workflow)
7. [Usage Examples](#usage-examples)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 TỔNG QUAN HỆ THỐNG

### Mục tiêu
- **Upload documents** → Chunk + Embedding (pgvector)
- **Generate brief** → Query RAG context trước khi gọi LLM
- **Generate draft** → Include citations từ documents
- **Validate citations** → Đảm bảo doc_id tồn tại và active
- **Document versioning** → Track changes theo thời gian

### Tech Stack
- **Vector Database**: PostgreSQL + pgvector extension
- **Embedding Model**: OpenAI text-embedding-3-small (1536 dimensions)
- **LLM**: Gemini 1.5/2.0 Flash/Pro, OpenAI GPT-4
- **Backend**: Fastify + TypeScript
- **Chunking**: Recursive character splitter (~800 tokens/chunk, ~50 tokens overlap)

---

## 🏗️ KIẾN TRÚC

### Layer Structure

```
┌─────────────────────────────────────────────────┐
│             API Layer (Controllers)             │
│  - RAGController                                │
│  - BriefsRAGService                             │
│  - ContentsRAGService                           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Business Logic (Services)              │
│  - DocumentsService (ingest, chunk, extract)    │
│  - EmbeddingService (OpenAI/Gemini embeddings)  │
│  - RAGService (search, context building)        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│        Database Layer (PostgreSQL)              │
│  - documents (full doc + metadata)              │
│  - document_chunks (chunked text + embeddings)  │
│  - document_versions (version history)          │
│  - citations (usage tracking)                   │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
1. DOCUMENT INGESTION
   Upload File/Text → Extract Text → Chunk → Generate Embeddings → Store in DB

2. RAG-ENHANCED GENERATION
   User Request → Build Query → Similarity Search → Retrieve Context
   → Format with Citations → LLM Generation → Extract Citations → Store

3. CITATION VALIDATION
   Extract doc_ids → Check Existence → Return Validation Result
```

---

## 🚀 CÀI ĐẶT

### 1. Prerequisites

```bash
# PostgreSQL 12+ với pgvector extension
sudo apt-get install postgresql-12-pgvector

# Node.js 18+
node --version
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

Đã cài đặt:
- `pgvector` (^0.2.0) - pgvector client for Node.js
- `@fastify/multipart` (^8.0.0) - File upload support
- `pdf-parse` (^1.1.1) - PDF text extraction
- `mammoth` (^1.6.0) - DOCX text extraction
- `cheerio` (^1.0.0-rc.12) - HTML parsing

### 3. Configure Environment Variables

Cập nhật `.env`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/ai_ideas_db

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-xxx

# Gemini (for LLM generation)
GEMINI_API_KEY=xxx

# Embedding provider (openai or gemini)
DEFAULT_EMBEDDING_PROVIDER=openai
```

### 4. Run Migration

```bash
# Compile TypeScript
npm run build

# Run RAG migration
node dist/migrations/run-rag-migration.js
```

Expected output:
```
🚀 Starting RAG system migration...
✅ Migration completed successfully!
✅ pgvector extension: 0.5.1
✅ Table 'documents' created
✅ Table 'document_chunks' created
✅ Table 'document_versions' created
✅ Table 'citations' created
✅ Function 'search_documents' created
✅ Function 'search_document_chunks' created
✅ Vector indexes created: 2
🎉 RAG system is ready to use!
```

### 5. Start Server

```bash
npm run dev
```

Server chạy tại `http://localhost:3001`

---

## 💾 DATABASE SCHEMA

### Tables

#### 1. `documents`
Lưu trữ documents với metadata và full-text embedding

```sql
CREATE TABLE documents (
    doc_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI text-embedding-3-small
    author TEXT,
    published_date TIMESTAMPTZ,
    tags TEXT[],
    version_number INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,  -- Soft delete
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_documents_embedding_hnsw ON documents
    USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_documents_author ON documents(author);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
```

#### 2. `document_chunks`
Chunked text với embeddings riêng (tốt hơn cho retrieval)

```sql
CREATE TABLE document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    token_count INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(doc_id, chunk_index)
);

-- Indexes
CREATE INDEX idx_document_chunks_embedding_hnsw ON document_chunks
    USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_document_chunks_doc_id ON document_chunks(doc_id);
```

#### 3. `document_versions`
Version history của documents

```sql
CREATE TABLE document_versions (
    version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,  -- Snapshot of metadata at this version
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(doc_id, version_number)
);
```

#### 4. `citations`
Track document usage trong briefs/contents

```sql
CREATE TABLE citations (
    citation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id INTEGER REFERENCES briefs(id) ON DELETE CASCADE,
    content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
    doc_id UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES document_chunks(chunk_id) ON DELETE SET NULL,
    citation_index INTEGER,  -- [1], [2], [3] position
    snippet TEXT,
    relevance_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (brief_id IS NOT NULL OR content_id IS NOT NULL)
);
```

### Functions

#### `search_documents()`
Full document semantic search với metadata filters

```sql
SELECT * FROM search_documents(
    query_embedding::vector,
    match_threshold::float DEFAULT 0.7,
    match_count::int DEFAULT 5,
    filter_author::text DEFAULT NULL,
    filter_tags::text[] DEFAULT NULL
);
```

#### `search_document_chunks()`
Chunk-based search (more granular)

```sql
SELECT * FROM search_document_chunks(
    query_embedding::vector,
    match_threshold::float DEFAULT 0.7,
    match_count::int DEFAULT 10,
    filter_author::text DEFAULT NULL,
    filter_tags::text[] DEFAULT NULL
);
```

#### `validate_citation_doc_ids()`
Validate citations exist

```sql
SELECT * FROM validate_citation_doc_ids(doc_ids::uuid[]);
```

---

## 🌐 API ENDPOINTS

### Document Management

#### POST `/api/rag/ingest`
Ingest document from text

**Request:**
```json
{
  "title": "AI in Healthcare 2024",
  "content": "Full text of the document...",
  "url": "https://example.com/doc",
  "author": "John Doe",
  "published_date": "2024-01-15",
  "tags": ["AI", "healthcare", "research"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document ingested successfully",
  "data": {
    "doc_id": "uuid",
    "title": "AI in Healthcare 2024",
    "chunks_created": 12,
    "version_number": 1
  }
}
```

#### POST `/api/rag/ingest/file`
Upload file (PDF, DOCX, TXT, HTML)

**Request:** multipart/form-data
- `file`: File upload
- `title`: (optional) Document title
- `author`: (optional)
- `tags`: (optional) JSON array
- `url`: (optional)

**Response:**
```json
{
  "success": true,
  "message": "File ingested successfully",
  "data": {
    "doc_id": "uuid",
    "title": "document.pdf",
    "chunks_created": 15,
    "version_number": 1,
    "filename": "document.pdf",
    "mimetype": "application/pdf",
    "size": 245678
  }
}
```

#### GET `/api/rag/search`
Semantic search

**Query params:**
- `query` (required): Search query
- `author` (optional): Filter by author
- `tags` (optional): Comma-separated tags
- `match_threshold` (default: 0.7): Min similarity
- `match_count` (default: 10): Max results
- `search_type` (default: chunks): `documents` | `chunks` | `hybrid`

**Response:**
```json
{
  "success": true,
  "query": "AI applications",
  "search_type": "chunks",
  "results": [
    {
      "chunk_id": "uuid",
      "doc_id": "uuid",
      "title": "AI in Healthcare 2024",
      "content": "Chunk text...",
      "chunk_index": 3,
      "url": "https://example.com/doc",
      "author": "John Doe",
      "tags": ["AI", "healthcare"],
      "similarity": 0.89
    }
  ],
  "count": 8
}
```

#### GET `/api/rag/documents`
List all documents

**Query params:**
- `author`, `tags`, `limit` (50), `offset` (0)

#### GET `/api/rag/documents/:docId`
Get document by ID

#### GET `/api/rag/documents/:docId/versions`
Get version history

#### DELETE `/api/rag/documents/:docId`
Soft delete document (sets `is_active = false`)

### Analytics

#### GET `/api/rag/analytics/popular`
Most cited documents

#### GET `/api/rag/analytics/document/:docId`
Document usage stats

#### GET `/api/rag/stats`
Overall RAG system statistics

---

## 🔄 WORKFLOW

### 1. Document Ingestion Flow

```typescript
// Upload document
const response = await fetch('http://localhost:3001/api/rag/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Document',
    content: 'Full document text here...',
    author: 'John Doe',
    tags: ['research', 'AI']
  })
});

// Backend workflow:
// 1. DocumentsService.ingestDocument()
//    - Check if document exists (by title + URL)
//    - If exists: create new version
//    - Generate full document embedding (OpenAI)
//
// 2. Chunk text
//    - Split into ~800 token chunks with ~50 token overlap
//    - Use paragraph/sentence boundaries when possible
//
// 3. Generate chunk embeddings (batch)
//    - EmbeddingService.generateEmbeddingsBatch()
//    - Use OpenAI text-embedding-3-small
//
// 4. Store in database
//    - Insert into documents table
//    - Insert chunks into document_chunks table
//    - Create version record if applicable
```

### 2. RAG-Enhanced Brief Generation

```typescript
// Generate brief with RAG
import { briefsRAGService } from './services/briefs-rag.service';

const result = await briefsRAGService.generateBriefWithRAG({
  ideaId: 123,
  useRAG: true,
  searchFilters: {
    tags: ['marketing', 'content'],
    match_threshold: 0.75,
    match_count: 5
  },
  llmOptions: {
    model: 'gemini-2.5-flash',
    temperature: 0.7
  }
});

// Workflow:
// 1. Get idea from database
// 2. Build search query from idea (title + description + industry + persona)
// 3. RAGService.buildContext()
//    - Generate query embedding
//    - search_document_chunks() with filters
//    - Format results with [1], [2], [3] citations
// 4. Build enhanced prompt with context
// 5. LLM generation with citations
// 6. Store brief + citations in database
```

### 3. RAG-Enhanced Content Generation

```typescript
// Generate content with RAG
import { contentsRAGService } from './services/contents-rag.service';

const result = await contentsRAGService.generateContentWithRAG({
  briefId: 456,
  wordCount: 1000,
  style: 'professional',
  useRAG: true,
  searchFilters: {
    author: 'Industry Expert',
    match_count: 8
  }
});

// Workflow:
// 1. Get brief from database
// 2. Build search query (title + objective + target_audience)
// 3. RAGService.buildContext() - get 8 chunks
// 4. Build prompt với citations requirements
// 5. LLM generates content with [1], [2], [3] references
// 6. Extract citations from generated text
// 7. Store content + citations + references section
```

### 4. Citation Validation

```typescript
// Automatic validation via middleware
import { validateCitations } from './middleware/citationValidator';

// In route:
fastify.post('/api/briefs/generate', {
  preHandler: validateCitations
}, handler);

// Workflow:
// 1. Extract doc_ids from request body
// 2. validate_citation_doc_ids() SQL function
// 3. Return 404 if any doc missing
// 4. Continue to handler if all valid
```

---

## 📚 USAGE EXAMPLES

### Example 1: Upload PDF Document

```bash
curl -X POST http://localhost:3001/api/rag/ingest/file \
  -F "file=@research-paper.pdf" \
  -F "title=AI Research 2024" \
  -F "author=Research Lab" \
  -F 'tags=["AI","research","2024"]'
```

### Example 2: Semantic Search

```bash
curl "http://localhost:3001/api/rag/search?query=machine%20learning%20applications&search_type=chunks&match_count=5"
```

### Example 3: Generate Brief with RAG

```javascript
// In controller
const brief = await briefsRAGService.generateBriefWithRAG({
  ideaId: 42,
  useRAG: true,
  searchFilters: {
    tags: ['marketing'],
    match_threshold: 0.7,
    match_count: 5
  }
});

// Brief will include citations like:
// "According to recent research, AI is transforming content creation [1][2]."
//
// With sources:
// [1] AI in Marketing 2024 - https://example.com/ai-marketing
// [2] Content Strategy Guide - https://example.com/strategy
```

### Example 4: Generate Content with RAG

```javascript
const content = await contentsRAGService.generateContentWithRAG({
  briefId: 123,
  wordCount: 1500,
  style: 'professional',
  useRAG: true
});

// Content includes:
// - Main body with [1], [2], [3] inline citations
// - References section at the end
// - Stored citations in database for analytics
```

### Example 5: Check Document Analytics

```bash
curl http://localhost:3001/api/rag/analytics/document/{doc_id}
```

Response:
```json
{
  "success": true,
  "doc_id": "uuid",
  "analytics": {
    "used_in_briefs": 5,
    "used_in_contents": 12,
    "total_citations": 23,
    "avg_relevance_score": 0.85,
    "last_used": "2024-01-20T10:30:00Z"
  }
}
```

---

## 🎯 ADVANCED FEATURES

### 1. Document Versioning

```typescript
// When ingesting same document (title + URL):
// - Current version archived to document_versions
// - New version created with version_number++
// - Old chunks deleted
// - New chunks created

// Get version history
const versions = await documentsService.getDocumentVersions(docId);
// Returns: [v3, v2, v1] với metadata snapshots
```

### 2. Hybrid Search

Combines full-text search + vector similarity:

```typescript
const results = await ragService.hybridSearch(query, {
  fullTextWeight: 0.3,    // 30% from PostgreSQL full-text search
  semanticWeight: 0.7,    // 70% from vector similarity
  match_count: 10
});

// Best for queries that need both keyword matching and semantic understanding
```

### 3. Metadata Filtering

```typescript
// Search with complex filters
const results = await ragService.searchChunks(query, {
  author: 'John Doe',
  tags: ['research', 'AI'],
  match_threshold: 0.8,
  match_count: 10
});

// SQL: Combines vector search với WHERE clauses
// Ultra-fast với GIN indexes on tags[]
```

### 4. Chunking Strategy

```typescript
// Intelligent chunking:
// 1. Split by paragraphs first (semantic boundaries)
// 2. If paragraph > chunk_size, split by sentences
// 3. If sentence > chunk_size, split by words
// 4. Add overlap between chunks for context
// 5. Track token count per chunk

// Configurable:
chunkSize: 800,      // ~800 tokens
chunkOverlap: 50     // ~50 tokens overlap
```

### 5. Multi-Provider Embeddings

```typescript
// OpenAI (default)
const embedding = await embeddingService.generateEmbedding(text, {
  provider: 'openai'  // text-embedding-3-small, 1536D
});

// Gemini (fallback)
const embedding = await embeddingService.generateEmbedding(text, {
  provider: 'gemini'  // text-embedding-004, 768D → padded to 1536D
});

// Automatic fallback nếu quota hết
```

---

## 🐛 TROUBLESHOOTING

### Problem 1: pgvector extension not found

```
ERROR: extension "vector" does not exist
```

**Solution:**
```bash
# Install pgvector
sudo apt-get install postgresql-12-pgvector

# Or compile from source
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Then run migration again
```

### Problem 2: Embedding API quota exceeded

```
Gemini API đã hết quota miễn phí
```

**Solution:**
- Set `DEFAULT_EMBEDDING_PROVIDER=openai` in `.env`
- Or upgrade Gemini API key
- Embeddings tự động fallback sang provider khác

### Problem 3: File upload fails

```
Payload Too Large
```

**Solution:**
```typescript
// Increase file size limit in index.ts
fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});
```

### Problem 4: Slow vector search

```
Query takes > 5 seconds
```

**Solution:**
```sql
-- Rebuild HNSW index with better parameters
DROP INDEX idx_document_chunks_embedding_hnsw;

CREATE INDEX idx_document_chunks_embedding_hnsw
    ON document_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 32, ef_construction = 128);  -- Higher = slower build, faster search

-- Or use IVFFlat for very large datasets (>1M vectors)
CREATE INDEX idx_document_chunks_embedding_ivfflat
    ON document_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

### Problem 5: Citations not appearing

**Debug:**
```typescript
// Check if RAG context was found
console.log('RAG sources:', ragContext.sources.length);

// Check if LLM included citations
console.log('Generated text:', generatedText);
console.log('Contains [1]:', generatedText.includes('[1]'));

// Check extraction
const citations = extractCitationsFromContent(generatedText, sources);
console.log('Extracted citations:', citations);
```

---

## 📊 PERFORMANCE METRICS

### Expected Performance

- **Document ingestion**: ~2-5s for 10-page PDF
- **Chunk generation**: ~100 chunks/second
- **Batch embedding**: ~20 chunks/second (OpenAI API limit)
- **Vector search**: ~10-50ms for 10K vectors (HNSW index)
- **RAG-enhanced generation**: ~5-15s (includes search + LLM)

### Scaling Recommendations

- **< 10K documents**: Default HNSW index works great
- **10K - 100K documents**: Increase `m` parameter in HNSW
- **> 100K documents**: Consider IVFFlat index + query optimization
- **> 1M documents**: Implement caching layer + specialized vector DB

---

## 🎉 CHECKLIST HOÀN THÀNH

✅ Schema `documents` hoàn chỉnh với metadata và pgvector
✅ Ingest endpoint chạy đầy đủ chunk + embedding
✅ Similarity search hoạt động với metadata filters
✅ Brief generation dùng RAG context + citations
✅ Content generation với RAG + references section
✅ Citation validator middleware
✅ Document versioning system
✅ Hybrid search (full-text + semantic)
✅ Multi-provider embedding support
✅ File upload support (PDF, DOCX, HTML, TXT)
✅ Analytics endpoints
✅ Migration scripts
✅ Code compile successfully

---

## 📖 FURTHER READING

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [HNSW Algorithm Paper](https://arxiv.org/abs/1603.09320)
- [RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

**Created by:** Senior Backend Engineer
**Last updated:** 2025-12-07
**Version:** 1.0.0
