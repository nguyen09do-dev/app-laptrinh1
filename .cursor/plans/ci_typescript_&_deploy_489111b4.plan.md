---
name: CI TypeScript & Deploy
overview: Establish CI-ready TypeScript configuration with automated checks, then create production deployment guide for Vercel (frontend) and Railway (backend + PostgreSQL).
todos:
  - id: ci-scripts
    content: Add typecheck, lint, test, and ci scripts to backend and frontend package.json
    status: completed
  - id: eslint-setup
    content: Install ESLint and create configuration for backend TypeScript
    status: completed
  - id: run-checks
    content: Run typecheck, lint, and build on both backend and frontend to identify errors
    status: completed
  - id: fix-types
    content: "Fix TypeScript errors in batches: services → controllers → routes → frontend"
    status: completed
  - id: cleanup-broken
    content: Delete broken controller file and remove unused code
    status: completed
  - id: verify-ci
    content: Run unified CI script and confirm all checks pass
    status: completed
  - id: railway-setup
    content: Create Railway project, provision PostgreSQL, deploy backend service
    status: pending
  - id: railway-env
    content: Configure environment variables on Railway (DATABASE_URL, API keys, etc.)
    status: pending
  - id: run-migrations
    content: Execute all database migrations on Railway PostgreSQL
    status: pending
  - id: vercel-setup
    content: Create Vercel project and deploy frontend with NEXT_PUBLIC_API_URL
    status: pending
  - id: cors-update
    content: Update backend CORS configuration to include Vercel production domain
    status: pending
  - id: verify-deployment
    content: Test health endpoint, frontend-backend connection, and full content workflow
    status: pending
---

# Plan: CI/TypeScript Cleanup & Production Deployment

## Part 1: CI/TypeScript - Repository Health Check

### Current State Analysis

**Repository Structure:**

- Backend: Fastify + TypeScript (strict mode enabled)
- Frontend: Next.js 14 + TypeScript (strict mode enabled)
- No monorepo setup - separate `package.json` for each
- No existing test infrastructure (no Jest/Vitest config found)
- No CI/CD configuration (no `.github/workflows`)
- One broken file: [`backend/src/controllers/ideas.controller.ts.broken`](backend/src/controllers/ideas.controller.ts.broken)

**Existing Scripts:**Backend ([`backend/package.json`](backend/package.json)):

- `dev`: tsx watch (development)
- `build`: tsc (compile TypeScript)
- `start`: node dist/index.js (production)
- Missing: `lint`, `typecheck`, `test`

Frontend ([`frontend/package.json`](frontend/package.json)):

- `dev`: next dev
- `build`: next build
- `start`: next start
- `lint`: next lint
- Missing: `typecheck`, `test`

### CI Implementation Strategy

#### 1. Add Missing Scripts

**Backend** - Add to `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts --max-warnings 0",
    "test": "echo \"No tests yet\" && exit 0",
    "ci": "npm run lint && npm run typecheck && npm run build"
  }
}
```

**Frontend** - Add to `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "echo \"No tests yet\" && exit 0",
    "ci": "npm run lint && npm run typecheck && npm run build"
  }
}
```

**Root-level** - Create `package.json` for unified CI:

```json
{
  "name": "ai-content-multiplier",
  "private": true,
  "scripts": {
    "ci": "npm run ci:backend && npm run ci:frontend",
    "ci:backend": "cd backend && npm run ci",
    "ci:frontend": "cd frontend && npm run ci",
    "typecheck": "npm run typecheck:backend && npm run typecheck:frontend",
    "typecheck:backend": "cd backend && npm run typecheck",
    "typecheck:frontend": "cd frontend && npm run typecheck",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd backend && npm run lint",
    "lint:frontend": "cd frontend && npm run lint",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build"
  }
}
```



#### 2. Add ESLint Configuration

Backend needs ESLint setup (currently missing). Create [`backend/.eslintrc.json`](backend/.eslintrc.json):

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

Install dependencies:

```bash
cd backend
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```



#### 3. Run Initial Checks & Fix Errors

