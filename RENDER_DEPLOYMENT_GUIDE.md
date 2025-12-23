# 🚀 HƯỚNG DẪN DEPLOY LÊN RENDER.COM (FREE)

> **Tình huống:** Railway trial chỉ cho deploy database, không deploy service.  
> **Giải pháp:** Dùng Render.com (FREE) cho backend + Railway (FREE) cho PostgreSQL.

---

## 📦 PHẦN 1: LẤY DATABASE_URL TỪ RAILWAY

### Bước 1.1: Truy cập Railway Postgres Service

1. Mở Railway dashboard: https://railway.com/project/23dd34d4-dad9-489a-a071-47f9bd370e38
2. Click vào service **"Postgres"** (màu xanh dương)
3. Click tab **"Variables"**

### Bước 1.2: Copy DATABASE_URL

Trong tab Variables, bạn sẽ thấy:

```bash
DATABASE_URL=postgresql://postgres:...@...railway.app:5432/railway
```

**👉 COPY toàn bộ giá trị này** (bao gồm cả `DATABASE_URL=...`)

**❌ QUAN TRỌNG:** Railway có thể hiển thị dạng Reference như `${{Postgres.DATABASE_URL}}`. Nếu thấy vậy:
- Click vào icon "View Raw" hoặc "Copy"
- Copy giá trị thực (bắt đầu bằng `postgresql://`)

### Bước 1.3: Lưu vào file tạm

Paste vào Notepad và lưu tạm để dùng cho Render.

**Format sẽ giống như:**
```
postgresql://postgres:PASSWORD@monorail.proxy.rlwy.net:12345/railway
```

---

## 🎯 PHẦN 2: DEPLOY BACKEND LÊN RENDER.COM

### Bước 2.1: Đăng ký Render.com

1. Mở https://render.com
2. Click **"Get Started for Free"**
3. Chọn **"Sign in with GitHub"** (khuyến nghị)
4. Authorize Render to access GitHub

### Bước 2.2: Tạo Web Service mới

1. Trong Render dashboard, click **"New +"** → **"Web Service"**
2. Chọn repository: **`nguyen09do-dev/app-laptrinh1`**
3. Click **"Connect"**

### Bước 2.3: Configure Web Service

Điền thông tin như sau:

| Field | Value |
|-------|-------|
| **Name** | `ai-content-backend` (hoặc tên khác) |
| **Region** | `Singapore` (gần Việt Nam nhất) |
| **Branch** | `main` |
| **Root Directory** | `backend` ← **QUAN TRỌNG!** |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

**⚠️ Lưu ý:** 
- **Root Directory** phải là `backend` vì backend nằm trong thư mục con
- Free tier sẽ tự động sleep sau 15 phút không hoạt động

### Bước 2.4: Thêm Environment Variables

Scroll xuống phần **"Environment Variables"**, click **"Add Environment Variable"** và thêm các biến sau:

#### ✅ REQUIRED (Bắt buộc)

```bash
# 1. Node.js Environment
NODE_ENV=production

# 2. Database (từ Railway)
DATABASE_URL=postgresql://postgres:PASSWORD@monorail.proxy.rlwy.net:12345/railway

# 3. Server Port (Render tự động cấp)
PORT=$PORT

# 4. Session Secret (tạo random string)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# 5. Encryption Key (tạo random string 32 ký tự)
ENCRYPTION_KEY=your-32-character-encryption-key!!
```

#### 🔑 AI PROVIDER KEYS (Chọn ít nhất 1)

```bash
# Google Gemini (KHUYẾN NGHỊ - FREE)
GEMINI_API_KEY=AIzaSy...
DEFAULT_AI_PROVIDER=gemini

# Hoặc OpenAI
OPENAI_API_KEY=sk-proj-...
DEFAULT_AI_PROVIDER=openai

# Hoặc cả 2 (app sẽ dùng DEFAULT_AI_PROVIDER)
```

**🔗 Lấy API keys:**
- **Gemini**: https://aistudio.google.com/app/apikey (FREE, unlimited requests)
- **OpenAI**: https://platform.openai.com/api-keys (Pay-as-you-go)

#### 📊 OPTIONAL (Không bắt buộc)

