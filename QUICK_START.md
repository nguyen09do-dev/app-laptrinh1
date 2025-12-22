# 🚀 Quick Start Guide - Content Hub Multi-platform Publisher

**Last Updated**: 2025-12-15  
**Status**: ✅ Production Ready

---

## ⚡ Start Everything (Windows)

### 1️⃣ Start PostgreSQL (Docker)
```bash
cd backend
docker-compose up -d
```

### 2️⃣ Start Backend
```bash
cd backend
node start-backend-direct.js
```
**OR** (if Node doesn't work):
```bash
npm run dev
```

### 3️⃣ Start Frontend
```bash
cd frontend
npm run dev
```

---

## 🌐 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main UI |
| **Backend API** | http://localhost:3001 | REST API |
| **Publisher Page** | http://localhost:3000/publisher | 🎯 **New Design!** |
| **Content Studio** | http://localhost:3000/content-studio | Create drafts |
| **Library** | http://localhost:3000/library | Approved content |
| **Briefs** | http://localhost:3000/briefs | Content briefs |

---

## 🎯 Using the New Publisher

### Quick Workflow:

#### **Tab 1: Content** (Publishing)
1. **Left Panel**: Select content from library
   - Search if needed
   - Click to select (purple highlight)
   
2. **Right Panel**: Check platforms
   - ✅ = Connected & ready
   - ⚠️ = Needs configuration
   - Check multiple platforms at once
   
3. **Publish**: Click "Publish to X Platforms"
   - Publishes to all checked platforms
   - Shows progress for each
   - Toast notifications on success/fail

#### **Tab 2: Integrations** (Setup)
1. Configure each platform:
   - **Mailchimp**: API key, server prefix, audience ID
   - **WordPress**: Site URL, credentials, settings
   - **Social Media**: Coming soon (Facebook, Instagram, Twitter, LinkedIn, Zalo)

2. Test connections
3. Edit/Update credentials
4. Disconnect if needed

---

## ✅ First Time Setup

### 1. Configure Mailchimp
1. Go to: http://localhost:3000/publisher
2. Click **"Integrations"** tab
3. Find **Mailchimp** → Click **"Configure"**
4. Enter:
   - API Key (from Mailchimp account)
   - Server Prefix (e.g., `us12`)
   - Audience List ID
   - From Name
   - From Email
   - Reply-to Email
5. Click **"Test Connection"**
6. Click **"Save Configuration"**

### 2. Configure WordPress
1. Still in **"Integrations"** tab
2. Find **WordPress** → Click **"Configure"**
3. Fill in **3 tabs**:
   - **Basic**: Site URL, Name, Category
   - **Authentication**: Username, App Password
   - **Advanced**: Timeouts, rate limits, features
4. Click **"Test Connection"**
5. Click **"Save Configuration"**

### 3. Create Content
1. Go to **Content Studio**: http://localhost:3000/content-studio
2. Create a brief (or select existing)
3. Generate content
4. Approve it (moves to Library)

### 4. Publish!
1. Go to **Publisher**: http://localhost:3000/publisher
2. **Content tab** → Select your content
3. Check **Mailchimp** and/or **WordPress**
4. Click **"Publish to X Platforms"**
5. ✅ Done!

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <PID> /F

# Restart backend
cd backend
node start-backend-direct.js
```

### Database connection error
```bash
# Check PostgreSQL Docker
docker ps

# Should see: postgres container running on port 5432

# Restart if needed
cd backend
docker-compose down
docker-compose up -d
```

### Frontend not loading
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill if needed
taskkill /PID <PID> /F

# Clear cache and restart
cd frontend
rm -rf .next
npm run dev
```

### "Failed to fetch" errors
1. ✅ Backend running? Check http://localhost:3001/api/health
2. ✅ PostgreSQL running? Check `docker ps`
3. ✅ CORS configured? Should be auto-configured
4. ✅ Firewall blocking? Check Windows Firewall

---

## 📊 Health Check

### All Services Running?
```bash
# Check all ports
netstat -ano | findstr "3000 3001 5432"
```

**Should see**:
- `:3000` - Frontend (Next.js)
- `:3001` - Backend (Fastify)
- `:5432` - PostgreSQL (Docker)

### Quick Test
1. Backend health: http://localhost:3001/api/health
2. Frontend loads: http://localhost:3000
3. Publisher works: http://localhost:3000/publisher

---

## 🎨 What's New in Publisher?

### ✨ Major Changes
- ✅ **2 Tabs** instead of 3-step wizard
- ✅ **Split screen** layout (content + platforms)
- ✅ **Multi-platform publish** in one click
- ✅ **Separate Integrations** tab for config
- ✅ **Checkbox selection** for platforms
- ✅ **Real-time status** indicators

### 🔄 Old vs New Workflow

#### Old (3 Steps)
1. Select Content → Next
2. Generate Derivatives → Generate
3. Publish to Platforms → One by one

**Total**: 5+ clicks per platform

#### New (2 Tabs)
1. Select Content
2. Check Platforms
3. Publish to All

**Total**: 3 clicks for all platforms! ⚡

---

## 📱 Supported Platforms

### ✅ Currently Available
- **Mailchimp** - Email marketing
- **WordPress** - Blog publishing

### 🚧 Coming Soon
- **Facebook** - Social posts
- **Instagram** - Photos & stories
- **Twitter** - Tweets
- **LinkedIn** - Professional posts
- **Zalo** - Messaging (Vietnam)

---

## 💡 Pro Tips

### 1. Batch Publishing
- Select 1 content
- Check multiple platforms
- Publish to all at once
- Save time! ⚡

### 2. Test Connections First
- Always test before publishing
- Use "Test Connection" in Integrations tab
- Fix issues before going live

### 3. Content Preparation
- Write in **Markdown** in Content Studio
- Automatically converts to HTML for Mailchimp
- Automatically formats for WordPress

### 4. Monitor Results
- Check toast notifications
- Green = Success ✅
- Red = Failed ❌
- Review and retry if needed

---

## 🎉 You're Ready!

Everything is set up and ready to use! Start publishing content to multiple platforms with ease! 🚀

**Questions?** Check the detailed docs:
- `PUBLISHER_FINAL_IMPLEMENTATION.md` - Full technical details
- `TEST_DEMO.md` - Testing guide
- Backend README - API documentation

---

*Have fun publishing!* 🎊



