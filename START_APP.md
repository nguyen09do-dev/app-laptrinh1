# 🚀 Hướng dẫn khởi động App

## Cách 1: Khởi động thủ công (Khuyên dùng)

### Bước 1: Khởi động Backend
Mở terminal/PowerShell và chạy:
```bash
cd backend
npm run dev
```

Bạn sẽ thấy:
```
✅ Database connected successfully
🚀 Server running at http://localhost:3001
```

### Bước 2: Khởi động Frontend (Terminal mới)
Mở terminal/PowerShell **mới** và chạy:
```bash
cd frontend
npm run dev
```

Bạn sẽ thấy:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

### Bước 3: Mở trình duyệt
Mở trình duyệt và truy cập: **http://localhost:3000**

---

## Cách 2: Sử dụng script tự động (Windows)

Tạo file `start-app.bat` trong thư mục gốc:

```batch
@echo off
echo Starting Backend...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 10 /nobreak >nul
echo Opening browser...
start http://localhost:3000
echo Done! Check the two new windows for server logs.
pause
```

Sau đó double-click vào file `start-app.bat` để chạy.

---

## Kiểm tra Server đã chạy chưa

### Backend (Port 3001):
Mở browser và truy cập: http://localhost:3001/health

Nếu thấy JSON response như:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```
→ Backend đã chạy OK ✅

### Frontend (Port 3000):
Mở browser và truy cập: http://localhost:3000

Nếu thấy app load → Frontend đã chạy OK ✅

---

## Xử lý lỗi thường gặp

### Lỗi: "Port 3001 already in use"
→ Có process khác đang dùng port 3001
**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### Lỗi: "Cannot connect to database"
→ Database chưa chạy hoặc sai thông tin kết nối
**Giải pháp:**
1. Kiểm tra PostgreSQL đã chạy chưa
2. Kiểm tra file `backend/.env` có đúng thông tin DATABASE_URL không

### Lỗi: "Failed to fetch" trong browser
→ Backend chưa chạy hoặc đang lỗi
**Giải pháp:**
1. Kiểm tra backend console có lỗi gì không
2. Kiểm tra http://localhost:3001/health có hoạt động không
3. Xem lại các fix đã áp dụng trong PERFORMANCE_FIX_SUMMARY.md

---

## Sau khi app chạy

1. ✅ Kiểm tra load time - nên nhanh hơn (1-5 giây)
2. ✅ Kiểm tra không còn "Failed to fetch" thường xuyên
3. ✅ Kiểm tra error messages rõ ràng (tiếng Việt)
4. ✅ Xem console logs để monitor database pool

---

**Lưu ý:** Luôn chạy Backend trước, sau đó mới chạy Frontend!