```bash
# Anthropic Claude (nếu muốn dùng)
ANTHROPIC_API_KEY=sk-ant-...

# DeepSeek (nếu muốn dùng)
DEEPSEEK_API_KEY=sk-...

# Host (Render tự động set, không cần thêm)
# HOST=0.0.0.0
```

### Bước 2.5: Deploy!

1. Click **"Create Web Service"** ở cuối trang
2. Render sẽ bắt đầu build và deploy
3. Đợi 3-5 phút để hoàn thành

**Theo dõi logs:**
- Tab **"Logs"** sẽ hiển thị quá trình build
- Tìm dòng: `✓ Build successful!`
- Sau đó: `Server started on port 10000` (hoặc port khác)

### Bước 2.6: Lấy Backend URL

Sau khi deploy thành công:

1. Lên đầu trang, bạn sẽ thấy URL dạng:
   ```
   https://ai-content-backend.onrender.com
   ```
2. **COPY URL này** - cần dùng cho:
   - Vercel frontend
   - Test health check
   - Run migrations

---

## 🗄️ PHẦN 3: CHẠY DATABASE MIGRATIONS

### Cách 1: Dùng Render Shell (KHUYẾN NGHỊ)

1. Trong Render dashboard, vào service **ai-content-backend**
2. Click tab **"Shell"** ở menu bên trái
3. Chạy lệnh:

```bash
node backend/run-all-migrations.js
```

4. Kiểm tra output - phải thấy:
   ```
   ✅ All migrations completed successfully!
   ```

### Cách 2: Dùng Local với Railway DATABASE_URL

Nếu Render Shell không work, chạy từ máy local:

1. Mở terminal tại thư mục project
2. Set DATABASE_URL:

```powershell
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:PASSWORD@monorail.proxy.rlwy.net:12345/railway"
node backend/run-all-migrations.js
```

```bash
# Mac/Linux
export DATABASE_URL="postgresql://postgres:PASSWORD@monorail.proxy.rlwy.net:12345/railway"
node backend/run-all-migrations.js
```

### Cách 3: Dùng Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link 23dd34d4-dad9-489a-a071-47f9bd370e38

# Run migrations
railway run node backend/run-all-migrations.js
```

---

## ✅ PHẦN 4: VERIFY BACKEND

### Test 1: Health Check

```bash
curl https://ai-content-backend.onrender.com/health
```

**Kết quả mong đợi:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-17T...",
  "database": "connected"
}
```

### Test 2: Check Database Tables

Vào Railway → Postgres → Data tab, kiểm tra có các tables:
- `users`
- `ideas`
- `briefs`
- `contents`
- `derivatives`
- `documents`
- `document_chunks`
- `integration_credentials`

---

## 🌐 PHẦN 5: DEPLOY FRONTEND LÊN VERCEL

### Bước 5.1: Đăng nhập Vercel

1. Mở https://vercel.com
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel

### Bước 5.2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Chọn repository: **`nguyen09do-dev/app-laptrinh1`**
3. Click **"Import"**

### Bước 5.3: Configure Project

| Field | Value |
|-------|-------|
| **Project Name** | `ai-content-studio` (hoặc tên khác) |
| **Framework Preset** | `Next.js` (tự động detect) |
| **Root Directory** | `frontend` ← **QUAN TRỌNG!** |
| **Build Command** | `npm run build` (mặc định) |
| **Output Directory** | `.next` (mặc định) |

### Bước 5.4: Environment Variables

Click **"Environment Variables"**, thêm:

```bash
NEXT_PUBLIC_API_URL=https://ai-content-backend.onrender.com
```

**❌ KHÔNG có trailing slash!**

### Bước 5.5: Deploy!

1. Click **"Deploy"**
2. Đợi 2-3 phút
3. Vercel sẽ cho bạn URL:
   ```
   https://ai-content-studio.vercel.app
   ```

---

## 🔗 PHẦN 6: CẬP NHẬT CORS

### Bước 6.1: Update Backend CORS

Mở file `g:\Code01-HWAIcontentmulti\backend\src\index.ts`:

