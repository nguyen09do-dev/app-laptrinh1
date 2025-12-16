# 🗄️ Database Setup Guide

## Vấn đề: PostgreSQL không chạy

App không thể khởi động được vì **PostgreSQL database chưa chạy** trên máy bạn.

## ✅ Giải pháp

### Bước 1: Kiểm tra PostgreSQL đã cài đặt chưa

Mở Command Prompt và chạy:
```bash
where pg_ctl
# Hoặc
where psql
```

Nếu thấy đường dẫn → PostgreSQL đã cài đặt ✅
Nếu không thấy → Cần cài đặt PostgreSQL

### Bước 2: Khởi động PostgreSQL

#### Cách 1: Sử dụng Windows Services
1. Mở **Run** (Windows + R)
2. Gõ `services.msc` → Enter
3. Tìm service có tên như:
   - `postgresql-x64-15` (hoặc phiên bản khác)
   - `PostgreSQL Server 15`
4. Nhấn chuột phải → **Start**

#### Cách 2: Sử dụng Command Line
```bash
# Tìm đường dẫn PostgreSQL
cd "C:\Program Files\PostgreSQL\15\bin"  # Thay 15 bằng phiên bản của bạn

# Khởi động PostgreSQL
pg_ctl.exe start -D "C:\Program Files\PostgreSQL\15\data"
```

#### Cách 3: Sử dụng pgAdmin hoặc pg_ctl
Nếu bạn có pgAdmin:
1. Mở pgAdmin
2. Nhấn chuột phải vào server → **Connect**

### Bước 3: Kiểm tra kết nối

Sau khi khởi động PostgreSQL, kiểm tra:

```bash
# Test connection
psql -h localhost -p 5432 -U postgres -d postgres
```

### Bước 4: Khởi động lại App

Sau khi PostgreSQL đã chạy:

1. **Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

2. **Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

3. **Mở browser:** http://localhost:3000

---

## 📦 Nếu chưa cài đặt PostgreSQL

### Tải xuống và cài đặt:
1. Truy cập: https://www.postgresql.org/download/windows/
2. Download phiên bản mới nhất (15.x hoặc 16.x)
3. Chạy installer
4. Lưu ý:
   - Password: `postgres123` (như trong .env)
   - Port: `5432` (default)

### Hoặc sử dụng Docker (Khuyên dùng cho development):
```bash
# Cài đặt Docker Desktop trước

# Tạo container PostgreSQL
docker run --name postgres-ai-content -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=ai_ideas_db -p 5432:5432 -d postgres:15

# Khởi động lại container
docker start postgres-ai-content
```

---

## 🔧 Database Configuration

File `backend/.env` cần có:
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/ai_ideas_db
```

---

## 🐛 Troubleshooting

### Lỗi: "Connection refused"
- PostgreSQL chưa chạy
- Sai port (kiểm tra port 5432 có bị chiếm không)

### Lỗi: "Authentication failed"
- Sai password (kiểm tra file .env)
- User không tồn tại

### Lỗi: "Database does not exist"
- Database `ai_ideas_db` chưa được tạo
- Chạy migration scripts trong `backend/migrations/`

---

## 📝 Kiểm tra sau khi setup

1. **Health check:** http://localhost:3001/health
   - Nên thấy: `"status": "ok"` và `"database": "connected"`

2. **Frontend:** http://localhost:3000
   - App sẽ tự redirect đến `/dashboard`

3. **Test API:** http://localhost:3001/api/ideas
   - Nên trả về JSON array (có thể rỗng)

---

## 🚀 Quick Start

Sau khi PostgreSQL đã chạy, double-click file `start-app.bat` để khởi động app nhanh.

---

**Status**: ⚠️ Database chưa chạy - Cần khởi động PostgreSQL trước

