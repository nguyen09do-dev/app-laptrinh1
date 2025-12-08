# RAG System - Quick Reference

## 🚀 SETUP (3 Steps)

```bash
# 1. Install dependencies
cd backend && npm install

# 2. Run migration
npm run build && node dist/migrations/run-rag-migration.js

# 3. Start server
npm run dev
```

Server: `http://localhost:3001`

---

## 📚 API ENDPOINTS CHEAT SHEET

### Upload Document
```bash
# Text
POST /api/rag/ingest
{
  "title": "Doc Title",
  "content": "Full text...",
  "author": "Author Name",
  "tags": ["tag1", "tag2"]
}

# File
POST /api/rag/ingest/file
Form data: file, title, author, tags
```

### Search
```bash
GET /api/rag/search?query=your+query&search_type=chunks&match_count=10
```

### Manage Documents
```bash
GET /api/rag/documents                    # List all
GET /api/rag/documents/:docId             # Get one
GET /api/rag/documents/:docId/versions    # Version history
DELETE /api/rag/documents/:docId          # Soft delete
```

### Analytics
```bash
GET /api/rag/analytics/popular                  # Most cited
GET /api/rag/analytics/document/:docId         # Usage stats
GET /api/rag/stats                              # System stats
```

---

## 💻 CODE EXAMPLES

### Generate Brief with RAG
```typescript
import { briefsRAGService } from './services/briefs-rag.service';

const result = await briefsRAGService.generateBriefWithRAG({
  ideaId: 123,
  useRAG: true,
  searchFilters: {
    tags: ['marketing'],
    match_threshold: 0.75,
    match_count: 5
  }
});
```

### Generate Content with RAG
```typescript
import { contentsRAGService } from './services/contents-rag.service';

const result = await contentsRAGService.generateContentWithRAG({
  briefId: 456,
  wordCount: 1500,
  style: 'professional',
  useRAG: true
});
```

### Search Documents
```typescript
import { ragService } from './services/rag.service';

// Chunk search (recommended)
const results = await ragService.searchChunks('AI applications', {
  match_threshold: 0.7,
  match_count: 10,
  tags: ['research']
});

// Hybrid search (full-text + semantic)
const hybridResults = await ragService.hybridSearch('machine learning', {
  fullTextWeight: 0.3,
  semanticWeight: 0.7
});
```

### Validate Citations
```typescript
import { ragService } from './services/rag.service';

const validation = await ragService.validateCitations([
  'doc-uuid-1',
  'doc-uuid-2'
]);

if (!validation.valid) {
  console.log('Missing:', validation.missing);
}
```

---

## 🗄️ DATABASE QUICK REF

### Tables
- `documents` - Full docs + metadata + embeddings
- `document_chunks` - Chunked text + embeddings
- `document_versions` - Version history
- `citations` - Usage tracking

### Key Functions
```sql
-- Search documents
SELECT * FROM search_documents(
  embedding::vector,
  0.7,  -- threshold
  5     -- limit
);

-- Search chunks
SELECT * FROM search_document_chunks(
  embedding::vector,
  0.7,
  10
);

-- Validate citations
SELECT * FROM validate_citation_doc_ids(
  ARRAY['uuid1','uuid2']::uuid[]
);
```

---

## 🔧 CONFIGURATION

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-xxx              # For embeddings
GEMINI_API_KEY=xxx                 # For LLM generation

