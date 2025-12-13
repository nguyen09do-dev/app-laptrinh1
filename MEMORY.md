# AI CONTENT STUDIO - PROJECT MEMORY

> **Last Updated:** 2025-12-13
> **Version:** 1.0
> **Purpose:** Comprehensive project overview and technical reference

---

## 📋 PROJECT SUMMARY

**AI Content Studio** is a full-stack AI-powered content generation and publishing platform that helps users create, manage, and distribute content across multiple platforms using AI (OpenAI GPT & Google Gemini).

**Complete Workflow:** Idea Generation → Brief Creation → Content Drafting → Multi-Platform Derivatives → Publishing → Analytics

---

## 🏗️ ARCHITECTURE OVERVIEW

### Tech Stack

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Fastify 4.x (high-performance)
- **Language:** TypeScript
- **Database:** PostgreSQL 15 + pgvector extension
- **AI Providers:**
  - OpenAI (GPT-4o-mini, text-embedding-3-small)
  - Google Gemini (1.5 Flash, text-embedding-004)

**Frontend:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript + React 18
- **Styling:** Tailwind CSS 3.x
- **Data Fetching:** SWR (stale-while-revalidate)
- **Animations:** Framer Motion
- **Charts:** Recharts

**Infrastructure:**
- Docker Compose for PostgreSQL
- Ports: Frontend (3000), Backend (3001), PostgreSQL (5432)

---

## 📂 PROJECT STRUCTURE