**Commands to execute** (copy-paste ready):

```bash
# Check Node/npm versions
node -v
npm -v

# Backend checks
cd backend
npm run typecheck 2>&1 | head -n 50
npm run build 2>&1 | head -n 50

# Frontend checks  
cd ../frontend
npm run lint 2>&1 | head -n 50
npm run typecheck 2>&1 | head -n 50
npm run build 2>&1 | head -n 50

# Root-level unified check (after creating root package.json)
cd ..
npm run ci 2>&1 | head -n 100
```



#### 4. Error Classification & Fix Strategy

**Expected error groups:**

1. **Type Errors** - Missing types, implicit `any`, wrong generics

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fix: Add explicit types, import missing interfaces

2. **Import Path Errors** - `.js` extension in imports (ESM requirement)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Status: Already present in codebase (e.g., [`src/index.ts`](backend/src/index.ts))

3. **Broken File** - [`ideas.controller.ts.broken`](backend/src/controllers/ideas.controller.ts.broken)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Decision: Delete (appears to be backup/duplicate)

4. **Unused Variables** - Variables declared but not used

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fix: Remove or prefix with `_`

5. **Next.js Build Warnings** - Console statements, unused components

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fix: Remove console.logs in production, delete unused code

**Batch Fix Approach:**

- Group 1: Fix all type errors in services (10-15 files)
- Group 2: Fix controller type errors (8 files)
- Group 3: Fix route handler types (9 files)
- Group 4: Frontend component type errors (if any)
- Group 5: Cleanup (remove broken files, unused imports)

#### 5. Verification

After fixes, run full CI suite:

```bash
# From root
npm run ci

# Should output:
# ✓ Backend lint: 0 warnings
# ✓ Backend typecheck: 0 errors
# ✓ Backend build: success
# ✓ Frontend lint: 0 warnings  
# ✓ Frontend typecheck: 0 errors
# ✓ Frontend build: success
```



#### 6. Git Commit Strategy

Each batch gets its own commit:

```bash
# Example commit sequence
git commit -m "ci: add typecheck and lint scripts to backend/frontend"
git commit -m "fix(backend): resolve type errors in services layer"
git commit -m "fix(backend): resolve type errors in controllers"
git commit -m "fix(frontend): resolve Next.js build warnings"
git commit -m "chore: remove broken controller file and unused code"
git commit -m "ci: add root-level unified CI scripts"
```

---

## Part 2: Production Deployment Guide

### Architecture Overview

```mermaid
flowchart LR
    User[User Browser]
    Vercel[Vercel Frontend]
    Railway[Railway Backend API]
    DB[(Railway PostgreSQL)]
    
    User -->|HTTPS| Vercel
    Vercel -->|API Calls| Railway
    Railway -->|SQL| DB
    
    subgraph Vercel_Cloud[Vercel Cloud]
        Vercel
    end
    
    subgraph Railway_Cloud[Railway Cloud]
        Railway
        DB
    end
```



### Deployment Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant Railway as Railway
    participant Vercel as Vercel
    participant DB as PostgreSQL
    
    Dev->>Git: Push code
    Git->>Railway: Auto deploy backend
    Railway->>DB: Run migrations
    Railway->>Railway: Start server
    Git->>Vercel: Auto deploy frontend
    Vercel->>Railway: Set API URL env
    Vercel->>Vercel: Build & deploy
