# 📚 Hướng Dẫn Sử Dụng Chức Năng Documents (RAG System)

## 🎯 Chức Năng Documents Là Gì?

**Documents** là hệ thống RAG (Retrieval-Augmented Generation) - một tính năng thông minh giúp:

1. **Upload và lưu trữ tài liệu** (PDF, DOCX, TXT, HTML)
2. **Tạo kiến thức cơ sở dữ liệu** từ nội dung tài liệu
3. **Tìm kiếm thông minh** dựa trên ngữ nghĩa (không chỉ từ khóa)
4. **Tự động trích dẫn nguồn** khi tạo nội dung từ AI

---

## 📍 Vị Trí Trong Ứng Dụng

```
Thanh Navigation (TopNav)
├── Dashboard
├── Ideas
├── Briefs
├── Packs
├── Content
├── Documents  ← TÍNH NĂNG MỚI
└── Settings
```

**URL**: `http://localhost:3000/documents`

---

## 🔄 Quy Trình Làm Việc RAG

### TRƯỚC KHI CÓ RAG:
```
User → Ideas → Briefs → Packs → Content
        ↓
    Chỉ dựa vào prompt của user
    AI tạo nội dung từ kiến thức tổng quát
    ❌ Không có nguồn tham khảo cụ thể
    ❌ Có thể bị "hallucination" (AI bịa đặt)
```

### SAU KHI CÓ RAG:
```
User Upload Documents → Knowledge Base
                              ↓
User → Ideas → Briefs (with RAG) → Packs → Content
                  ↓
              Tìm kiếm tài liệu liên quan
              AI tạo nội dung dựa trên tài liệu thực
              ✅ Có trích dẫn nguồn [1][2][3]
              ✅ Nội dung chính xác, có căn cứ
```

---

## 🎬 Hướng Dẫn Sử Dụng Chi Tiết

### Bước 1: Upload Tài Liệu

1. **Truy cập trang Documents**
   ```
   Click "Documents" trên thanh navigation
   hoặc vào http://localhost:3000/documents
   ```

2. **Click nút "Upload Document"**
   - Popup form hiện lên

3. **Điền thông tin tài liệu**:
   ```
   📄 File*: Chọn file (.txt, .pdf, .docx, .html)
   📝 Title*: Tên tài liệu (bắt buộc)
   👤 Author: Tác giả (tùy chọn)
   📅 Published Date: Ngày xuất bản (tùy chọn)
   🏷️ Tags: Chủ đề, từ khóa (ngăn cách bằng dấu phẩy)
   🔗 URL: Link nguồn (tùy chọn)
   ```

4. **Ví dụ upload tài liệu về Marketing**:
   ```
   File: marketing-strategy-2024.pdf
   Title: "Chiến lược Marketing Digital 2024"
   Author: "Nguyễn Văn A"
   Published Date: "2024-01-15"
   Tags: "marketing, digital, strategy, social-media"
   URL: "https://example.com/article"
   ```

5. **Click "Upload"**
   - Hệ thống sẽ:
     - ✅ Trích xuất văn bản từ file
     - ✅ Chia thành các đoạn nhỏ (chunks)
     - ✅ Tạo vector embeddings (AI hiểu ngữ nghĩa)
     - ✅ Lưu vào cơ sở dữ liệu

6. **Thông báo thành công**:
   ```
   ✅ Document ingested successfully
   📊 Chunks created: 5
   🆔 Document ID: abc-123-xyz
   ```

---

### Bước 2: Xem Danh Sách Tài Liệu

**Giao diện hiển thị**:

| ID | Title | Author | Published | Tags | Version | Created |
|----|-------|--------|-----------|------|---------|---------|
| abc-123 | Chiến lược Marketing 2024 | Nguyễn Văn A | 2024-01-15 | marketing, digital | 1 | 2024-12-07 |
| def-456 | AI trong Kinh Doanh | Trần Thị B | 2024-02-20 | AI, business | 1 | 2024-12-06 |

**Các chức năng**:
- 🔍 **Search**: Tìm kiếm tài liệu
- 🔽 **Filter**: Lọc theo author, tags, date
- 👁️ **View**: Xem chi tiết tài liệu
- ✏️ **Edit**: Chỉnh sửa metadata
- 🗑️ **Delete**: Xóa tài liệu

