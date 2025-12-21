# 🚀 Production Deployment Guide

> Deploy AI Content Multiplier to production: Frontend on Vercel, Backend + Database on Railway

---

## 📋 Prerequisites

- GitHub account with repo access
- [Railway account](https://railway.app) (free tier available)
- [Vercel account](https://vercel.com) (free tier available)
- OpenAI or Gemini API key

---

## Part 1: Railway Setup (Backend + Database)

### Step 1.1: Create PostgreSQL Database

1. Go to https://railway.app → **New Project**
2. Click **"Provision PostgreSQL"**
3. Railway automatically creates database with:
   - `DATABASE_URL` (internal connection)
   - `DATABASE_PUBLIC_URL` (external access)

### Step 1.2: Deploy Backend Service

1. In same Railway project, click **"+ New Service"**
2. Select **"GitHub Repo"** → Connect your repository
3. Railway auto-detects Node.js project

**Configuration:**

- **Root Directory**: Leave empty (Railway will detect `/backend`)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Watch Paths**: `backend/**`

### Step 1.3: Set Environment Variables

Go to Backend service → **Variables** tab:

```bash
# === REQUIRED ===
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=${{Postgres.DATABASE_URL}}

# === AI PROVIDERS (at least one required) ===
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx

# === OPTIONAL ===
DEFAULT_AI_PROVIDER=gemini
HOST=0.0.0.0
```

**Important Notes:**

- `PORT`: Use `${{PORT}}` - Railway auto-assigns port
- `DATABASE_URL`: Use `${{Postgres.DATABASE_URL}}` to link PostgreSQL service
- Don't hardcode values - use Railway references

### Step 1.4: Run Database Migrations

**Option A: Railway CLI** (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations one by one
railway run psql $DATABASE_URL -f backend/migrations/001_add_brief_flowmap_approved.sql
railway run psql $DATABASE_URL -f backend/migrations/002_add_content_packs.sql
railway run psql $DATABASE_URL -f backend/migrations/003_fix_contents_columns.sql
railway run psql $DATABASE_URL -f backend/migrations/004_setup_rag_system.sql
railway run psql $DATABASE_URL -f backend/migrations/005_add_derivatives.sql
railway run psql $DATABASE_URL -f backend/migrations/006_add_content_versioning.sql
railway run psql $DATABASE_URL -f backend/migrations/007_remove_unique_brief_id.sql
railway run psql $DATABASE_URL -f backend/migrations/008_add_pack_id_to_contents.sql
railway run psql $DATABASE_URL -f backend/migrations/009_add_integration_credentials.sql
railway run psql $DATABASE_URL -f backend/migrations/010_add_social_platforms_to_integrations.sql
railway run psql $DATABASE_URL -f backend/migrations/011_fix_document_versions_table.sql
```

**Option B: SQL Console** (Manual)

1. Railway Dashboard → PostgreSQL service → **Data** tab
2. Open SQL console
3. Copy content from each `.sql` file in `backend/migrations/`
4. Execute in order (001 → 011)

**Option C: Automated Script**

Use the provided migration script:

```bash
# Run all migrations at once
railway run node backend/run-all-migrations.js
```

### Step 1.5: Generate Public URL

1. Backend service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://your-backend.railway.app`)
4. Save this URL - you'll need it for Vercel

### Step 1.6: Verify Backend Deployment

```bash
# Test health endpoint
curl https://your-backend.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-12-17T...",
  "database": "connected",
  "pool": { "total": 10, "idle": 2, "active": 0 }
}
```

---

## Part 2: Vercel Setup (Frontend)

### Step 2.1: Create Vercel Project

1. Go to https://vercel.com → **Add New Project**
2. **Import Git Repository** → Select your repo
3. Vercel auto-detects Next.js

**Configuration:**

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 2.2: Set Environment Variables

Before deploying, add environment variable:

1. Vercel project → **Settings** → **Environment Variables**
2. Add the following:

```bash
# Backend API URL from Railway (NO TRAILING SLASH!)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Critical:**
- ❌ Wrong: `https://your-backend.railway.app/`
- ✅ Correct: `https://your-backend.railway.app`

### Step 2.3: Deploy Frontend

1. Click **"Deploy"**
2. Vercel builds and deploys (takes 2-3 minutes)
3. Get production URL: `https://your-app.vercel.app`

---

## Part 3: Connect Frontend & Backend

### Step 3.1: Update Backend CORS

Edit `backend/src/index.ts` to allow Vercel domain:

```typescript
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://your-app.vercel.app',  // Add your Vercel URL
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Step 3.2: Commit & Push

```bash
git add backend/src/index.ts
git commit -m "feat: add Vercel domain to CORS whitelist"
git push origin main
```

Railway will auto-redeploy backend.

---

## Part 4: Post-Deployment Verification

### ✅ Checklist

#### 4.1 Backend Health Check

```bash
curl https://your-backend.railway.app/health
```

Expected: `{ "status": "ok", "database": "connected" }`

#### 4.2 Frontend Loads

1. Open `https://your-app.vercel.app`
2. Should see homepage without errors
3. Check browser console - no CORS errors

#### 4.3 Test Ideas Generation

1. Navigate to **Ideas** page
2. Enter persona: "Developer"
3. Enter industry: "Technology"
4. Click **"Generate Ideas"**
5. Should see 10 ideas generated and saved

#### 4.4 Test Content Creation

1. Select an idea → Create Brief
2. Brief should generate with AI
3. Create Content from brief
4. Content should stream and save

#### 4.5 Test RAG (if using documents)

1. Go to **Documents** page
2. Upload a PDF/DOCX file
3. Should process and show success
4. Try querying the document

#### 4.6 Database Verification

```bash
# Connect to Railway database
railway connect

# In PostgreSQL shell:
\dt  # List all tables
SELECT COUNT(*) FROM ideas;
SELECT COUNT(*) FROM briefs;
SELECT COUNT(*) FROM contents;
```

---

## Part 5: Troubleshooting

### ❌ Error: "ERR_INVALID_URL"

**Cause:** Environment variable format issue

**Fix:**

```bash
# Wrong (includes variable name)
DATABASE_URL=DATABASE_URL=postgresql://...

# Correct
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

For Railway, use variable reference:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### ❌ Error: "Failed to fetch" or Network Error

**Cause:** CORS or wrong API URL

**Fix:**

1. Verify `NEXT_PUBLIC_API_URL` has NO trailing slash
2. Check Vercel domain is in backend CORS whitelist
3. Confirm backend is running (check Railway logs)

### ❌ Error: "relation does not exist"

**Cause:** Migrations not applied

**Fix:** Run all migration files (see Step 1.4)

### ❌ Error: CORS Policy Blocked

**Cause:** Vercel domain not in CORS whitelist

**Fix:**

1. Update `backend/src/index.ts` CORS config
2. Add your Vercel URL to `origin` array
3. Commit and push (Railway auto-redeploys)

### ❌ Error: "getaddrinfo ENOTFOUND"

**Cause:** Backend can't resolve database hostname

**Fix:** Use Railway's internal `DATABASE_URL` reference:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Not the public URL.

### ❌ Railway Build Fails

**Check:**

1. `package.json` has `build` script
2. `tsconfig.json` is valid
3. All dependencies listed in `package.json`
4. Railway logs for specific error

### ❌ Vercel Build Fails

**Check:**

1. `NEXT_PUBLIC_API_URL` is set (even if backend not ready)
2. No TypeScript errors (run `npm run typecheck` locally)
3. `next.config.js` is valid
4. Vercel logs for specific error

### ❌ AI Generation Not Working

**Check:**

1. API keys are set correctly in Railway
2. Check Railway logs for AI provider errors
3. Verify API key has credits/quota
4. Try switching provider (OpenAI ↔ Gemini)

---

## Part 6: Monitoring & Maintenance

### Railway Monitoring

1. **Logs**: Railway Dashboard → Service → **Logs** tab
2. **Metrics**: Monitor CPU, Memory, Network usage
3. **Alerts**: Set up usage alerts in Railway settings

### Vercel Monitoring

1. **Analytics**: Vercel Dashboard → **Analytics** tab
2. **Logs**: View deployment and function logs
3. **Performance**: Monitor Core Web Vitals

### Database Monitoring

```bash
# Check connection pool status
curl https://your-backend.railway.app/health

# Response includes pool stats:
{
  "pool": {
    "total": 10,
    "idle": 8,
    "active": 2
  }
}
```

**Warning Signs:**
- `active` consistently at max (10) → increase pool size
- Many connection timeout errors → check queries

---

## Part 7: Environment Variables Reference

### Backend (Railway)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `production` | Environment mode |
| `PORT` | Yes | `${{PORT}}` | Railway auto-assigns |
| `DATABASE_URL` | Yes | `${{Postgres.DATABASE_URL}}` | Link to PostgreSQL |
| `OPENAI_API_KEY` | Optional* | `sk-proj-xxx` | OpenAI API key |
| `GEMINI_API_KEY` | Optional* | `AIzaSyxxx` | Google Gemini key |
| `DEFAULT_AI_PROVIDER` | No | `gemini` | Default: `openai` |
| `HOST` | No | `0.0.0.0` | Bind to all interfaces |

*At least one AI provider key required

### Frontend (Vercel)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `https://backend.railway.app` | Backend URL (no trailing slash) |

---

## Part 8: Deployment Automation (Optional)

### GitHub Actions CI

Create `.github/workflows/ci.yml`:

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
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Lint & Typecheck
        run: |
          cd backend && npm run lint && npm run typecheck
          cd ../frontend && npm run lint && npm run typecheck
      
      - name: Build
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build
```

**Note:** This is CI only. Railway and Vercel handle CD automatically on push to main.

---

## Summary Checklist

### Pre-Deployment
- [ ] CI passes locally (`npm run ci` from root)
- [ ] All TypeScript errors fixed
- [ ] Environment variables documented

### Railway (Backend + DB)
- [ ] PostgreSQL service created
- [ ] Backend service deployed from GitHub
- [ ] Environment variables set (PORT, DATABASE_URL, API keys)
- [ ] All 11 migrations executed
- [ ] Public domain generated
- [ ] Health endpoint returns 200 OK

### Vercel (Frontend)
- [ ] Project created and linked to GitHub
- [ ] Root directory set to `frontend`
- [ ] `NEXT_PUBLIC_API_URL` environment variable set
- [ ] Deployment successful
- [ ] Site loads without errors

### Integration
- [ ] Backend CORS updated with Vercel domain
- [ ] Frontend can call backend API
- [ ] No CORS errors in browser console
- [ ] Ideas generation works end-to-end
- [ ] Content creation with streaming works
- [ ] Database persists data correctly

### Production Hardening (Recommended)
- [ ] Error tracking setup (Sentry/LogRocket)
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Database backup strategy
- [ ] Rate limiting on API endpoints
- [ ] Usage alerts configured

---

## 🎉 Success!

Your AI Content Multiplier is now live in production!

**Next Steps:**
1. Test all features thoroughly
2. Monitor logs for errors
3. Set up alerts for downtime
4. Document any custom configurations
5. Share with users!

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Project Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

*Last updated: 2025-12-17*