# Optional
DEFAULT_EMBEDDING_PROVIDER=openai  # or 'gemini'
DATABASE_URL=postgresql://...
```

### Chunking Config (in code)
```typescript
await documentsService.ingestDocument(content, metadata, {
  chunkSize: 800,        // ~800 tokens
  chunkOverlap: 50,      // ~50 tokens overlap
  createVersion: true    // Enable versioning
});
```

### Search Config
```typescript
const filters = {
  match_threshold: 0.7,   // Similarity threshold (0-1)
  match_count: 10,        // Max results
  author: 'John Doe',     // Filter by author
  tags: ['AI', 'ML']      // Filter by tags
};
```

---

## 🐛 COMMON ERRORS

### "extension vector does not exist"
```bash
# Install pgvector
sudo apt-get install postgresql-12-pgvector
# Then re-run migration
```

### "Quota exceeded"
```bash
# Switch provider in .env
DEFAULT_EMBEDDING_PROVIDER=openai
```

### "Payload Too Large"
```typescript
// Increase limit in index.ts
fastify.register(multipart, {
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
```

---

## 📊 PERFORMANCE TIPS

### Optimize Search Speed
```sql
-- Rebuild index with better parameters
CREATE INDEX idx_chunks_embedding ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 32, ef_construction = 128);
```

### Batch Operations
```typescript
// Batch embeddings (faster)
const embeddings = await embeddingService.generateEmbeddingsBatch(texts);

// vs single (slower)
for (const text of texts) {
  await embeddingService.generateEmbedding(text);
}
```

### Caching
- Cache frequent queries at application level
- Use Redis for search result caching
- Cache embeddings for reused texts

---

## 📁 FILE STRUCTURE

```
backend/
├── migrations/
│   ├── 004_setup_rag_system.sql      # DB schema
│   └── run-rag-migration.ts          # Migration runner
├── src/
│   ├── controllers/
│   │   └── rag.controller.ts         # RAG endpoints
│   ├── routes/
│   │   └── rag.routes.ts             # Route registration
│   ├── services/
│   │   ├── embedding.service.ts      # Vector embeddings
│   │   ├── documents.service.ts      # Document management
│   │   ├── rag.service.ts            # Search & retrieval
│   │   ├── briefs-rag.service.ts     # RAG briefs
│   │   └── contents-rag.service.ts   # RAG contents
│   ├── middleware/
│   │   └── citationValidator.ts      # Citation validation
│   └── index.ts                      # Main app (updated)
├── RAG_IMPLEMENTATION.md             # Full guide
├── RAG_CHANGES_SUMMARY.md            # What changed
└── RAG_QUICK_REFERENCE.md            # This file
```

---

## 🎯 WORKFLOW DIAGRAM

```
┌──────────────┐
│ Upload Doc   │
└──────┬───────┘
       │
       ├─→ Extract Text (PDF/DOCX/HTML)
       ├─→ Chunk Text (~800 tokens)
       ├─→ Generate Embeddings (batch)
       └─→ Store in DB (documents + chunks)

┌──────────────┐
│Generate Brief│
└──────┬───────┘
       │
       ├─→ Search Knowledge Base (RAG)
       ├─→ Build Context with [1][2][3]
       ├─→ LLM Generation
       ├─→ Extract Citations
       └─→ Store Brief + Citations

┌──────────────┐
│Generate Content│
└──────┬─────────┘
       │
       ├─→ Search Knowledge Base
       ├─→ Build Context (8 chunks)
       ├─→ LLM with Citation Requirements
       ├─→ Add References Section
       └─→ Store Content + Citations
```

---

## ✅ TESTING CHECKLIST

```bash
# 1. Test document ingestion
curl -X POST http://localhost:3001/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'

# 2. Test search
curl "http://localhost:3001/api/rag/search?query=test&search_type=chunks"

# 3. Test file upload
curl -X POST http://localhost:3001/api/rag/ingest/file \
  -F "file=@test.pdf"

# 4. Test analytics
curl http://localhost:3001/api/rag/stats

# 5. Test brief generation (with RAG)
# Use briefsRAGService.generateBriefWithRAG() in code

# 6. Test content generation (with RAG)
# Use contentsRAGService.generateContentWithRAG() in code
```

---

## 🔗 LINKS

- **Full Docs:** `RAG_IMPLEMENTATION.md`
- **Changes:** `RAG_CHANGES_SUMMARY.md`
- **pgvector:** https://github.com/pgvector/pgvector
- **OpenAI Embeddings:** https://platform.openai.com/docs/guides/embeddings

---

**Version:** 1.0.0
**Last Updated:** 2025-12-07