---

### Bước 3: Tìm Kiếm Thông Minh (Similarity Search)

#### 🎯 Điểm Đặc Biệt:

**Tìm kiếm truyền thống** (keyword):
```
Tìm: "AI marketing"
→ Chỉ tìm văn bản có chính xác từ "AI" và "marketing"
```

**Tìm kiếm RAG** (semantic):
```
Tìm: "trí tuệ nhân tạo giúp quảng cáo"
→ Tìm được tài liệu về "AI trong Marketing Digital"
→ Vì AI hiểu rằng:
   - "trí tuệ nhân tạo" = "AI"
   - "quảng cáo" = "marketing"
   - Ngữ nghĩa giống nhau!
```

#### Cách sử dụng:

1. **Nhập câu hỏi hoặc mô tả**:
   ```
   "Làm thế nào để tăng tương tác trên mạng xã hội?"
   ```

2. **Hệ thống tìm tài liệu liên quan**:
   ```
   Kết quả:
   📄 Chiến lược Marketing Digital 2024
      Similarity: 87%
      Snippet: "...tăng tương tác bằng cách tạo nội dung
                 có giá trị, đăng đúng thời điểm..."

   📄 Social Media Best Practices
      Similarity: 82%
      Snippet: "...sử dụng hashtag hiệu quả và tương tác
                 với người theo dõi..."
   ```

3. **Filter kết quả** (tùy chọn):
   ```
   - Author: "Nguyễn Văn A"
   - Tags: "social-media"
   - Match threshold: 0.7 (70% similarity)
   - Match count: 5 (top 5 kết quả)
   ```

---

## 🌟 Ảnh Hưởng Lên Toàn Bộ App

### 1. 📝 **Ideas Generation** (Tạo Ý Tưởng)

**TRƯỚC RAG**:
```javascript
User: Tạo ý tưởng về "Marketing AI"
AI: Tạo ý tưởng dựa trên kiến thức chung
→ Có thể không phù hợp với công ty bạn
```

**SAU RAG**:
```javascript
User: Tạo ý tưởng về "Marketing AI"
       + useRAG: true

System:
1. Tìm trong Documents → "Chiến lược Marketing 2024"
2. AI đọc tài liệu công ty bạn
3. Tạo ý tưởng dựa trên:
   - Chiến lược thực tế của công ty
   - Case study đã có
   - Best practices đã upload

→ Ý tưởng phù hợp, dựa trên nguồn tin cậy
```

---

### 2. 📋 **Briefs Generation** (Tạo Brief Nội Dung)

**TRƯỚC RAG**:
```
Idea: "Viết bài về AI Marketing"
     ↓
Brief: AI tạo từ kiến thức tổng quát
     ↓
⚠️ Vấn đề:
   - Không có trích dẫn
   - Thông tin có thể không chính xác
   - Không phản ánh tài liệu công ty
```

**SAU RAG** (QUAN TRỌNG NHẤT):
```
Idea: "Viết bài về AI Marketing"
     ↓
System tìm kiếm Documents:
   - Query: "AI Marketing automation tools"
   - Tìm thấy 3 tài liệu liên quan
     [1] "AI Marketing Strategy 2024"
     [2] "Marketing Automation Guide"
     [3] "Customer Analytics with AI"
     ↓
Brief với Citations:
   Title: "AI trong Marketing: Tự động hóa và Phân tích"

   Objective: "Giới thiệu công cụ AI Marketing [1],
              tập trung vào automation [2] và
              customer analytics [3]"

   Key Messages:
   - "AI giúp tối ưu chi phí quảng cáo lên 40% [1]"
   - "Marketing automation tiết kiệm 6 giờ/tuần [2]"
   - "Phân tích khách hàng chính xác hơn 35% [3]"

   ✅ Có trích dẫn nguồn
   ✅ Dựa trên tài liệu thực
   ✅ Thông tin đáng tin cậy
```