```
G:/Code01-HWAIcontentmulti/
├── backend/                    # Fastify + TypeScript API
│   ├── src/
│   │   ├── index.ts           # Main server entry
│   │   ├── lib/               # Core utilities
│   │   │   ├── db.ts          # PostgreSQL pool
│   │   │   └── llmClient.ts   # Unified AI client
│   │   ├── routes/            # API routes (9 files)
│   │   ├── controllers/       # Request handlers (7 files)
│   │   ├── services/          # Business logic (14 files)
│   │   └── schema/            # AJV validation
│   └── migrations/            # Database migrations (9 files)
│
├── frontend/                   # Next.js 14 frontend
│   └── app/
│       ├── components/        # Reusable UI (20+ components)
│       ├── contexts/          # React contexts
│       ├── hooks/             # Custom hooks (useApi)
│       ├── dashboard/         # Dashboard page
│       ├── ideas/             # Ideas management
│       ├── briefs/            # Briefs management
│       ├── studio/            # Content Studio (drafting)
│       ├── library/           # Content library
│       ├── publisher/         # Multi-platform publisher
│       ├── documents/         # RAG knowledge base
│       ├── analytics/         # Analytics dashboard
│       └── settings/          # Settings page
│
└── docker-compose.yml         # PostgreSQL + pgvector
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

**1. ideas** - AI-generated content ideas
```sql
- id, title, description
- persona, industry
- status: 'generated' | 'shortlisted' | 'approved' | 'archived'
- rationale, implementation (jsonb)
- batch_id, created_at
```

**2. briefs** - Content briefs/plans
```sql
- id, idea_id (FK)
- title, objective, target_audience
- key_messages (jsonb array)
- tone_style, content_structure (jsonb)
- seo_keywords (jsonb array)
- status: 'draft' | 'approved'
- flowmap_approved (boolean)
```

**3. content_packs** - Main content drafts + derivatives
```sql
- pack_id (uuid), brief_id (FK)
- draft_content (text), word_count
- status: 'draft' | 'review' | 'approved' | 'published'
- derivatives (jsonb) - 5 platform versions
- created_at, updated_at
```

**4. content_versions** - Version control for drafts
```sql
- version_id (uuid), pack_id (FK)
- version_number, draft_content
- change_description, created_by
- created_at
```

**5. derivative_versions** - Version control for derivatives
```sql
- version_id (uuid), pack_id (FK)
- derivative_type (e.g., 'twitter', 'linkedin')
- content (jsonb)
- created_at
```

### RAG System Tables

**6. documents** - Knowledge base documents
```sql
- doc_id (uuid), title, content, url
- author, published_date, tags (array)
- embedding (vector(1536)) -- pgvector
- is_active, created_at, updated_at
```

**7. document_chunks** - Document segments for granular search
```sql
- chunk_id (uuid), doc_id (FK)
- chunk_index, chunk_text
- embedding (vector(1536))
- created_at
```

**8. citations** - Track document usage
```sql
- citation_id (uuid)
- brief_id, content_id (FKs, nullable)
- doc_id, chunk_id (FKs)
- citation_index, snippet
- relevance_score (float)
- created_at
```

### Integration Tables

**9. integration_credentials** - Third-party integrations
```sql
- integration_id (uuid)
- integration_type: 'mailchimp' | 'wordpress'
- config (jsonb) - encrypted credentials
- is_active, created_at, updated_at
```

### Indexes
- B-tree indexes on all foreign keys
- Vector indexes (HNSW/IVFFlat) on embedding columns
- Full-text search (GIN) on content fields

---

## 🔌 API ENDPOINTS

### Ideas Management
```
GET    /api/ideas                    # Get all ideas
GET    /api/ideas/:id                # Get single idea
DELETE /api/ideas/:id                # Delete idea
POST   /api/ideas/delete-many        # Bulk delete
PUT    /api/ideas/:id/status         # Update status
POST   /api/ideas/generate           # AI generate ideas
POST   /api/ideas/:id/implementation # Generate plan
```

### Briefs Management
```
GET    /api/briefs             # Get all briefs
GET    /api/briefs/:id         # Get single brief
POST   /api/briefs             # Create brief
PUT    /api/briefs/:id         # Update brief
DELETE /api/briefs/:id         # Delete brief
PUT    /api/briefs/:id/approve # Approve brief
```

### Content Packs (Drafts + Derivatives)
```
GET    /api/packs                              # Get all packs
GET    /api/packs/:id                          # Get single pack
POST   /api/packs/generate                     # Generate draft (SSE)
PUT    /api/packs/:id/draft                    # Update draft
PUT    /api/packs/:id/status                   # Update status
DELETE /api/packs/:id                          # Delete pack
GET    /api/packs/:id/versions                 # Version history
POST   /api/packs/:id/versions                 # Create version
POST   /api/packs/derivatives                  # Generate derivatives
POST   /api/packs/:id/derivatives/regenerate   # Regenerate one
GET    /api/packs/:id/derivatives/versions     # Derivative versions
GET    /api/packs/:id/derivatives/export       # Export (JSON/MD)
```

### RAG System
```
GET    /api/rag/documents              # Get all documents
POST   /api/rag/documents/upload       # Upload document
DELETE /api/rag/documents/:id          # Delete document
POST   /api/rag/search                 # Semantic search
POST   /api/rag/search/chunks          # Search chunks
POST   /api/rag/search/hybrid          # Hybrid search
POST   /api/rag/context                # Build context
GET    /api/rag/documents/:id/analytics # Usage stats
```

### Integrations
```
POST   /api/integrations/mailchimp/save     # Save config
POST   /api/integrations/mailchimp/test     # Test connection
POST   /api/integrations/mailchimp/publish  # Publish campaign
POST   /api/integrations/wordpress/save     # Save config
GET    /api/integrations/wordpress/test     # Test connection
POST   /api/integrations/wordpress/publish  # Publish post
```

### Analytics
```
GET    /api/analytics/overview      # Overview stats
GET    /api/analytics/timeline      # Timeline stats
GET    /api/analytics/personas      # Persona/industry stats
GET    /api/analytics/performance   # Content performance
```

---

## ✨ CORE FEATURES

### 1. AI-Powered Idea Generation
- **Multi-provider:** OpenAI GPT-4o-mini + Gemini 1.5 Flash
- **Batch generation:** 5-10+ ideas at once
- **Smart fallback:** Tries Gemini first (free), falls back to OpenAI
- **Multi-language:** Vietnamese, English, Japanese, Korean
- **Implementation plans:** Detailed execution steps
- **Status workflow:** generated → shortlisted → approved → archived

### 2. Brief Creation
- Define objectives, target audience, tone/style
- Key messages and SEO keywords
- Content structure planning
- Flowmap approval system

### 3. Content Studio (Draft Generation)
- **Real-time streaming:** SSE for live content generation
- **RAG-enhanced:** Optional knowledge base integration
- **Version control:** Track all draft versions
- **Word count tracking:** Automatic calculation
- **Multi-language support:** VN, EN, JP, KR

### 4. RAG Knowledge Base
- **Document management:** Upload reference materials
- **Auto-chunking:** Split into 500-char searchable chunks
- **Vector embeddings:** 1536-dimensional (OpenAI/Gemini)
- **Semantic search:** Cosine similarity search
- **Hybrid search:** Full-text + semantic
- **Citation tracking:** Track document usage
- **Analytics:** Document popularity and relevance

### 5. Multi-Platform Derivatives
Generate 5 content variations from one draft:

1. **Twitter Thread** - 10 tweets (280 chars each)
2. **LinkedIn Post** - 300-500 words, professional tone
3. **Email Newsletter** - 400-600 words with CTA
4. **Blog Summary** - ~200 words, key takeaways
5. **SEO Description** - 150-160 chars for meta tags

**Features:**
- Version history per derivative
- Regenerate individual derivatives
- Export as JSON or Markdown
- Platform-specific previews

### 6. Multi-Platform Publisher
**Mailchimp Integration:**
- Email campaign creation and sending
- Audience list management
- API key + server prefix authentication
- Retry logic with exponential backoff

**WordPress Integration:**
- Blog post publishing
- Category auto-creation
- Post status control (draft/publish)
- Application password authentication

### 7. Content Library
- Browse all published content
- Filter by status, tags, date
- Version history viewer
- Edit and republish
- SEO metadata management

### 8. Analytics Dashboard
- Overview metrics (ideas, briefs, contents, conversions)
- Timeline stats (7/30/90 days)
- Persona/industry analysis
- Content performance tracking
- Productivity metrics

---

## 🔄 CONTENT WORKFLOW

```
1. IDEATION
   └─> Generate ideas with AI
       └─> Shortlist best ideas
           └─> Approve for briefing

