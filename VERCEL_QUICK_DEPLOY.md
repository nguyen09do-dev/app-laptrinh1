# 🚀 VERCEL DEPLOYMENT - QUICK GUIDE

## ✅ Backend đã LIVE
```
https://ai-content-backend-2gw2.onrender.com
```

---

## 📦 DEPLOY FRONTEND LÊN VERCEL

### Bước 1: Đăng nhập Vercel

1. Mở: https://vercel.com
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel

### Bước 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Chọn repository: **`nguyen09do-dev/app-laptrinh1`**
3. Click **"Import"**

### Bước 3: Configure Project

| Field | Value |
|-------|-------|
| **Project Name** | `ai-content-studio` (hoặc tên khác) |
| **Framework Preset** | `Next.js` (tự động detect) |
| **Root Directory** | `frontend` ← **QUAN TRỌNG!** |
| **Build Command** | `npm run build` (mặc định) |
| **Output Directory** | `.next` (mặc định) |

### Bước 4: Environment Variables

Click **"Environment Variables"**, thêm:

```bash
NEXT_PUBLIC_API_URL=https://ai-content-backend-2gw2.onrender.com
```

**❌ KHÔNG có trailing slash!**

### Bước 5: Deploy!

1. Click **"Deploy"**
2. Đợi 2-3 phút
3. Vercel sẽ cho bạn URL:
   ```
   https://ai-content-studio.vercel.app
   ```

---

## 🔗 CẬP NHẬT CORS

Sau khi có Vercel URL, cần update backend CORS.

### File cần sửa: `backend/src/index.ts`

```typescript
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://YOUR-VERCEL-URL.vercel.app',  // ← Thay YOUR-VERCEL-URL
    /\.vercel\.app$/  // ← Cho phép tất cả Vercel preview deployments
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Commit và Push

```bash
git add backend/src/index.ts
git commit -m "fix: add Vercel domain to CORS"
git push origin main
```

Render sẽ tự động redeploy sau 2-3 phút.

---

## ✅ VERIFY TOÀN BỘ HỆ THỐNG

### Test 1: Frontend Load
Mở Vercel URL → Trang chủ hiển thị

### Test 2: Generate Ideas
1. Click "Ideas"
2. Điền Persona + Industry
3. Click "Generate 5 Ideas"
4. ✅ Thấy ideas mới

### Test 3: Database
Railway → Postgres → Data → Kiểm tra tables có data

---

## 🎉 HOÀN TẤT!

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| **Database** | Railway | Internal | ✅ Connected |
| **Backend** | Render.com | https://ai-content-backend-2gw2.onrender.com | ✅ LIVE |
| **Frontend** | Vercel | https://YOUR-APP.vercel.app | 🔜 Next |

---

**📅 Created: 2025-12-23**