**API Endpoint**:
```typescript
POST /api/briefs/generate-with-rag

{
  "ideaId": 123,
  "useRAG": true,  // ← BẬT RAG
  "searchFilters": {
    "author": "Nguyễn Văn A",  // Chỉ lấy tài liệu của tác giả này
    "tags": ["marketing"],      // Chỉ lấy tài liệu có tag marketing
    "match_threshold": 0.7,     // Độ tương đồng tối thiểu 70%
    "match_count": 5            // Lấy top 5 tài liệu
  }
}

Response:
{
  "brief": { ... },
  "rag_context": {
    "sources": [
      {
        "index": 1,
        "doc_id": "abc-123",
        "title": "AI Marketing Strategy 2024",
        "snippet": "AI giúp tối ưu chi phí...",
        "similarity": 0.87
      },
      ...
    ],
    "citations_used": [
      {
        "citation_index": 1,
        "doc_id": "abc-123",
        "snippet": "...",
        "url": "https://..."
      }
    ]
  }
}
```

---

### 3. 📦 **Content Packs** (Tạo Bản Thảo)

**Hiện tại**: Packs chưa tích hợp RAG
**Tương lai có thể**:
- Tạo nội dung dựa trên nhiều tài liệu
- Tự động thêm footnotes và bibliography
- Link đến nguồn gốc tài liệu

---

### 4. 📰 **Final Content** (Nội Dung Hoàn Chỉnh)

**Hiển thị Citations**:

```markdown
# AI trong Marketing Digital

Trí tuệ nhân tạo đang thay đổi cách doanh nghiệp
tiếp cận khách hàng [1]. Theo nghiên cứu, AI giúp
tăng ROI lên đến 40% [1][2].

## Ứng Dụng Thực Tế

Marketing automation cho phép tự động hóa email
campaigns, tiết kiệm 6 giờ mỗi tuần [2]. Công cụ
phân tích khách hàng dựa trên AI có độ chính xác
cao hơn 35% so với phương pháp truyền thống [3].

---

## 📚 Tài Liệu Tham Khảo

[1] Nguyễn Văn A. (2024). "AI Marketing Strategy 2024"
    https://example.com/article-1

[2] Trần Thị B. (2024). "Marketing Automation Guide"
    https://example.com/article-2

[3] Lê Văn C. (2024). "Customer Analytics with AI"
    https://example.com/article-3
```

---

## 🔧 Cấu Hình RAG

### Backend Settings

**File**: `backend/src/services/briefs-rag.service.ts`

```typescript
// Cấu hình tìm kiếm
const searchOptions = {
  match_threshold: 0.7,    // 70% similarity tối thiểu
  match_count: 5,          // Lấy top 5 tài liệu
  author: undefined,       // Lọc theo tác giả
  tags: undefined          // Lọc theo tags
};

// Cấu hình LLM
const llmOptions = {
  model: 'gemini-1.5-flash-latest',  // Model AI
  temperature: 0.7                    // Độ sáng tạo
};
```

### Database Schema

**Documents Table**:
```sql
documents (
  doc_id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  author TEXT,
  published_date DATE,
  tags TEXT[],
  version_number INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP
)
```

**Chunks Table**:
```sql
document_chunks (
  chunk_id UUID PRIMARY KEY,
  doc_id UUID REFERENCES documents,
  chunk_text TEXT,
  chunk_index INTEGER,
  embedding VECTOR(1536),  -- OpenAI embedding dimension
  metadata JSONB
)
```

**Citations Table**:
```sql
brief_citations (
  id SERIAL PRIMARY KEY,
  brief_id INTEGER REFERENCES briefs,
  doc_id UUID REFERENCES documents,
  citation_index INTEGER,
  snippet TEXT,
  relevance_score FLOAT
)
```

---

## 📊 So Sánh: Với RAG vs Không RAG

### Use Case: Tạo Brief về "AI Marketing"

| Tiêu Chí | Không RAG | Có RAG |
|----------|-----------|---------|
| **Nguồn thông tin** | Kiến thức tổng quát của AI | Tài liệu đã upload |
| **Độ chính xác** | ⭐⭐⭐ (có thể bịa) | ⭐⭐⭐⭐⭐ (dựa trên nguồn) |
| **Trích dẫn** | ❌ Không có | ✅ Có [1][2][3] |
| **Tùy chỉnh** | ❌ Khó điều chỉnh | ✅ Upload tài liệu mới |
| **Kiểm chứng** | ❌ Không rõ nguồn | ✅ Click vào citation |
| **Phù hợp công ty** | ⭐⭐ Chung chung | ⭐⭐⭐⭐⭐ Cụ thể |