2. BRIEFING
   └─> Create brief from idea
       └─> Define objectives, audience, structure
           └─> Approve brief

3. DRAFT GENERATION
   └─> Generate content pack (streaming)
       └─> Optional RAG enhancement
           └─> Save draft with version

4. DERIVATIVES
   └─> Generate 5 platform versions
       └─> Twitter, LinkedIn, Email, Blog, SEO

5. REVIEW & EDIT
   └─> Edit draft or derivatives
       └─> Version control tracks changes
           └─> Approve for publishing

6. PUBLISHING
   └─> Publish to platforms
       ├─> Mailchimp (email)
       ├─> WordPress (blog)
       └─> Mark as published

7. ANALYTICS
   └─> Track performance
       └─> Optimize future content
```

---

## 🧠 RAG-ENHANCED GENERATION

```
1. Upload documents → Auto-chunk → Generate embeddings → Store in vector DB

2. Generate content with RAG:
   └─> Query: brief objectives + keywords
       └─> Semantic search (top N chunks, similarity > 0.7)
           └─> Build context with citations
               └─> Inject into LLM prompt
                   └─> Generate RAG-enhanced content
                       └─> Store citations
```

---

## 🔧 KEY SERVICES

### LLM Client (`lib/llmClient.ts`)
Unified interface for multiple AI providers:
- OpenAI (GPT-4o-mini, GPT-4)
- Gemini (1.5 Flash, 1.5 Pro)
- Streaming support
- Automatic fallback
- Temperature & token control

### Embedding Service (`services/embedding.service.ts`)
- OpenAI: text-embedding-3-small (1536D)
- Gemini: text-embedding-004 (768D padded to 1536D)
- Batch processing
- Cosine similarity calculation

### RAG Service (`services/rag.service.ts`)
- Semantic search
- Chunk-level search
- Hybrid search
- Context building
- Citation management
- Analytics tracking

### Mailchimp Service (`services/mailchimp.service.ts`)
```typescript
{
  apiKey: string
  serverPrefix: string        // e.g., "us1", "us21"
  audienceListId: string
  fromName: string
  fromEmail: string
  replyToEmail: string
}
```

### WordPress Service (`services/wordpress.service.ts`)
```typescript
{
  name: string
  siteUrl: string
  username: string
  applicationPassword: string
  defaultCategory?: string
  defaultStatus: 'draft' | 'publish' | 'pending' | 'private'
  apiBasePath?: string        // default: '/wp-json'
  requestTimeoutMs?: number
  allowInsecureHttp?: boolean
}
```

### Derivative Generator (`services/derivativeGenerator.ts`)
- Single AI call for all 5 derivatives
- JSON validation and fixing
- Retry with model fallback
- Version history
- Individual regeneration

---

## ⚙️ CONFIGURATION

### Backend Environment Variables
```env
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/ai_ideas_db

# Server
PORT=3001
HOST=0.0.0.0

# AI Providers
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
DEFAULT_AI_PROVIDER=gemini
DEFAULT_EMBEDDING_PROVIDER=openai

