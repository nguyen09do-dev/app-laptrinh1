# 🚀 AI Content Multiplier

> AI-Powered Content Generation & Multi-Platform Publishing System

Ứng dụng tạo nội dung AI và xuất bản đa nền tảng, được xây dựng với Fastify + TypeScript + PostgreSQL + Next.js + Tailwind CSS.

## ✨ Tính năng

### Core Features
- ✅ **AI Idea Generation** - Tạo 10 ý tưởng content với OpenAI/Gemini
- ✅ **Content Briefs** - Tạo outline chi tiết cho content
- ✅ **Full Content Writing** - Viết bài dài ~2000 từ bằng AI
- ✅ **Content Derivatives** - Tạo biến thể cho nhiều nền tảng (Twitter, LinkedIn, Email, Blog, SEO)
- ✅ **RAG System** - Tích hợp tài liệu với vector search (pgvector)
- ✅ **Content Packs** - Quản lý nhóm content theo chủ đề

### Multi-Platform Publishing
- ✅ **WordPress** - Tự động đăng bài lên WordPress
- ✅ **Mailchimp** - Gửi email campaign
- ✅ **Facebook** - Đăng lên Facebook Page
- ✅ **Instagram** - Đăng ảnh và caption
- ✅ **Twitter/X** - Tweet tự động
- ✅ **LinkedIn** - Đăng bài lên LinkedIn
- ✅ **Zalo** - Gửi tin nhắn Zalo OA

### Technical Features
- ✅ **Streaming AI Responses** - Real-time content generation
- ✅ **Multi-Provider Support** - OpenAI & Google Gemini
- ✅ **TypeScript Strict Mode** - Type-safe codebase
- ✅ **Database Migrations** - Version-controlled schema
- ✅ **CI/CD Ready** - GitHub Actions workflow included
- ✅ **Production Deployment** - Ready for Railway + Vercel

## 🏗️ Cấu trúc Project

```
├── docker-compose.yml          # Docker Compose cho PostgreSQL
├── README.md                   # File này
├── backend/                    # Backend Fastify
│   ├── package.json
│   ├── tsconfig.json
│   ├── init.sql               # SQL khởi tạo database
│   └── src/
│       ├── index.ts           # Entry point
│       ├── routes/            # Route definitions
│       │   └── ideas.routes.ts
│       ├── controllers/       # Request handlers
│       │   └── ideas.controller.ts
│       ├── services/          # Business logic
│       │   └── ideas.service.ts
│       ├── lib/               # Utilities
│       │   ├── db.ts          # Database connection
│       │   └── llmClient.ts   # OpenAI client
│       └── schema/            # Validation schemas
│           └── ideaGenerate.schema.ts
└── frontend/                   # Frontend Next.js
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── app/
        ├── layout.tsx
        ├── page.tsx
        └── globals.css
```

## 🚀 Quick Start

### For Development

See **`QUICK_START.md`** for local development setup.

### For Production Deployment

**👉 START HERE:** Read **`START_HERE.md`** for deployment guide.

**Quick deployment steps:**
1. Deploy backend on Railway (20 min) - See `RAILWAY_SETUP.md`
2. Deploy frontend on Vercel (15 min) - See `VERCEL_SETUP.md`
3. Connect & test (10 min) - See `DEPLOYMENT_CHECKLIST.md`

**Total time:** ~1 hour

---

## 📚 Documentation

### Deployment Guides
- **`START_HERE.md`** - Quick start for deployment
- **`DEPLOYMENT_GUIDE.md`** - Complete deployment guide
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step checklist
- **`RAILWAY_SETUP.md`** - Railway (backend + DB) setup
- **`VERCEL_SETUP.md`** - Vercel (frontend) setup
- **`PART_2_COMPLETE.md`** - Deployment work summary

### Development Guides
- **`QUICK_START.md`** - Local development setup
- **`CLAUDE.md`** - AI coding context & conventions
- **`DATABASE_SETUP.md`** - Database configuration

