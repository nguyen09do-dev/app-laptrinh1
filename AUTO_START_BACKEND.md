# 🚀 AUTO-START BACKEND GUIDE

## ⚠️ Vấn Đề Hiện Tại

Backend **KHÔNG chạy** trong Docker. Chỉ PostgreSQL chạy trong Docker.

Backend cần chạy **local** với `tsx watch`.

## 🔧 Cách Start Backend

### Option 1: Sử dụng Batch File
Double-click: `backend/start-backend-simple.bat`

### Option 2: Chạy trong CMD
```bash
cd G:\Code01-HWAIcontentmulti\backend
tsx watch src/index.ts
```

### Option 3: Sử dụng npm (nếu PowerShell cho phép)
```bash
cd backend
npm run dev
```

## 📊 Kiểm Tra Backend Đã Chạy

### 1. Check Port:
```powershell
netstat -ano | findstr ":3001" | findstr "LISTEN"
```

### 2. Test Health:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health"
```

### 3. Test trong Browser:
Mở: `http://localhost:3001/health`

## 🐛 Nếu Backend Không Start

**Check CMD window** để xem lỗi:

### Lỗi thường gặp:

1. **"Cannot find module"**
   - Chạy: `cd backend && npm install`

2. **"Port 3001 already in use"**
   - Kill process: `netstat -ano | findstr ":3001"`
   - `taskkill /PID <PID> /F`

3. **"Database connection failed"**
   - Check PostgreSQL Docker: `docker ps | Select-String postgres`
   - Check `.env` file có DATABASE_URL đúng

4. **TypeScript errors**
   - Check file `backend/src/services/wordpress.service.ts` line 237
   - Đã fix lỗi syntax (missing closing quote)

## ✅ Sau Khi Backend Chạy

1. **Verify**: `http://localhost:3001/health` → Should return JSON
2. **Test Frontend**: `http://localhost:3000/dashboard` → Should load data
3. **Check Console**: No more "Failed to fetch" errors

---

**Note**: Backend window sẽ hiển thị logs. Nếu có lỗi, sẽ thấy ngay trong window đó.