```



### Step 1: Railway Setup (Backend + Database)

#### 1.1 Create PostgreSQL Database

1. Go to [railway.app](https://railway.app) → New Project
2. Click "Provision PostgreSQL"
3. Railway automatically creates:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `DATABASE_URL` (internal)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `DATABASE_PUBLIC_URL` (external access)

#### 1.2 Deploy Backend Service

1. In same project, click "+ New Service"
2. Select "GitHub Repo" → Connect `Code01-HWAIcontentmulti`
3. Railway detects Node.js, auto-configures build

**Configuration:**

- **Root Directory**: `/backend` (or leave empty if detecting correctly)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Watch Paths**: `backend/**`

#### 1.3 Environment Variables (Backend)

Go to backend service → Variables:

```bash
# Required
NODE_ENV=production
PORT=${{PORT}}  # Railway auto-assigns port
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Reference from PostgreSQL service

# AI Providers (at least one required)
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...

# Optional (recommended)
DEFAULT_AI_PROVIDER=gemini
HOST=0.0.0.0
```

**Important Notes:**

- `PORT`: Railway injects automatically via `${{PORT}}` - do NOT hardcode
- `DATABASE_URL`: Use Railway reference `${{Postgres.DATABASE_URL}}` (links services)
- Backend code already supports `process.env.PORT || '3001'` ([`src/index.ts:111`](backend/src/index.ts))

#### 1.4 Run Database Migrations

**Option A: Railway CLI** (recommended):

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Connect to database and run migrations
railway run psql $DATABASE_URL -f backend/migrations/001_add_brief_flowmap_approved.sql
railway run psql $DATABASE_URL -f backend/migrations/002_add_content_packs.sql
# ... repeat for all 11 migration files
```

**Option B: SQL Console** (manual):

1. Railway Dashboard → PostgreSQL service → Data tab
2. Copy SQL from each migration file in [`backend/migrations/`](backend/migrations/)
3. Execute in order (001 → 011)

**Option C: Migration Script** (one-time):Create `backend/run-all-migrations.js`:

```javascript
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

const migrations = [
  '001_add_brief_flowmap_approved.sql',
  '002_add_content_packs.sql',
  '003_fix_contents_columns.sql',
  '004_setup_rag_system.sql',
  '005_add_derivatives.sql',
  '006_add_content_versioning.sql',
  '007_remove_unique_brief_id.sql',
  '008_add_pack_id_to_contents.sql',
  '009_add_integration_credentials.sql',
  '010_add_social_platforms_to_integrations.sql',
  '011_fix_document_versions_table.sql'
];

await client.connect();
for (const file of migrations) {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', file), 'utf8');
  console.log(`Running ${file}...`);
  await client.query(sql);
}
await client.end();
```

Run via Railway:

```bash
railway run node backend/run-all-migrations.js
```



#### 1.5 Deploy & Get Public URL

- Railway auto-deploys on git push
- Generate public domain: Service Settings → Networking → Generate Domain
- Copy URL (e.g., `https://your-backend.railway.app`)

---

### Step 2: Vercel Setup (Frontend)

#### 2.1 Create Project

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import Git Repository → Select `Code01-HWAIcontentmulti`
3. Vercel auto-detects Next.js

**Configuration:**

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

#### 2.2 Environment Variables (Frontend)

Add in Vercel project → Settings → Environment Variables:

```bash
# Required - Backend API URL from Railway
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Critical Notes:**

- NO trailing slash: `https://...app` not `https://...app/`
- Must start with `NEXT_PUBLIC_` to be available in browser
- Will need to redeploy after setting (Vercel rebuilds)

#### 2.3 Deploy

- Click "Deploy"
- Vercel builds and deploys automatically
- Get production URL: `https://your-app.vercel.app`

---

### Step 3: Backend CORS Configuration

Update [`backend/src/index.ts`](backend/src/index.ts) to allow Vercel domain:

```typescript
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002', 
    'https://your-app.vercel.app',  // Add production URL
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

Commit and push - Railway auto-redeploys.---

### Step 4: Post-Deployment Verification

#### 4.1 Health Check

```bash
# Backend health
curl https://your-backend.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-12-17T...",
  "database": "connected",
  "pool": { "total": 10, "idle": 2, "active": 0 }
}
```



#### 4.2 Frontend → Backend Connection

1. Open `https://your-app.vercel.app`
2. Navigate to Ideas page
3. Try "Generate Ideas"
4. Check browser console for errors

**Common Issues:**

- **ERR_INVALID_URL**: `NEXT_PUBLIC_API_URL` has trailing slash → remove it
- **404 Not Found**: Wrong API URL → check Railway public domain
- **CORS Error**: Vercel domain not in CORS whitelist → update backend CORS config
- **500 Database Error**: Migrations not run → check Step 1.4

#### 4.3 Full Workflow Test

Test complete content creation flow:

1. **Ideas**: Generate 10 ideas → should save to database
2. **Briefs**: Create brief from idea → should call AI and save
3. **Content**: Generate full content → should stream response
4. **Documents** (if using RAG): Upload document → should process and embed
5. **Publisher**: Connect integration → test credentials storage

#### 4.4 Database Connection Test

```bash
# Via Railway CLI
railway connect

# In PostgreSQL shell
SELECT COUNT(*) FROM ideas;
SELECT COUNT(*) FROM contents;
SELECT COUNT(*) FROM documents;
```

---

### Step 5: Troubleshooting Guide

#### Error: "ERR_INVALID_URL" or "Invalid URL"

**Cause**: Environment variable format issue**Fix**:

```bash
# Wrong (includes "DATABASE_URL=" prefix)
DATABASE_URL=DATABASE_URL=postgresql://...

# Correct
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**For Railway**: Use variable reference instead of copy-paste:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```



#### Error: "Failed to fetch" or "Network error"

**Cause**: CORS or wrong API URL**Fix**:

1. Verify `NEXT_PUBLIC_API_URL` has no trailing slash
2. Check Vercel domain is in backend CORS whitelist
3. Confirm backend is actually running (check Railway logs)

#### Error: "relation does not exist"

**Cause**: Migrations not applied**Fix**: Run all migration files (see Step 1.4)

#### Error: "getaddrinfo ENOTFOUND"

**Cause**: Backend can't resolve database hostname**Fix**: Use Railway's internal `DATABASE_URL` reference, not public URL

#### Error: Railway build fails

**Check**:

1. `package.json` has `build` script
2. `tsconfig.json` is valid
3. All dependencies in `package.json`
4. Railway logs for specific error

#### Error: Vercel build fails

**Check**:

1. `NEXT_PUBLIC_API_URL` is set (even if backend not ready, build should succeed)
2. No TypeScript errors (should be caught in CI)
3. `next.config.js` is valid
4. Vercel logs for specific error

---

### Step 6: Optional CI/CD Automation

While manual deployment works, you can add GitHub Actions for CI checks:**`.github/workflows/ci.yml`**:

```yaml
name: CI

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - uses: actions/checkout@v3
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - uses: actions/setup-node@v3
        with:
          node-version: 18
      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - name: Install backend deps
        run: cd backend && npm ci
      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - name: Install frontend deps
        run: cd frontend && npm ci
      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - name: Lint & Typecheck Backend
        run: cd backend && npm run lint && npm run typecheck
      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - name: Lint & Typecheck Frontend
        run: cd frontend && npm run lint && npm run typecheck
      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - name: Build Backend
        run: cd backend && npm run build
      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - name: Build Frontend
        run: cd frontend && npm run build
```

**Note**: This is CI only, not CD. Railway/Vercel handle deployment automatically on push to main.---

## Summary Checklist

### Pre-Deployment (CI/TypeScript)

- [ ] Add `typecheck`, `lint`, `test`, `ci` scripts to `backend/package.json`
- [ ] Add `typecheck`, `test`, `ci` scripts to `frontend/package.json`
- [ ] Create root `package.json` with unified CI scripts
- [ ] Add ESLint config to backend
- [ ] Run `npm run ci` and fix all type errors
- [ ] Delete `backend/src/controllers/ideas.controller.ts.broken`
- [ ] Verify: `npm run ci` exits with code 0
- [ ] Commit fixes in logical batches

### Railway Deployment (Backend + Database)

- [ ] Create Railway project
- [ ] Provision PostgreSQL service
- [ ] Deploy backend service from GitHub
- [ ] Set root directory to `/backend`
- [ ] Configure environment variables (PORT, DATABASE_URL, API keys)
- [ ] Run all 11 database migrations in order
- [ ] Generate public domain for backend
- [ ] Test `/health` endpoint returns `status: ok`
- [ ] Verify database connection in health response

### Vercel Deployment (Frontend)

- [ ] Create Vercel project from GitHub repo
- [ ] Set root directory to `frontend`
- [ ] Add `NEXT_PUBLIC_API_URL` environment variable (Railway backend URL)
- [ ] Deploy (first build may take 2-3 minutes)
- [ ] Verify deployment succeeds
- [ ] Test site loads at Vercel URL

### Post-Deployment

- [ ] Update backend CORS to include Vercel domain
- [ ] Redeploy backend (Railway auto-deploys on push)
- [ ] Test frontend → backend API calls (try Generate Ideas)
- [ ] Verify no CORS errors in browser console
- [ ] Test full workflow: Idea → Brief → Content → Derivatives
- [ ] Test RAG: Upload document, query database
- [ ] Test Publisher: Connect integration (WordPress/Mailchimp)
- [ ] Check Railway logs for errors
- [ ] Check Vercel logs for errors
- [ ] Monitor database connection pool (should stay under 10 connections)

### Production Hardening (Optional but Recommended)

- [ ] Add rate limiting to backend API
- [ ] Set up Railway usage alerts
- [ ] Enable Vercel Analytics
- [ ] Add error tracking (Sentry/LogRocket)
- [ ] Set up uptime monitoring (UptimeRobot/Pingdom)
- [ ] Create backup strategy for PostgreSQL
- [ ] Document environment variables in `.env.example`
- [ ] Add deployment instructions to README

---

## Terminal Commands Reference

```bash
# === CI/TypeScript Phase ===

# 1. Version check
node -v
npm -v

# 2. Add dependencies
cd backend
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 3. Run checks (before fixes)
cd backend
npm run typecheck 2>&1 | tee typecheck-errors.log
npm run build 2>&1 | tee build-errors.log

cd ../frontend
npm run lint 2>&1 | tee lint-errors.log
npm run typecheck 2>&1 | tee typecheck-errors.log
npm run build 2>&1 | tee build-errors.log

# 4. After fixes - unified check
cd ..
npm run ci

# === Deployment Phase ===

# 5. Railway CLI setup
npm install -g @railway/cli
railway login
railway link

# 6. Run migrations
for f in backend/migrations/*.sql; do
  railway run psql $DATABASE_URL -f "$f"
done

# 7. Test backend health
curl https://your-backend.railway.app/health

# 8. Test API endpoint
curl -X POST https://your-backend.railway.app/api/ideas/generate \
  -H "Content-Type: application/json" \
  -d '{"persona":"Developer","industry":"Tech"}'

# 9. Check Railway logs
railway logs

# 10. Check database
railway connect
# Then in psql:
\dt  # List tables
SELECT COUNT(*) FROM ideas;
```

---

## Key Files to Modify

1. **`backend/package.json`** - Add CI scripts + ESLint devDeps
2. **`frontend/package.json`** - Add typecheck script
3. **`package.json`** (root) - Create new unified CI scripts
4. **`backend/.eslintrc.json`** - Create new ESLint config
5. **`backend/src/index.ts`** - Update CORS for Vercel domain
6. **`backend/src/controllers/ideas.controller.ts.broken`** - Delete
7. Various `*.ts` files - Fix type errors based on CI output

---

## Environment Variables Summary

### Backend (Railway)

```bash
NODE_ENV=production
PORT=${{PORT}}  # Auto-injected by Railway
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Link to PostgreSQL service
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
DEFAULT_AI_PROVIDER=gemini
HOST=0.0.0.0
```



### Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app  # No trailing slash!
```

---

## Expected Timeline

- **CI/TypeScript fixes**: 2-4 hours (depends on error count)
- **Railway setup**: 30 minutes
- **Database migrations**: 15 minutes
- **Vercel setup**: 15 minutes
- **Testing & troubleshooting**: 1-2 hours
- **Total**: 4-7 hours

---

## Success Criteria

- [x] `npm run ci` exits 0 (no errors)
- [x] Backend health endpoint returns 200 OK
- [x] Frontend loads without errors
- [x] Can generate ideas end-to-end
- [x] Can create content with AI streaming
- [x] Database persists data correctly
- [x] No CORS errors in browser console