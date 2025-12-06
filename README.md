# 🚀 AI Idea Generator

Ứng dụng tạo ý tưởng content sử dụng AI, được xây dựng với Fastify + TypeScript + PostgreSQL + Docker + Next.js + Tailwind.

## 📋 Tính năng

- ✅ **CRUD API** cho Ideas (Create, Read, Update, Delete)
- ✅ **AI Generation** - Tạo 10 ý tưởng content bằng OpenAI
- ✅ **Retry Logic** - Tự động retry với exponential backoff khi API fail
- ✅ **AJV Validation** - Validate response từ AI
- ✅ **Beautiful UI** - Giao diện đẹp với Tailwind CSS
- ✅ **Docker Support** - PostgreSQL chạy qua Docker Compose

## 🏗️ Cấu trúc Project

```
├── docker-compose.yml          # Docker Compose cho PostgreSQL
├── README.md                   # File này
├── backend/                    # Backend Fastify
│   ├── package.json
│   ├── tsconfig.json
│   ├── init.sql               # SQL khởi tạo database
│   └── src/
│       ├── index.ts           # Entry point
│       ├── routes/            # Route definitions
│       │   └── ideas.routes.ts
│       ├── controllers/       # Request handlers
│       │   └── ideas.controller.ts
│       ├── services/          # Business logic
│       │   └── ideas.service.ts
│       ├── lib/               # Utilities
│       │   ├── db.ts          # Database connection
│       │   └── llmClient.ts   # OpenAI client
│       └── schema/            # Validation schemas
│           └── ideaGenerate.schema.ts
└── frontend/                   # Frontend Next.js
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── app/
        ├── layout.tsx
        ├── page.tsx
        └── globals.css
```

## 🚀 Hướng dẫn Cài đặt & Chạy

### Bước 1: Chuẩn bị môi trường

Đảm bảo đã cài đặt:
- Node.js 18+
- Docker & Docker Compose
- Git

### Bước 2: Clone project (nếu cần)

```bash
cd G:\Code01-HWAIcontentmulti
```

### Bước 3: Khởi động PostgreSQL

```bash
# Chạy PostgreSQL container
docker compose up -d

# Kiểm tra container đã chạy
docker compose ps
```

### Bước 4: Cấu hình Backend

```bash
# Di chuyển vào folder backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env (copy từ example hoặc tạo mới)
# Nội dung file .env:
# DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/ai_ideas_db
# OPENAI_API_KEY=your_openai_api_key_here
# PORT=3001
# HOST=0.0.0.0
```

⚠️ **Quan trọng**: Thay `your_openai_api_key_here` bằng API key thực từ [OpenAI Platform](https://platform.openai.com/api-keys)

### Bước 5: Chạy Backend

```bash
# Trong folder backend
npm run dev

# Server sẽ chạy tại http://localhost:3001
```

### Bước 6: Cài đặt & Chạy Frontend

```bash
# Mở terminal mới, di chuyển vào folder frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Frontend sẽ chạy tại http://localhost:3000
```

### Bước 7: Sử dụng App

1. Mở trình duyệt tại `http://localhost:3000`
2. Nhập **Persona** (VD: "Content Creator", "Tech YouTuber")
3. Nhập **Industry** (VD: "Technology", "Marketing", "Education")
4. Click **"Generate 10 Ideas"**
5. Xem danh sách ideas được tạo!

## 📡 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/ideas` | Lấy tất cả ideas |
| GET | `/api/ideas/:id` | Lấy idea theo ID |
| POST | `/api/ideas` | Tạo idea mới |
| PUT | `/api/ideas/:id` | Cập nhật idea |
| DELETE | `/api/ideas/:id` | Xóa idea |
| POST | `/api/ideas/generate` | Generate ideas bằng AI |

### Ví dụ sử dụng API

**Generate Ideas:**
```bash
curl -X POST http://localhost:3001/api/ideas/generate \
  -H "Content-Type: application/json" \
  -d '{"persona": "Content Creator", "industry": "Technology"}'
```

**Lấy tất cả Ideas:**
```bash
curl http://localhost:3001/api/ideas
```

**Tạo Idea mới:**
```bash
curl -X POST http://localhost:3001/api/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hướng dẫn SEO",
    "description": "Bài viết về SEO cơ bản",
    "persona": "Blogger",
    "industry": "Marketing",
    "rationale": "SEO là kỹ năng cần thiết"
  }'
```

## 🔧 Troubleshooting

### Lỗi kết nối Database

```bash
# Kiểm tra Docker container
docker compose ps

# Xem logs
docker compose logs postgres

# Restart container
docker compose restart
```

### Lỗi OpenAI API

- Kiểm tra API key trong file `.env`
- Đảm bảo account OpenAI còn credit
- Kiểm tra rate limit

### Lỗi CORS

Frontend đã được cấu hình proxy trong `next.config.js`. Nếu vẫn gặp lỗi:
- Đảm bảo backend chạy đúng port 3001
- Kiểm tra CORS config trong `backend/src/index.ts`

## 📚 Tech Stack

**Backend:**
- Fastify - Web framework
- TypeScript - Language
- PostgreSQL - Database
- node-pg - Database driver
- OpenAI SDK - AI integration
- AJV - JSON validation

**Frontend:**
- Next.js 14 - React framework
- Tailwind CSS - Styling
- TypeScript - Language

**Infrastructure:**
- Docker Compose - Container orchestration

## 📝 Ghi chú cho người mới

### Cấu trúc Backend giải thích

- **routes/** - Định nghĩa URL endpoints và schema validation
- **controllers/** - Xử lý HTTP request/response
- **services/** - Chứa business logic (tách riêng để dễ test)
- **lib/** - Các utility như database connection, LLM client
- **schema/** - Định nghĩa schema cho validation

### Flow khi Generate Ideas

1. User submit form → Frontend gọi `POST /api/ideas/generate`
2. Controller nhận request, gọi Service
3. Service tạo prompt, gọi LLMClient
4. LLMClient gọi OpenAI API
5. Response được validate bằng AJV schema
6. Nếu fail → retry với exponential backoff (1s, 2s, 4s)
7. Nếu success → lưu vào PostgreSQL
8. Trả về danh sách ideas đã lưu

## 📄 License

MIT License - Tự do sử dụng và học tập!











