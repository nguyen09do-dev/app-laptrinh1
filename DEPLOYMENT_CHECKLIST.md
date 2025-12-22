# 🚀 Deployment Checklist

Quick reference checklist for deploying to production.

---

## Pre-Deployment

- [ ] Run `npm run ci` from root - all checks pass
- [ ] All TypeScript errors fixed (0 errors)
- [ ] Backend builds successfully (`cd backend && npm run build`)
- [ ] Frontend builds successfully (`cd frontend && npm run build`)
- [ ] Have OpenAI or Gemini API key ready
- [ ] GitHub repo is up to date

---

## Railway Setup (Backend + Database)

### Database
- [ ] Create Railway account
- [ ] New Project → Provision PostgreSQL
- [ ] Note down database service name (e.g., "Postgres")

### Backend Service
- [ ] Add New Service → GitHub Repo
- [ ] Connect repository
- [ ] Root directory: Leave empty or set to `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=${{PORT}}`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `OPENAI_API_KEY=sk-proj-xxx` (or Gemini)
- [ ] `GEMINI_API_KEY=AIzaSyxxx` (or OpenAI)
- [ ] `DEFAULT_AI_PROVIDER=gemini` (or openai)
- [ ] `HOST=0.0.0.0`

### Migrations
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Link project: `railway link`
- [ ] Run migrations: `railway run node backend/run-all-migrations.js`
- [ ] Or run each .sql file manually via Railway SQL console

### Networking
- [ ] Generate public domain for backend
- [ ] Copy URL: `https://your-backend.railway.app`
- [ ] Test health: `curl https://your-backend.railway.app/health`
- [ ] Should return: `{ "status": "ok", "database": "connected" }`

---

## Vercel Setup (Frontend)

### Project Creation
- [ ] Create Vercel account
- [ ] New Project → Import Git Repository
- [ ] Select your repository
- [ ] Framework: Next.js (auto-detected)
- [ ] Root directory: `frontend`

### Environment Variables
- [ ] Add `NEXT_PUBLIC_API_URL`
- [ ] Value: `https://your-backend.railway.app` (NO trailing slash!)
- [ ] Apply to: Production, Preview, Development

### Deployment
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Copy Vercel URL: `https://your-app.vercel.app`

---

## Integration

### Update Backend CORS
- [ ] Edit `backend/src/index.ts`
- [ ] Add Vercel URL to CORS `origin` array
- [ ] Add regex: `/\.vercel\.app$/` for preview deployments
- [ ] Commit and push
- [ ] Railway auto-redeploys

---

## Verification

### Backend Health
- [ ] `curl https://your-backend.railway.app/health`
- [ ] Returns 200 OK
- [ ] `"status": "ok"`
- [ ] `"database": "connected"`

### Frontend Loads
- [ ] Open `https://your-app.vercel.app`
- [ ] Homepage loads without errors
- [ ] No console errors
- [ ] No CORS errors

### Test Ideas Generation
- [ ] Navigate to Ideas page
- [ ] Enter persona: "Developer"
- [ ] Enter industry: "Technology"
- [ ] Click "Generate Ideas"
- [ ] 10 ideas appear
- [ ] Ideas saved to database

### Test Content Creation
- [ ] Select an idea
- [ ] Click "Create Brief"
- [ ] Brief generates successfully
- [ ] Click "Generate Content"
- [ ] Content streams in real-time
- [ ] Content saves to database

### Test RAG (Optional)
- [ ] Go to Documents page
- [ ] Upload a PDF or DOCX
- [ ] File processes successfully
- [ ] Try searching documents
- [ ] Results appear

### Database Check
- [ ] `railway connect`
- [ ] `\dt` - list tables
- [ ] `SELECT COUNT(*) FROM ideas;` - should show records
- [ ] `SELECT COUNT(*) FROM contents;` - should show records

---

## Post-Deployment

### Monitoring Setup
- [ ] Check Railway logs for errors
- [ ] Check Vercel logs for errors
- [ ] Set up Railway usage alerts
- [ ] Enable Vercel Analytics (optional)

### Documentation
- [ ] Update README with production URLs
- [ ] Document environment variables
- [ ] Add troubleshooting notes
- [ ] Share access with team

### Optional Hardening
- [ ] Set up error tracking (Sentry)
- [ ] Add uptime monitoring (UptimeRobot)
- [ ] Configure database backups
- [ ] Add rate limiting to API
- [ ] Set up CI/CD with GitHub Actions

---

## Common Issues

### "ERR_INVALID_URL"
- Check `DATABASE_URL` format
- Use `${{Postgres.DATABASE_URL}}` not copy-paste

### "Failed to fetch"
- Check `NEXT_PUBLIC_API_URL` has no trailing slash
- Verify backend CORS includes Vercel domain
- Confirm backend is running

### "relation does not exist"
- Migrations not run
- Run `railway run node backend/run-all-migrations.js`

### CORS errors
- Add Vercel URL to backend CORS config
- Commit and push to redeploy

---

## Success Criteria

✅ All items checked above
✅ No errors in Railway logs
✅ No errors in Vercel logs
✅ Can generate ideas end-to-end
✅ Can create content with streaming
✅ Database persists data
✅ No CORS errors

---

## 🎉 Done!

Your app is live in production!

**URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`
- Health: `https://your-backend.railway.app/health`

---

*For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)*

