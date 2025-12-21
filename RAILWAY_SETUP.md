# 🚂 Railway Setup Guide

Step-by-step guide to deploy backend and database on Railway.

---

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Verify your email

---

## Step 2: Create New Project

1. Click **"New Project"**
2. You'll see options to provision services

---

## Step 3: Provision PostgreSQL Database

1. Click **"Provision PostgreSQL"**
2. Railway creates a PostgreSQL 15 instance with pgvector support
3. Wait ~30 seconds for provisioning

**What Railway creates:**
- Database service named "Postgres"
- Internal variables: `DATABASE_URL`, `PGHOST`, `PGPORT`, etc.
- Automatic backups
- Connection pooling

---

## Step 4: Deploy Backend Service

### 4.1 Add Service

1. In same project, click **"+ New"** → **"GitHub Repo"**
2. If first time: Click **"Configure GitHub App"**
3. Select your repository
4. Railway detects Node.js project

### 4.2 Configure Service

**Settings → General:**
- Service Name: `backend` (optional, for clarity)
- Root Directory: Leave empty (Railway auto-detects `/backend`)

**Settings → Build:**
- Build Command: `npm install && npm run build`
- Watch Paths: `backend/**` (optional, for selective rebuilds)

**Settings → Deploy:**
- Start Command: `npm start`
- Restart Policy: On failure

---

## Step 5: Set Environment Variables

Go to Backend service → **Variables** tab:

### Required Variables

```bash
NODE_ENV=production
```

```bash
PORT=${{PORT}}
```
**Important:** Use `${{PORT}}` exactly - Railway injects the port dynamically.

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
**Important:** This links to your PostgreSQL service. Use the reference, don't copy-paste the actual URL.

### AI Provider Keys

Add at least one:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

```bash
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
```

### Optional Variables

```bash
DEFAULT_AI_PROVIDER=gemini
```
Options: `openai` or `gemini`. Default is `openai` if not set.

```bash
HOST=0.0.0.0
```
Bind to all network interfaces (recommended for Railway).

---

## Step 6: Deploy

1. Railway automatically deploys when you add the service
2. Watch the **Logs** tab for build progress
3. Look for: `✅ Database connected successfully`
4. Look for: `🚀 Server running at http://0.0.0.0:XXXX`

**Build takes:** ~2-3 minutes first time

---

## Step 7: Generate Public URL

1. Backend service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Railway creates: `https://your-backend-production-xxxx.railway.app`
4. **Copy this URL** - you'll need it for Vercel

---

## Step 8: Run Database Migrations

### Option A: Railway CLI (Recommended)

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run automated migration script
railway run node backend/run-all-migrations.js
```

### Option B: Manual via SQL Console

1. Go to PostgreSQL service → **Data** tab
2. Click **"Query"**
3. Copy content from each file in `backend/migrations/`:
   - `001_add_brief_flowmap_approved.sql`
   - `002_add_content_packs.sql`
   - ... (all 11 files in order)
4. Paste and execute each one

### Option C: Individual Files via CLI

```bash
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

---

## Step 9: Verify Deployment

### Test Health Endpoint

```bash
curl https://your-backend-production-xxxx.railway.app/health
```

**Expected response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-17T10:30:00.000Z",
  "database": "connected",
  "pool": {
    "total": 10,
    "idle": 8,
    "active": 2
  }
}
```

### Check Logs

1. Backend service → **Logs** tab
2. Look for:
   - ✅ Database connected successfully
   - 🚀 Server running at...
   - No error messages

### Test Database Connection

```bash
# Connect to database
railway connect

# In PostgreSQL shell:
\dt  # List all tables

# Should see:
# - ideas
# - briefs
# - contents
# - documents
# - document_chunks
# - integration_credentials
# - content_packs
# - derivatives
# - document_versions
```

---

## Step 10: Monitor & Maintain

### View Metrics

Backend service → **Metrics** tab:
- CPU usage
- Memory usage
- Network traffic
- Request count

### Set Usage Alerts

Settings → **Usage**:
- Set monthly spending limit
- Enable email alerts at 50%, 80%, 100%

### Check Database Size

PostgreSQL service → **Metrics**:
- Storage used
- Connection count
- Query performance

---

## Troubleshooting

### Build Fails

**Check:**
1. `package.json` has `build` script
2. All dependencies listed
3. `tsconfig.json` is valid
4. No TypeScript errors (run `npm run typecheck` locally first)

**View logs:**
- Backend service → Logs → Filter by "build"

### Deploy Fails

**Common causes:**
1. Missing environment variables
2. Wrong `PORT` configuration (use `${{PORT}}`)
3. Database not linked (check `DATABASE_URL`)

**Fix:**
- Check Variables tab
- Redeploy: Settings → Deploy → Redeploy

### Health Check Returns 500

**Causes:**
1. Database connection failed
2. Migrations not run
3. Wrong `DATABASE_URL`

**Fix:**
1. Check PostgreSQL service is running
2. Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}`
3. Run migrations (see Step 8)

### "getaddrinfo ENOTFOUND"

**Cause:** Using public database URL instead of internal

**Fix:** Use variable reference:
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Not:
```bash
DATABASE_URL=postgresql://postgres:xxx@containers-us-west-xxx.railway.app:1234/railway
```

---

## Cost Estimation

**Free Tier:**
- $5 credit per month
- ~500 hours of backend runtime
- PostgreSQL included

**Typical usage:**
- Backend: ~$3-5/month (always-on)
- PostgreSQL: ~$2-3/month (storage + compute)
- Total: ~$5-8/month

**Tips to reduce costs:**
- Use Gemini (free tier) instead of OpenAI
- Set up auto-sleep for development environments
- Monitor usage alerts

---

## Next Steps

1. ✅ Backend deployed on Railway
2. ✅ Database provisioned and migrated
3. ✅ Health check passes
4. ➡️ **Next:** Deploy frontend on Vercel (see `VERCEL_SETUP.md`)

---

## Quick Reference

**Railway Dashboard:** https://railway.app/dashboard

**CLI Commands:**
```bash
railway login          # Login to Railway
railway link           # Link to project
railway logs           # View logs
railway run <cmd>      # Run command with env vars
railway connect        # Connect to database
railway status         # Check deployment status
```

**Environment Variables:**
- `NODE_ENV=production`
- `PORT=${{PORT}}`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `OPENAI_API_KEY=sk-proj-xxx`
- `GEMINI_API_KEY=AIzaSyxxx`
- `DEFAULT_AI_PROVIDER=gemini`
- `HOST=0.0.0.0`

---

*For complete deployment guide, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)*
