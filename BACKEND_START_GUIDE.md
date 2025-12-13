# 🔧 BACKEND START GUIDE - Fix Lỗi Backend

## ❌ Vấn Đề Hiện Tại

Backend không chạy được, frontend báo lỗi:
```
Failed to fetch packs: TypeError: Failed to fetch
```

## ✅ Giải Pháp

### Cách 1: Sử dụng Batch File (Dễ nhất)

**Double-click file này**:
```
backend/start-backend-simple.bat
```

Hoặc chạy trong terminal:
```bash
cd backend
start-backend-simple.bat
```

### Cách 2: Chạy trực tiếp trong Terminal

**Mở CMD hoặc PowerShell**:
```bash
cd G:\Code01-HWAIcontentmulti\backend
tsx watch src/index.ts
```

### Cách 3: Sử dụng npm (nếu PowerShell policy cho phép)

```bash
cd backend
npm run dev
```

## 🔍 Kiểm Tra Backend Đã Chạy

### 1. Kiểm tra port 3001:
```powershell
netstat -ano | findstr ":3001" | findstr "LISTEN"
```

Nếu thấy output → Backend đang chạy ✅

### 2. Test health endpoint:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET
```

Nếu trả về status 200 → Backend OK ✅

### 3. Kiểm tra trong browser:
Mở: `http://localhost:3001/health`

Nếu thấy JSON response → Backend OK ✅

## 🐛 Troubleshooting

### Lỗi: "tsx: command not found"
**Giải pháp**:
```bash
cd backend
npm install
```

### Lỗi: "Cannot find module"
**Giải pháp**:
```bash
cd backend
npm install
```

### Lỗi: "Port 3001 already in use"
**Giải pháp**:
1. Tìm process đang dùng port:
```powershell
netstat -ano | findstr ":3001"
```

2. Kill process:
```powershell
taskkill /PID <PID_NUMBER> /F
```

### Lỗi: "Database connection failed"
**Giải pháp**:
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra `.env` file có đúng DATABASE_URL không
3. Test connection:
```bash
psql -U postgres -d ai_ideas_db
```

## 📋 Checklist

Trước khi start backend, đảm bảo:
- [ ] Node.js đã cài (v18+)
- [ ] Dependencies đã install (`npm install` trong `backend/`)
- [ ] PostgreSQL đang chạy
- [ ] `.env` file có DATABASE_URL đúng
- [ ] Port 3001 không bị chiếm bởi process khác

## 🚀 Sau Khi Backend Chạy

1. **Kiểm tra logs** trong terminal:
   - Nếu thấy "Server listening on port 3001" → OK ✅
   - Nếu thấy errors → Đọc và fix

2. **Test từ frontend**:
   - Mở `http://localhost:3000/dashboard`
   - Kiểm tra console (F12)
   - Nếu không còn "Failed to fetch" → OK ✅

3. **Test API trực tiếp**:
   ```bash
   curl http://localhost:3001/health
   ```

## 📝 Lưu Ý

- Backend cần chạy **trước** khi test frontend
- Nếu backend crash, check logs để tìm lỗi
- WordPress service mới tạo, có thể có lỗi runtime → check logs

## 🆘 Nếu Vẫn Không Chạy Được

1. **Check logs** trong terminal window
2. **Copy error message** và báo cho tôi
3. **Kiểm tra**:
   - Node version: `node --version` (cần v18+)
   - npm version: `npm --version`
   - TypeScript: `npx tsc --version`

---

**File này được tạo để giúp bạn start backend dễ dàng hơn!** 🚀