# Features
NODE_ENV=development
```

### Database Connection Pool
```typescript
{
  max: 10,                      // Max connections
  min: 2,                       // Min connections
  idleTimeoutMillis: 20000,     // 20s idle timeout
  connectionTimeoutMillis: 5000, // 5s connection timeout
  query_timeout: 30000,         // 30s query timeout
  statement_timeout: 30000      // 30s statement timeout
}
```

### Next.js Proxy Configuration
```javascript
async rewrites() {
  return [{
    source: '/api/:path*',
    destination: 'http://localhost:3001/api/:path*'
  }]
}
```

---

## 🛡️ ERROR HANDLING & RESILIENCE

### Retry Strategies
1. **Exponential Backoff:** 1s, 2s, 4s delays
2. **Provider Fallback:** Gemini → OpenAI
3. **Max Retries:** 2-3 attempts per provider
4. **Timeout Handling:** AbortController with timeouts

### Error Recovery
- Connection leak prevention (proper pool cleanup)
- Malformed JSON fixing (sanitization, extraction)
- API rate limit handling (retry on 429)
- Network error detection and retry
- User-friendly error messages

### Performance Optimizations
- Request deduplication (SWR)
- Optimistic UI updates
- Connection pooling with limits
- Streaming for long operations
- Batch processing for embeddings

---

## 🚀 DEPLOYMENT

### Requirements
- Node.js 18+
- PostgreSQL 15 with pgvector
- Docker & Docker Compose
- OpenAI API key (recommended)
- Gemini API key (optional, free tier)

### Setup Steps
```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Configure environment
# Edit backend/.env and frontend/.env.local

# 3. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 4. Run migrations (if needed)
cd backend && tsx migrations/run-*.ts

# 5. Start backend
cd backend && npm run dev

# 6. Start frontend
cd frontend && npm run dev

# 7. Access app
# http://localhost:3000
```

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

---

## 📁 KEY FILES REFERENCE

### Must-Read Backend Files
1. `backend/src/index.ts` - Main server entry
2. `backend/src/lib/llmClient.ts` - AI client
3. `backend/src/lib/db.ts` - Database pool
4. `backend/src/services/packs.service.ts` - Content packs
5. `backend/src/services/derivativeGenerator.ts` - Multi-platform
6. `backend/src/services/rag.service.ts` - RAG system
7. `backend/src/services/mailchimp.service.ts` - Mailchimp
8. `backend/src/services/wordpress.service.ts` - WordPress

### Must-Read Frontend Files
1. `frontend/app/layout.tsx` - Root layout
2. `frontend/app/hooks/useApi.ts` - API hooks
3. `frontend/app/publisher/page.tsx` - Publisher
4. `frontend/app/studio/page.tsx` - Content Studio
5. `frontend/app/components/TopNav.tsx` - Navigation

---

## 📊 PROJECT STATISTICS

- **Total Backend Files:** 37 TypeScript files
- **Total Frontend Files:** 58 TSX files
- **Database Migrations:** 9 SQL files
- **API Endpoints:** 60+ routes
- **Database Tables:** 9 tables
- **Integrations:** 2 (Mailchimp, WordPress)
- **AI Providers:** 2 (OpenAI, Gemini)
- **Languages Supported:** 4 (VN, EN, JP, KR)
- **Platform Derivatives:** 5 (Twitter, LinkedIn, Email, Blog, SEO)

---

## 🎯 FEATURE HIGHLIGHTS

✅ Full-stack TypeScript architecture
✅ Multi-provider AI support (OpenAI + Gemini)
✅ RAG knowledge base with vector search
✅ Multi-platform content derivatives
✅ Mailchimp & WordPress integrations
✅ Version control for all content
✅ Real-time streaming generation
✅ Comprehensive analytics
✅ Production-grade error handling
✅ Scalable architecture with connection pooling
✅ Modern UI with dark mode and animations
✅ Multi-language support

---

## 📝 NOTES

### Current Status
- All core features implemented and working
- Database migrations completed
- Integrations tested and functional
- Frontend fully responsive
- Backend optimized with connection pooling

### Known Limitations
- No user authentication system yet
- Single-tenant only (no multi-user support)
- No scheduled publishing
- No mobile app

### Future Enhancements
- User authentication & multi-tenancy
- Twitter/X direct publishing API
- Scheduled publishing & content calendar
- A/B testing for derivatives
- Real-time collaboration
- Mobile app
- Comprehensive test suite
- Rate limiting & caching

---

**Last Updated:** 2025-12-13
**Maintained By:** Development Team
**Project Status:** ✅ Production Ready
