# 🚀 Quick Start - Backend Server

## ⚠️ QUAN TRỌNG: Backend phải chạy trước khi test Mailchimp!

## Cách Start Backend

### Windows PowerShell:

```powershell
cd backend
npm run dev
```

### Hoặc nếu có lỗi execution policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd backend
npm run dev
```

## Kiểm tra Backend đã chạy

### Cách 1: Check port
```powershell
netstat -ano | findstr ":3001" | findstr "LISTEN"
```

Nếu thấy output → Backend đang chạy ✅

### Cách 2: Test health endpoint
```powershell
curl http://localhost:3001/health
```

Hoặc dùng script:
```powershell
cd backend
node check-backend.js
```

## Nếu Backend không start được

### 1. Check Node.js version
```powershell
node --version
```
Cần Node.js 18+ hoặc 20+

### 2. Check dependencies
```powershell
cd backend
npm install
```

### 3. Check database connection
- PostgreSQL phải đang chạy
- Database `ai_ideas_db` phải tồn tại
- Connection string trong `.env` đúng

### 4. Check port 3001 có bị chiếm không
```powershell
netstat -ano | findstr ":3001"
```

Nếu có process khác đang dùng port 3001:
```powershell
Stop-Process -Id <PID> -Force
```

## Output mong đợi khi start thành công

```
✅ Database connected successfully
🚀 Server running at http://localhost:3001
📚 RAG endpoints available at http://localhost:3001/api/rag
```

## Troubleshooting

### Lỗi: "Cannot find module"
→ Chạy: `npm install` trong folder backend

### Lỗi: "Database connection error"
→ Kiểm tra PostgreSQL đang chạy và connection string đúng

### Lỗi: "Port 3001 already in use"
→ Kill process cũ hoặc đổi port trong `.env`

---

**Sau khi backend chạy, mới test Mailchimp connection!**