---

## 🏗️ Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- OpenAI or Gemini API key

### Local Setup

```bash
# 1. Clone repository
git clone <your-repo-url>
cd Code01-HWAIcontentmulti

# 2. Start PostgreSQL
docker compose up -d

# 3. Setup backend
cd backend
npm install
cp ../env.example .env
# Edit .env and add your API keys

# 4. Run migrations
npm run dev  # Backend will auto-create tables

# 5. Setup frontend (in new terminal)
cd ../frontend
npm install
cp ../env.example .env.local
# Edit .env.local if needed

# 6. Start frontend
npm run dev

# 7. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

**Detailed setup:** See `QUICK_START.md`

---

## 🧪 Testing & CI

### Run All Checks

```bash
# From root directory
npm run ci

# This runs:
# - Backend: lint, typecheck, build
# - Frontend: lint, typecheck, build
```

### Individual Checks

```bash
# Backend
cd backend
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # Compile

# Frontend
cd frontend
npm run lint       # Next.js lint
npm run typecheck  # TypeScript
npm run build      # Next.js build
```

### GitHub Actions

CI automatically runs on push/PR via `.github/workflows/ci.yml`

---

## 🚀 Production Deployment

### Option 1: Railway + Vercel (Recommended)

**Backend + Database:** Railway
- PostgreSQL with pgvector
- Auto-deploy from GitHub
- $5/month free credit

**Frontend:** Vercel
- Next.js optimized
- Auto-deploy from GitHub
- Free tier available

**Guides:**
1. Start: `START_HERE.md`
2. Backend: `RAILWAY_SETUP.md`
3. Frontend: `VERCEL_SETUP.md`
4. Checklist: `DEPLOYMENT_CHECKLIST.md`

### Option 2: Self-Hosted

Use Docker Compose for full stack:
```bash
docker compose up -d
```

See `docker-compose.yml` for configuration.

## 📡 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/ideas` | Lấy tất cả ideas |
| GET | `/api/ideas/:id` | Lấy idea theo ID |
| POST | `/api/ideas` | Tạo idea mới |
| PUT | `/api/ideas/:id` | Cập nhật idea |
| DELETE | `/api/ideas/:id` | Xóa idea |
| POST | `/api/ideas/generate` | Generate ideas bằng AI |

### Ví dụ sử dụng API

**Generate Ideas:**
```bash
curl -X POST http://localhost:3001/api/ideas/generate \
  -H "Content-Type: application/json" \
  -d '{"persona": "Content Creator", "industry": "Technology"}'
```

**Lấy tất cả Ideas:**
```bash
curl http://localhost:3001/api/ideas
```

**Tạo Idea mới:**
```bash
curl -X POST http://localhost:3001/api/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hướng dẫn SEO",
    "description": "Bài viết về SEO cơ bản",
    "persona": "Blogger",
    "industry": "Marketing",
    "rationale": "SEO là kỹ năng cần thiết"
  }'
```

## 🔧 Troubleshooting

### Lỗi kết nối Database

```bash
# Kiểm tra Docker container
docker compose ps

# Xem logs
docker compose logs postgres

# Restart container
docker compose restart
```

### Lỗi OpenAI API

- Kiểm tra API key trong file `.env`
- Đảm bảo account OpenAI còn credit
- Kiểm tra rate limit

### Lỗi CORS

Frontend đã được cấu hình proxy trong `next.config.js`. Nếu vẫn gặp lỗi:
- Đảm bảo backend chạy đúng port 3001
- Kiểm tra CORS config trong `backend/src/index.ts`

## 🛠️ Tech Stack

### Backend
- **Framework:** Fastify v4
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL 16 + pgvector
- **AI Providers:** OpenAI (gpt-4o-mini), Google Gemini (gemini-1.5-flash)
- **Validation:** AJV (JSON Schema)
- **Document Processing:** pdf-parse, mammoth, cheerio

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3
- **UI:** Custom components
- **State:** React hooks + Server Components
- **Markdown:** react-markdown
- **Charts:** recharts

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment:** Railway (backend) + Vercel (frontend)
- **Database:** PostgreSQL with pgvector extension

