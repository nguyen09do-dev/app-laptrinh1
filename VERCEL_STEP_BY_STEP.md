# 🚀 VERCEL DEPLOYMENT - STEP BY STEP (5 PHÚT)

**Backend đã LIVE:** https://ai-content-backend-2gw2.onrender.com ✅

---

## 📋 BƯỚC 1: ĐĂNG NHẬP VERCEL (1 phút)

### 1.1 Mở Vercel
```
https://vercel.com/signup
```

### 1.2 Click "Continue with GitHub"
- Authorize Vercel to access GitHub
- Chọn account: **nguyen09do-dev**

---

## 📦 BƯỚC 2: IMPORT PROJECT (1 phút)

### 2.1 Vào Dashboard
Sau khi đăng nhập, bạn sẽ thấy dashboard.

### 2.2 Click "Add New..." → "Project"

### 2.3 Tìm Repository
- Tìm: **`app-laptrinh1`**
- Hoặc scroll xuống tìm: **`nguyen09do-dev/app-laptrinh1`**

### 2.4 Click "Import"

---

## ⚙️ BƯỚC 3: CONFIGURE PROJECT (2 phút)

Vercel sẽ hiển thị form configuration. Điền như sau:

### 3.1 Project Settings

| Field | Value | Note |
|-------|-------|------|
| **Project Name** | `ai-content-studio` | Hoặc tên bạn thích |
| **Framework Preset** | `Next.js` | Tự động detect |
| **Root Directory** | `frontend` | ⚠️ **CLICK "Edit" VÀ CHỌN!** |

**⚠️ QUAN TRỌNG:** 
- **PHẢI click nút "Edit"** bên cạnh "Root Directory"
- **Chọn thư mục `frontend`** từ dropdown
- Nếu không set, build sẽ FAIL!

### 3.2 Build Settings (Giữ mặc định)

| Field | Value |
|-------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

### 3.3 Environment Variables

Click **"Environment Variables"** (expand section), thêm:

**Key:**
```
NEXT_PUBLIC_API_URL
```

**Value:**
```
https://ai-content-backend-2gw2.onrender.com
```

**⚠️ LƯU Ý:**
- ❌ KHÔNG có trailing slash `/`
- ❌ KHÔNG có dấu ngoặc kép
- ✅ Copy chính xác URL backend

**Apply to:** All environments (Production, Preview, Development)

---

## 🚀 BƯỚC 4: DEPLOY! (2 phút)

### 4.1 Click "Deploy"
Nút màu xanh ở cuối trang.

### 4.2 Đợi Build
Vercel sẽ:
1. Clone repository
2. Install dependencies (1 phút)
3. Build Next.js (1 phút)
4. Deploy to CDN (30 giây)

### 4.3 Theo dõi Logs
Bạn sẽ thấy:
```
Cloning repository...
✓ Cloned

Installing dependencies...
✓ Installed

Building...
✓ Build completed

Deploying...
✓ Deployment ready
```

### 4.4 Lấy URL
Sau khi deploy xong, Vercel sẽ hiển thị:

```
🎉 Congratulations! Your project is live!

https://ai-content-studio-xxx.vercel.app
```

**👉 COPY URL này!** Cần dùng cho CORS.

---

## 🔗 BƯỚC 5: UPDATE CORS (2 phút)

### 5.1 Mở File
Mở file: `g:\Code01-HWAIcontentmulti\backend\src\index.ts`

### 5.2 Tìm CORS Config
Tìm dòng (khoảng line 25):
```typescript
fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:3002'],
```

### 5.3 Thêm Vercel URL
Thay bằng:
```typescript
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://ai-content-studio-xxx.vercel.app',  // ← Thay URL thực của bạn
    /\.vercel\.app$/  // Cho phép tất cả Vercel preview deployments
  ],
```

### 5.4 Save File

### 5.5 Commit và Push
Mở terminal:
```bash
git add backend/src/index.ts
git commit -m "fix: add Vercel domain to CORS"
git push origin main
```

### 5.6 Đợi Render Redeploy
- Render tự động detect push mới
- Build và deploy lại (2-3 phút)
- Kiểm tra logs: "Deploy live"

---

## 🧪 BƯỚC 6: TEST HỆ THỐNG (3 phút)

### Test 1: Frontend Load ✅
1. Mở Vercel URL
2. Trang chủ hiển thị: "AI Content Studio"
3. Navbar có: Ideas, Briefs, Content, etc.

### Test 2: Backend Connection ✅
Mở DevTools (F12) → Console, không có lỗi CORS.

### Test 3: Generate Ideas ✅
1. Click **"Ideas"** trong navbar
2. Click **"Generate Ideas"** hoặc nút tương tự
3. Điền form:
   - **Persona:** Developer
   - **Industry:** Technology
4. Click **"Generate 5 Ideas"**
5. Đợi 5-10 giây
6. ✅ Thấy 5 ideas mới xuất hiện

### Test 4: Create Brief ✅
1. Click vào 1 idea vừa tạo
2. Click **"Create Brief"**
3. ✅ Brief được tạo và hiển thị

### Test 5: Database ✅
Railway → Postgres → Data:
- Table `ideas` có data
- Table `briefs` có data

---

## 🎉 HOÀN TẤT!

Sau khi hoàn thành tất cả steps, bạn có:

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| **Database** | Railway | Internal | ✅ LIVE |
| **Backend** | Render.com | https://ai-content-backend-2gw2.onrender.com | ✅ LIVE |
| **Frontend** | Vercel | https://ai-content-studio-xxx.vercel.app | 🔜 Deploy |

---

## 📞 NẾU GẶP VẤN ĐỀ

### Lỗi: "Root Directory not found"
**Fix:** Nhớ click "Edit" và chọn `frontend` folder

### Lỗi: "Build failed - Cannot find module"
**Fix:** Kiểm tra Root Directory = `frontend`

### Lỗi: CORS blocked
**Fix:** 
1. Kiểm tra đã add Vercel URL vào CORS
2. Commit và push
3. Đợi Render redeploy

### Lỗi: "Failed to fetch"
**Fix:**
1. Kiểm tra `NEXT_PUBLIC_API_URL` không có trailing slash
2. Redeploy Vercel

---

## 💡 PRO TIPS

### Vercel Auto-Deploy
Mỗi khi push code mới lên GitHub:
- Vercel tự động build và deploy
- Preview URL cho mỗi PR
- Production URL cho main branch

### Render Auto-Deploy
Mỗi khi push code backend:
- Render tự động rebuild
- Zero-downtime deployment
- Rollback nếu build fail

### Railway Database
- Backup tự động
- Point-in-time recovery
- Connection pooling

---

## 🎯 CHECKLIST CUỐI CÙNG

- [ ] Vercel deployed
- [ ] Frontend load OK
- [ ] CORS updated
- [ ] Generate ideas works
- [ ] Create brief works
- [ ] Database has data
- [ ] No console errors

---

**🤖 Generated by Claude Code**  
**📅 Created: 2025-12-23**