```typescript
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://ai-content-studio.vercel.app',  // ← Thêm Vercel production URL
    /\.vercel\.app$/  // ← Cho phép tất cả Vercel preview deployments
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Bước 6.2: Commit và Push

```bash
git add backend/src/index.ts
git commit -m "fix: add Vercel domain to CORS"
git push origin main
```

### Bước 6.3: Render sẽ tự động re-deploy

Render có auto-deploy enabled mặc định. Sau 2-3 phút, backend sẽ có CORS mới.

---

## 🧪 PHẦN 7: TEST TOÀN BỘ HỆ THỐNG

### Test 1: Frontend Load

Mở https://ai-content-studio.vercel.app

- ✅ Trang chủ hiển thị bình thường
- ✅ Navbar có các menu: Ideas, Briefs, Content, etc.

### Test 2: Generate Ideas

1. Click **"Ideas"** trong navbar
2. Click **"Generate Ideas"**
3. Điền:
   - **Persona**: Developer
   - **Industry**: Technology
4. Click **"Generate 5 Ideas (Miễn phí với Gemini)"**
5. Đợi 5-10 giây
6. ✅ Phải thấy 5 ideas mới xuất hiện

### Test 3: Create Brief

1. Click vào 1 idea vừa tạo
2. Click **"Create Brief"**
3. ✅ Brief được tạo và hiển thị

### Test 4: Check Database

Vào Railway → Postgres → Data:
- Table `ideas` có data
- Table `briefs` có data

---

## 📊 PHẦN 8: MONITORING & TROUBLESHOOTING

### Render Logs

- **Build logs**: Tab "Logs" → Filter "Build"
- **Runtime logs**: Tab "Logs" → Filter "Deploy"
- **Errors**: Tự động highlight màu đỏ

### Vercel Logs

- **Build logs**: Project → Deployments → Click vào deployment → "Build Logs"
- **Function logs**: Project → Deployments → "Functions" tab

### Railway Logs

- Postgres → Deployments → Logs (ít khi cần)

### Common Issues

#### 1. Backend không start

**Lỗi:** `Error: Cannot find module`

**Fix:**
- Kiểm tra `Root Directory` = `backend`
- Kiểm tra `Build Command` = `npm install && npm run build`

#### 2. Database connection failed

**Lỗi:** `ECONNREFUSED` hoặc `password authentication failed`

**Fix:**
- Kiểm tra `DATABASE_URL` đúng format
- Kiểm tra không có space thừa
- Kiểm tra Railway Postgres đang chạy

#### 3. CORS errors trên frontend

**Lỗi:** `Access to fetch at '...' from origin '...' has been blocked by CORS`

**Fix:**
- Kiểm tra đã add Vercel URL vào CORS
- Commit và push code mới
- Đợi Render re-deploy

#### 4. Frontend không gọi được API

**Lỗi:** `Failed to fetch` hoặc `Network request failed`

**Fix:**
- Kiểm tra `NEXT_PUBLIC_API_URL` không có trailing slash
- Redeploy Vercel sau khi thêm env var

---

## 🎉 HOÀN TẤT!

Sau khi hoàn thành tất cả steps trên, bạn đã có:

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| **Database** | Railway | Internal | ✅ Free |
| **Backend** | Render.com | https://ai-content-backend.onrender.com | ✅ Free |
| **Frontend** | Vercel | https://ai-content-studio.vercel.app | ✅ Free |

### Next Steps

1. ✅ Test toàn bộ workflow (Ideas → Briefs → Content → Derivatives)
2. ✅ Setup social media integrations (WordPress, Mailchimp, etc.)
3. ✅ Upload documents for RAG
4. 🎨 Customize UI/branding
5. 📈 Monitor usage và performance

---

## 💡 PRO TIPS

### Render Free Tier

- ⏱️ Sleep sau 15 phút không dùng
- 🔄 Wake-up time: 30-60 giây
- 💾 Storage: Ephemeral (mất data sau mỗi deploy)
- 🌐 Bandwidth: 100GB/month

**Giữ service awake:**
- Dùng cron job ping mỗi 10 phút
- Hoặc upgrade lên Paid ($7/month)

### Vercel Free Tier

- ⚡ 100GB bandwidth/month
- 🚀 6000 build minutes/month
- 🔄 100 deployments/day

### Railway Free Trial

- 💵 $5 credit hoặc 23 ngày
- 💾 1GB PostgreSQL storage
- 🚀 Sau hết trial: $5/month cho Hobby plan

---

**🤖 Generated by Claude Code**  
**📅 Last updated: 2025-12-17**
