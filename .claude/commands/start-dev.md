# Start Development Environment

Start the complete development environment: database, backend, frontend, and open the app in browser.

## What this command does:

1. **Read Progress**: Check progress.md for latest status and any important notes
2. **Start Database**: Start PostgreSQL Docker container (port 5433)
3. **Start Backend**: Launch backend server (port 4000)
4. **Start Frontend**: Launch Next.js frontend (port 3000)
5. **Verify Services**: Check that all services are running and healthy
6. **Open Browser**: Navigate to the frontend in the default browser
7. **Show Status**: Display all service URLs and status

## Startup Sequence:

### 1. Read Progress File
- Check progress.md for the latest status
- Look for any known issues or blockers
- Show relevant context from recent updates

### 2. Start Database
```powershell
docker-compose up -d
```
- Wait for database to be healthy
- Port: 5433
- Container: ideas_db

### 3. Start Backend
```powershell
cd backend; npm run dev
```
- Run in new terminal window
- Port: 4000
- Wait for initialization messages:
  - ✅ Database connection successful
  - ✅ Monitor rule engine initialized
  - 🚀 Server is running on http://localhost:4000

### 4. Start Frontend
```powershell
cd frontend; npm run dev
```
- Run in new terminal window
- Port: 3000
- Wait for: "Ready on http://localhost:3000"

### 5. Health Checks
- Database: Check docker container status
- Backend: GET http://localhost:4000/health
- Frontend: Check if port 3000 is listening

### 6. Open Browser
- Navigate to http://localhost:3000
- Use browser MCP tools to:
  - Take snapshot of the page
  - Verify the app loaded correctly
  - Show screenshot if needed

## Output Format:

Show a summary table like:
```
============================================
   🚀 Development Environment Started
============================================

📍 Frontend:  http://localhost:3000     ✅
📍 Backend:   http://localhost:4000     ✅
📍 Database:  localhost:5433            ✅

Recent Progress:
- [Latest entry from progress.md]

Known Issues:
- [Any warnings from progress.md]

Next Steps:
- [Suggestions from progress.md]

Browser: Opening http://localhost:3000...
============================================
```

## Error Handling:

If any service fails to start:
- Show clear error message
- Suggest fixes based on common issues
- Provide commands to check logs
- Reference progress.md for known issues

## Notes:

- Uses Windows PowerShell commands
- Opens separate terminal windows for backend/frontend
- Keeps terminals open to show logs
- Waits appropriate time for each service to initialize
- Verifies each service before proceeding to next
- Can be run multiple times (idempotent)