---

## 🎯 Lợi Ích Thực Tế

### 1. **Cho Content Creator**:
```
✅ Tạo nội dung dựa trên tài liệu công ty
✅ Tự động có citations (không lo bị cáo buộc đạo văn)
✅ Nội dung chính xác, có căn cứ
✅ Tiết kiệm thời gian research
```

### 2. **Cho Marketing Team**:
```
✅ Đảm bảo brand message nhất quán
✅ Tham khảo case study đã có
✅ Không lặp lại nội dung cũ
✅ Ideas phù hợp với chiến lược công ty
```

### 3. **Cho Compliance/Legal**:
```
✅ Truy vết nguồn thông tin
✅ Kiểm chứng mọi claim
✅ Tránh thông tin sai lệch
✅ Có bằng chứng cho mọi statement
```

---

## 🚀 Workflow Thực Tế

### Scenario: Viết Bài Blog về "AI trong Chăm Sóc Khách Hàng"

#### BƯỚC 1: Chuẩn Bị Knowledge Base
```
Upload Documents:
1. customer-service-guide.pdf
2. ai-chatbot-case-study.docx
3. customer-satisfaction-report-2024.pdf
```

#### BƯỚC 2: Generate Idea
```
Navigate: Ideas → Generate
Input:
  - Persona: "Marketing Manager"
  - Industry: "Technology"
  - Topic: "AI Customer Service"

→ System tạo 5-10 ideas
→ Chọn idea hay nhất → Approve
```

#### BƯỚC 3: Generate Brief (WITH RAG)
```
Click: "Tạo Brief" trên idea đã approve

Backend:
1. Query: "AI customer service chatbot automation"
2. Search Documents → Tìm thấy 3 tài liệu phù hợp
3. AI đọc tài liệu + tạo brief
4. Insert citations vào brief

Kết quả:
Brief có cấu trúc:
  - Title: "AI Chatbot: Tương Lai của Chăm Sóc KH"
  - Objective: "Giới thiệu lợi ích AI chatbot [1]..."
  - Key Messages:
      "Giảm thời gian phản hồi 70% [1]"
      "Tiết kiệm chi phí 40% [2]"
      "Tăng satisfaction score lên 4.5/5 [3]"
  - Citations: [1][2][3] với link đầy đủ
```

#### BƯỚC 4: Review Brief
```
Check:
✅ Thông tin từ tài liệu công ty
✅ Citations chính xác
✅ Key messages phù hợp target audience
→ Approve brief
```

#### BƯỚC 5: Generate Content
```
Từ brief → Tạo content pack → Final content
→ Publish với đầy đủ citations và bibliography
```

---

## ⚙️ Cài Đặt & Requirements

### Backend Environment Variables

```bash
# .env file
OPENAI_API_KEY=sk-...           # Cho embeddings
GEMINI_API_KEY=...              # Fallback cho embeddings
DEFAULT_AI_PROVIDER=gemini      # Hoặc 'openai'

# Database (PostgreSQL với pgvector)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### Database Setup

```bash
# Cần cài pgvector extension
docker-compose up -d  # Dùng image pgvector/pgvector:pg15

# Run migrations
cd backend/migrations
npm run migrate:004  # RAG system migration
```

### Frontend Routes

```
/documents          → Danh sách tài liệu
/documents/upload   → Upload tài liệu mới
/documents/:id      → Chi tiết tài liệu
/documents/search   → Tìm kiếm tài liệu
```

---

## 📖 API Reference

### Upload Document
```http
POST /api/rag/ingest/file
Content-Type: multipart/form-data

file: <binary>
title: "Document Title"
author: "Author Name"
published_date: "2024-01-15"
tags: "tag1,tag2,tag3"
url: "https://source.com"
```

### Search Documents
```http
GET /api/rag/search
  ?query=AI+marketing
  &author=Nguyen+Van+A
  &tags=marketing,AI
  &match_threshold=0.7
  &match_count=5
  &search_type=hybrid
