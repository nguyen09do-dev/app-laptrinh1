# ▲ Vercel Setup Guide

Step-by-step guide to deploy frontend on Vercel.

---

## Prerequisites

- Railway backend deployed and running
- Backend public URL (e.g., `https://your-backend.railway.app`)
- GitHub repository with your code

---

## Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

---

## Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find your repository in the list
4. Click **"Import"**

---

## Step 3: Configure Project

### Framework Detection

Vercel automatically detects:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Root Directory

**Important:** Set root directory to `frontend`

1. Click **"Edit"** next to Root Directory
2. Enter: `frontend`
3. This tells Vercel to build from the `frontend/` folder

---

## Step 4: Set Environment Variables

**Before deploying**, add environment variables:

1. Expand **"Environment Variables"** section
2. Add the following:

**Variable Name:**
```
NEXT_PUBLIC_API_URL
```

**Value:**
```
https://your-backend.railway.app
```

**Important:**
- Replace with your actual Railway backend URL
- ❌ NO trailing slash: `https://...app/` is wrong
- ✅ Correct format: `https://...app`

**Apply to:**
- ✅ Production
- ✅ Preview
- ✅ Development

---

## Step 5: Deploy

1. Click **"Deploy"**
2. Vercel builds your project (takes 2-3 minutes)
3. Watch the build logs

**Build steps:**
- Install dependencies
- Run `npm run build`
- Optimize images and assets
- Generate static pages

---

## Step 6: Get Production URL

After successful deployment:

1. You'll see: **"Congratulations! Your project has been deployed"**
2. Copy the production URL: `https://your-app.vercel.app`
3. Click **"Visit"** to open your app

---

## Step 7: Verify Deployment

### Homepage Loads

1. Open `https://your-app.vercel.app`
2. Should see the homepage
3. Check browser console (F12) for errors

**Expected:**
- ✅ Page loads without errors
- ✅ No 404s in console
- ✅ Styles load correctly

### Test API Connection

1. Navigate to **Ideas** page
2. Enter test data:
   - Persona: "Developer"
   - Industry: "Technology"
3. Click **"Generate Ideas"**

**If CORS error appears:**
- This is expected! Continue to Step 8.

---

## Step 8: Update Backend CORS

Your backend needs to allow requests from Vercel domain.

### Edit Backend Code

Open `backend/src/index.ts` and update CORS configuration:

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

### Commit and Push

```bash
git add backend/src/index.ts
git commit -m "feat: add Vercel domain to CORS whitelist"
git push origin main
```

Railway will automatically redeploy your backend (~1-2 minutes).

---

## Step 9: Test End-to-End

After backend redeploys:

### Test Ideas Generation

1. Refresh your Vercel app
2. Go to Ideas page
3. Click **"Generate Ideas"**
4. Should see 10 ideas generated
5. No CORS errors in console

### Test Content Creation

1. Select an idea
2. Click **"Create Brief"**
3. Brief should generate
4. Click **"Generate Content"**
5. Content should stream in real-time

### Test All Features

- ✅ Ideas: Generate, view, edit, delete
- ✅ Briefs: Create from ideas
- ✅ Content: Generate with streaming
- ✅ Derivatives: Create variations
- ✅ Documents: Upload and query (RAG)
- ✅ Publisher: Connect integrations

---

## Step 10: Custom Domain (Optional)

### Add Custom Domain

1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `yourdomain.com`
4. Follow DNS configuration instructions

### Update Backend CORS

Add your custom domain to CORS:

```typescript
origin: [
  'http://localhost:3000',
  'https://your-app.vercel.app',
  'https://yourdomain.com',  // Add custom domain
  /\.vercel\.app$/
],
```

---

## Monitoring & Analytics

### Enable Analytics

1. Vercel Dashboard → Your Project → **Analytics**
2. Enable **Web Analytics** (free)
3. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### View Logs

1. Vercel Dashboard → Your Project → **Logs**
2. Filter by:
   - Build logs
   - Function logs
   - Static requests

### Performance Monitoring

1. **Speed Insights** tab
2. View Core Web Vitals:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

---

## Troubleshooting

### Build Fails

**Common causes:**
1. TypeScript errors
2. Missing dependencies
3. Wrong root directory

**Fix:**
1. Run `npm run build` locally first
2. Check Vercel build logs
3. Verify root directory is `frontend`

### "Failed to fetch" Error

**Cause:** Wrong `NEXT_PUBLIC_API_URL`

**Fix:**
1. Check environment variable
2. Ensure NO trailing slash
3. Verify backend is running (test health endpoint)
4. Redeploy after fixing

### CORS Error

**Cause:** Backend doesn't allow Vercel domain

**Fix:**
1. Update `backend/src/index.ts` CORS config
2. Add Vercel URL to `origin` array
3. Commit and push (Railway auto-redeploys)

### Environment Variable Not Working

**Cause:** Vercel caches builds

**Fix:**
1. Settings → Environment Variables
2. Edit the variable
3. Click **"Redeploy"** (not just save)

### Preview Deployments Fail

**Cause:** Preview URLs not in CORS whitelist

**Fix:**
Add regex to backend CORS:
```typescript
origin: [
  // ... other origins
  /\.vercel\.app$/  // Matches all Vercel domains
],
```

---

## Automatic Deployments

### Production Deployments

Vercel automatically deploys when you push to `main` branch:

```bash
git push origin main
```

### Preview Deployments

Vercel creates preview deployments for:
- Pull requests
- Pushes to other branches

Each preview gets a unique URL:
- `https://your-app-git-feature-branch.vercel.app`

---

## Cost Estimation

**Free Tier (Hobby):**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Web Analytics

**Typical usage:**
- Small app: $0/month (stays in free tier)
- Medium traffic: ~$0-20/month
- High traffic: Consider Pro plan ($20/month)

---

## Best Practices

### Environment Variables

- Use `NEXT_PUBLIC_` prefix for client-side variables
- Never commit secrets to git
- Use different values for Production/Preview/Development

### Deployments

- Test locally before pushing
- Use preview deployments for testing
- Only merge to `main` when ready for production

### Performance

- Use Next.js `<Image>` component (not `<img>`)
- Enable Vercel Analytics
- Monitor Core Web Vitals
- Optimize images and assets

---

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard

**CLI Commands:**
```bash
npm install -g vercel    # Install Vercel CLI
vercel login             # Login to Vercel
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View logs
vercel env ls            # List environment variables
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

**Deployment URLs:**
- Production: `https://your-app.vercel.app`
- Preview: `https://your-app-git-branch.vercel.app`

---

## Next Steps

1. ✅ Frontend deployed on Vercel
2. ✅ Backend CORS updated
3. ✅ End-to-end testing complete
4. ➡️ **Next:** Monitor and maintain (see `DEPLOYMENT_GUIDE.md`)

---

*For complete deployment guide, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)*