## 📁 Project Structure

```
Code01-HWAIcontentmulti/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # HTTP handlers
│   │   ├── services/        # Business logic
│   │   ├── lib/             # Utilities (DB, LLM)
│   │   ├── schema/          # Validation schemas
│   │   └── middleware/      # Request processing
│   ├── migrations/          # Database migrations (11 files)
│   ├── run-all-migrations.js  # Migration automation
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/       # Dashboard page
│   │   ├── ideas/           # Ideas management
│   │   ├── briefs/          # Content briefs
│   │   ├── content/         # Full content
│   │   ├── derivatives/     # Content variations
│   │   ├── documents/       # RAG document upload
│   │   ├── publisher/       # Multi-platform publishing
│   │   ├── analytics/       # Performance tracking
│   │   └── components/      # Reusable UI components
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI
│
├── DEPLOYMENT_GUIDE.md      # Complete deployment guide
├── DEPLOYMENT_CHECKLIST.md  # Quick checklist
├── RAILWAY_SETUP.md         # Railway guide
├── VERCEL_SETUP.md          # Vercel guide
├── START_HERE.md            # Quick start
├── CLAUDE.md                # AI coding context
├── env.example              # Environment template
├── docker-compose.yml       # Docker setup
└── package.json             # Root CI scripts
```

---

## 🔄 Content Generation Flow

### Ideas → Briefs → Content → Derivatives → Publish

```mermaid
graph LR
    A[Generate Ideas] --> B[Create Brief]
    B --> C[Write Content]
    C --> D[Create Derivatives]
    D --> E[Publish to Platforms]
    
    F[Upload Documents] --> G[RAG System]
    G --> B
    G --> C
```

### Detailed Flow

1. **Ideas Generation**
   - User inputs persona + industry
   - AI generates 10 ideas
   - Ideas saved to database

2. **Brief Creation**
   - Select idea
   - AI creates detailed outline
   - Optional: Use RAG for context

3. **Content Writing**
   - AI writes full article (~2000 words)
   - Streaming response for UX
   - Optional: RAG integration

4. **Derivatives**
   - Generate variations:
     - Twitter thread
     - LinkedIn post
     - Email newsletter
     - Blog post
     - SEO meta tags

5. **Publishing**
   - Select platform(s)
   - One-click publish
   - Track performance

---

## 🔐 Environment Variables

### Backend (Required)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
OPENAI_API_KEY=sk-proj-xxx  # or GEMINI_API_KEY
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
```

### Frontend (Required)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Full reference:** See `env.example`

---

## 🧩 Key Features Explained

### RAG (Retrieval Augmented Generation)

Upload documents (PDF, DOCX, TXT) to enhance content generation:
- Documents chunked and embedded
- Vector similarity search with pgvector
- Context injected into AI prompts
- Improves accuracy and relevance

### Multi-Provider AI

Switch between OpenAI and Gemini:
```bash
DEFAULT_AI_PROVIDER=gemini  # or openai
```

Benefits:
- Cost optimization (Gemini free tier)
- Fallback if one provider fails
- Compare output quality

### Content Derivatives

One content → Multiple formats:
- **Twitter:** 280-char threads
- **LinkedIn:** Professional posts
- **Email:** Newsletter format
- **Blog:** SEO-optimized
- **Meta Tags:** Title, description, keywords

### Multi-Platform Publishing

Integrated platforms:
- WordPress (REST API)
- Mailchimp (API v3)
- Facebook (Graph API)
- Instagram (Graph API)
- Twitter/X (API v2)
- LinkedIn (API)
- Zalo (OA API)

## 📄 License

MIT License - Tự do sử dụng và học tập!