```

### Generate Brief with RAG
```http
POST /api/briefs/generate-with-rag
Content-Type: application/json

{
  "ideaId": 123,
  "useRAG": true,
  "searchFilters": {
    "author": "Nguyen Van A",
    "tags": ["marketing"],
    "match_threshold": 0.7,
    "match_count": 5
  }
}
```

### Get Brief with Citations
```http
GET /api/briefs/:id/with-citations

Response:
{
  "brief": { ... },
  "citations": [
    {
      "citation_index": 1,
      "doc_id": "abc-123",
      "title": "AI Marketing 2024",
      "snippet": "...",
      "url": "https://...",
      "relevance_score": 0.87
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Vấn đề 1: Metadata không được lưu
```
Triệu chứng: Upload tài liệu nhưng author/tags = null

Nguyên nhân:
- Multipart form parsing issue
- Form fields không được đọc đúng

Giải pháp:
1. Check backend logs: "Form field: author = ..."
2. Verify multipart/form-data header
3. Debug rag.controller.ts:130-188
```

### Vấn đề 2: OpenAI quota exceeded
```
Triệu chứng: "RateLimitError: 429"

Nguyên nhân:
- OpenAI API key hết quota
- Quá nhiều requests

Giải pháp:
1. Thêm credit vào OpenAI account
2. Hoặc chuyển sang Gemini embeddings
3. Hoặc dùng local model (Sentence Transformers)
```

### Vấn đề 3: Không tìm thấy tài liệu liên quan
```
Triệu chứng: Search returns empty results

Nguyên nhân:
- Embeddings chưa được tạo
- Match threshold quá cao (> 0.9)
- Tài liệu không liên quan

Giải pháp:
1. Check embeddings: SELECT COUNT(*) FROM document_chunks WHERE embedding IS NOT NULL
2. Giảm match_threshold xuống 0.6-0.7
3. Upload thêm tài liệu liên quan
```

---

## 📈 Metrics & Monitoring

### Tracking RAG Performance

```sql
-- Số lượng tài liệu và chunks
SELECT
  COUNT(DISTINCT doc_id) as total_docs,
  COUNT(*) as total_chunks
FROM document_chunks;

-- Tài liệu được cite nhiều nhất
SELECT
  d.title,
  COUNT(bc.id) as citation_count
FROM documents d
JOIN brief_citations bc ON d.doc_id = bc.doc_id
GROUP BY d.doc_id, d.title
ORDER BY citation_count DESC
LIMIT 10;

-- Average similarity scores
SELECT
  AVG(relevance_score) as avg_relevance,
  MIN(relevance_score) as min_relevance,
  MAX(relevance_score) as max_relevance
FROM brief_citations;
```

---

## 🎓 Best Practices

### 1. Upload Tài Liệu Chất Lượng
```
✅ DO:
- Upload tài liệu liên quan đến ngành của bạn
- Điền đầy đủ metadata (author, tags, date)
- Upload nhiều nguồn khác nhau
- Cập nhật tài liệu thường xuyên

❌ DON'T:
- Upload tài liệu không liên quan
- Bỏ trống metadata
- Upload tài liệu trùng lặp
- Để tài liệu lỗi thời
```

### 2. Sử Dụng Tags Hiệu Quả
```
✅ Tốt:
tags: "marketing, digital, social-media, strategy"

❌ Không tốt:
tags: "abc, xyz, misc"
```

### 3. Search Query
```
✅ Tốt:
"Làm thế nào để tăng tương tác trên mạng xã hội?"
"AI giúp cải thiện customer service như thế nào?"

❌ Không tốt:
"mxh"
"ai"
```

---

## 🔮 Tương Lai

### Planned Features:
- [ ] Multi-language embeddings
- [ ] Image/Video document support
- [ ] Automatic document versioning
- [ ] RAG for Packs generation
- [ ] Citation formatting (APA, MLA, Chicago)
- [ ] Document similarity recommendations
- [ ] Bulk upload
- [ ] OCR for scanned documents

---

**Tài liệu này được tạo**: 2025-12-07
**Phiên bản**: 1.0
**Liên hệ support**: Check README.md
