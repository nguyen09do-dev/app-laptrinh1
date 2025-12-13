# 🔧 Backend Docker Status & Auto-Start Guide

## 📋 Current Setup

**Docker Services**:
- ✅ PostgreSQL: Running in Docker (`ai_ideas_postgres` on port 5432)
- ❌ Backend: **NOT in Docker** - Runs locally with `tsx watch`

**docker-compose.yml**:
- Only contains PostgreSQL service
- Backend runs separately with `tsx watch src/index.ts`

## 🚀 Auto-Start Script

Tôi đã tự động:
1. ✅ Checked Docker containers (PostgreSQL running)
2. ✅ Started backend locally (tsx watch)
3. ✅ Started frontend (npm run dev)
4. ✅ Tested connections

## 📊 Status Check

### Backend (Port 3001):
```powershell
# Check if running
netstat -ano | findstr ":3001" | findstr "LISTEN"

# Test health
Invoke-WebRequest -Uri "http://localhost:3001/health"
```

### Frontend (Port 3000):
```powershell
# Check if running
netstat -ano | findstr ":3000" | findstr "LISTEN"
```

### PostgreSQL (Port 5432):
```powershell
# Check Docker container
docker ps | Select-String "postgres"
```

## 🔄 Auto-Start Commands

### Start Backend:
```powershell
cd backend
tsx watch src/index.ts
```

Hoặc double-click: `backend/start-backend-simple.bat`

### Start Frontend:
```powershell
cd frontend
npm run dev
```

### Start PostgreSQL (if needed):
```powershell
docker-compose up -d postgres
```

## ⚠️ Troubleshooting

### Backend không start:
1. Check backend CMD window for errors
2. Verify Node.js installed: `node --version`
3. Verify dependencies: `cd backend && npm install`
4. Check for port conflicts: `netstat -ano | findstr ":3001"`

### Frontend không load data:
1. Verify backend is running: `http://localhost:3001/health`
2. Check browser console (F12) for errors
3. Verify CORS is enabled in backend
4. Check network tab for failed requests

### PostgreSQL connection issues:
1. Verify container running: `docker ps`
2. Check DATABASE_URL in `.env`
3. Test connection: `psql -U postgres -d ai_ideas_db`

## 📝 Notes

- Backend **không chạy trong Docker**, chỉ PostgreSQL
- Backend cần start **trước** frontend
- Nếu backend crash, check CMD window logs
- Frontend có retry logic (2 retries) nếu backend chưa ready

---

**Last Updated**: 2025-12-12  
**Status**: Backend runs locally, PostgreSQL in Docker

