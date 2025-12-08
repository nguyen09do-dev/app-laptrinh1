# 🎬 DEMO SCRIPT - Chức Năng Documents (RAG)

## 🎯 Mục Tiêu Demo
Hướng dẫn từng bước để hiểu rõ ảnh hưởng của Documents/RAG lên toàn bộ app

---

## 📋 PHẦN 1: DEMO KHÔNG CÓ RAG (Trước khi dùng Documents)

### Bước 1.1: Tạo Idea Thông Thường
```
1. Mở http://localhost:3000/ideas
2. Click "Generate Ideas"
3. Điền:
   - Persona: "Marketing Manager"
   - Industry: "Technology"
   - Count: 3
4. Click "Generate"
5. Chờ AI tạo ideas

📊 KẾT QUẢ:
- Ideas được tạo từ kiến thức chung của AI
- Không có nguồn tham khảo cụ thể
- Có thể chung chung, không đặc thù
```

### Bước 1.2: Tạo Brief Thông Thường
```
1. Chọn 1 idea → Approve
2. Click "Tạo Brief"
3. Xem brief được tạo

📊 KẾT QUẢ:
- Brief có thông tin tổng quát
- KHÔNG có citations [1][2][3]
- KHÔNG có "Tài Liệu Tham Khảo"
- Thông tin từ kiến thức chung của AI
```

**⚠️ VẤN ĐỀ**:
```
❌ Không biết nguồn thông tin từ đâu
❌ Không thể kiểm chứng
❌ Có thể bị "hallucination" (AI bịa đặt)
❌ Không phù hợp với tài liệu công ty
```

---

## 📚 PHẦN 2: SETUP DOCUMENTS (RAG)

### Bước 2.1: Upload Tài Liệu Đầu Tiên
```
1. Mở http://localhost:3000/documents
2. Click "Upload Document" (nếu có button)
3. Hoặc dùng API:
```

**Cách 1: Qua UI** (nếu có):
```
File: Chọn test-ai-marketing.txt
Title: "AI trong Marketing Digital 2024"
Author: "Nguyễn Văn A"
Published Date: "2024-12-01"
Tags: "AI, marketing, advertising, automation"
URL: "https://example.com/ai-marketing"

Click "Upload"
```

**Cách 2: Qua cURL** (chắc chắn):
```bash
# Mở Terminal/CMD và chạy:
cd G:\Code01-HWAIcontentmulti

curl -X POST http://localhost:3001/api/rag/ingest/file \
  -F "file=@test-ai-marketing.txt" \
  -F "title=AI trong Marketing Digital 2024" \
  -F "author=Nguyễn Văn A" \
  -F "published_date=2024-12-01" \
  -F "tags=AI,marketing,advertising,automation"
```

**Kết quả mong đợi**:
```json
{
  "success": true,
  "message": "File ingested successfully",
  "data": {
    "doc_id": "abc-123-xyz...",
    "chunks_created": 1
  }
}
```

### Bước 2.2: Upload Thêm Tài Liệu
```bash
# Tài liệu 2: Health & Nutrition
curl -X POST http://localhost:3001/api/rag/ingest/file \
  -F "file=@test-health-nutrition.txt" \
  -F "title=Dinh Dưỡng và Sức Khỏe 2024" \
  -F "author=Trần Thị B" \
  -F "published_date=2024-11-15" \
  -F "tags=health,nutrition,wellness,diet"

# Tài liệu 3: Software Development
curl -X POST http://localhost:3001/api/rag/ingest/file \
  -F "file=@test-software-dev.txt" \
  -F "title=Phát Triển Phần Mềm Best Practices" \
  -F "author=Nguyễn Văn A" \
  -F "published_date=2024-12-05" \
  -F "tags=software,development,programming,agile"
```

### Bước 2.3: Kiểm Tra Tài Liệu
```bash
# Check documents đã upload
curl http://localhost:3001/api/rag/documents | python -m json.tool

# Check stats
curl http://localhost:3001/api/rag/stats | python -m json.tool
```

**Kết quả mong đợi**:
```json
{
  "stats": {
    "total_documents": "3",
    "total_chunks": "3",
    "total_authors": "2"
  }
}
```

---

## 🚀 PHẦN 3: DEMO VỚI RAG (Sau khi có Documents)

### Bước 3.1: Test Similarity Search

**Test Case 1: Tìm tài liệu về Marketing**
```bash
curl -G http://localhost:3001/api/rag/search \
  --data-urlencode "query=trí tuệ nhân tạo giúp quảng cáo tự động" \
  --data-urlencode "match_threshold=0.6" \
  --data-urlencode "match_count=3" \
  | python -m json.tool
```

**Kết quả mong đợi**:
```json
{
  "results": [
    {
      "doc_id": "abc-123",
      "title": "AI trong Marketing Digital 2024",
      "similarity": 0.85,
      "snippet": "AI giúp tự động hóa quảng cáo, tối ưu..."
    }
  ]
}
```

**Test Case 2: Tìm tài liệu về Health**
```bash
curl -G http://localhost:3001/api/rag/search \
  --data-urlencode "query=ăn uống lành mạnh và dinh dưỡng cân bằng" \
  --data-urlencode "match_threshold=0.6" \
  | python -m json.tool
```

**Kết quả mong đợi**: Tìm được "Dinh Dưỡng và Sức Khỏe 2024"

### Bước 3.2: Tạo Idea với Context từ Documents

```
1. Mở http://localhost:3000/ideas
2. Click "Generate Ideas"
3. Điền:
   - Persona: "Marketing Manager"
   - Industry: "Technology"
   - Topic: "AI Marketing Automation"
   - Count: 3
4. Click "Generate"

📊 KHÁC BIỆT:
Lần này, nếu backend search Documents:
- Ideas sẽ liên quan đến tài liệu đã upload
- Nội dung cụ thể hơn, chi tiết hơn
- Phản ánh kiến thức trong documents
```

### Bước 3.3: Tạo Brief VỚI RAG ⭐ (QUAN TRỌNG NHẤT)

**Option A: Qua UI** (nếu có nút "Use RAG"):
```
1. Chọn idea về AI Marketing
2. Approve idea
3. Click "Tạo Brief"
4. ✅ Bật toggle "Use RAG" (nếu có)
5. Chọn filters:
   - Author: "Nguyễn Văn A"
   - Tags: "AI, marketing"
6. Click "Generate"
```

**Option B: Qua API** (chắc chắn):
```bash
# Lấy ID của idea vừa tạo
curl http://localhost:3001/api/ideas | python -m json.tool

# Giả sử idea ID = 113
curl -X POST http://localhost:3001/api/briefs/generate-with-rag \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": 113,
    "useRAG": true,
    "searchFilters": {
      "author": "Nguyễn Văn A",
      "tags": ["AI", "marketing"],
      "match_threshold": 0.7,
      "match_count": 5
    }
  }' | python -m json.tool
```

**📊 KẾT QUẢ MONG ĐỢI**:
```json
{
  "brief": {
    "id": 45,
    "title": "AI Marketing Automation: Tương Lai Của Quảng Cáo",
    "objective": "Giới thiệu công cụ AI Marketing [1], tập trung vào automation và tối ưu chi phí quảng cáo [1][2]",
    "key_messages": [
      "AI giúp tối ưu chi phí quảng cáo lên 40% [1]",
      "Marketing automation tiết kiệm 6 giờ/tuần [1]",
      "Phân tích khách hàng chính xác hơn 35% [1]"
    ],
    "tone_style": "Chuyên nghiệp, dựa trên dữ liệu"
  },
  "rag_context": {
    "sources": [
      {
        "index": 1,
        "doc_id": "abc-123-xyz",
        "title": "AI trong Marketing Digital 2024",
        "snippet": "AI giúp tối ưu hóa chiến dịch marketing...",
        "similarity": 0.87,
        "url": "https://example.com/ai-marketing"
      }
    ],
    "citations_used": [
      {
        "citation_index": 1,
        "doc_id": "abc-123-xyz",
        "snippet": "AI giúp tối ưu chi phí quảng cáo...",
        "url": "https://example.com/ai-marketing"
      }
    ]
  }
}
```

**✅ ĐIỂM KHÁC BIỆT**:
```
VỚI RAG:
✅ Có citations [1][2][3]
✅ Objective chứa trích dẫn: "...automation [1][2]"
✅ Key messages có nguồn: "...lên 40% [1]"
✅ Có phần "rag_context" với sources
✅ Thông tin từ tài liệu thực của công ty

KHÔNG RAG:
❌ Không có citations
❌ Thông tin chung chung
❌ Không có "rag_context"
❌ Không thể kiểm chứng
```

---

## 📊 PHẦN 4: SO SÁNH KẾT QUẢ

### A. Brief KHÔNG RAG
```markdown
# Brief: AI trong Marketing

## Mục Tiêu
Giới thiệu về ứng dụng AI trong marketing digital.

## Thông Điệp Chính
- AI giúp tự động hóa marketing
- Tối ưu hóa chiến dịch quảng cáo
- Phân tích dữ liệu khách hàng

## Cấu Trúc
1. Giới thiệu AI
2. Ứng dụng trong marketing
3. Lợi ích
4. Kết luận

❌ Không có citations
❌ Không biết nguồn
❌ Thông tin chung chung
```

### B. Brief VỚI RAG
```markdown
# Brief: AI Marketing Automation: Tương Lai Của Quảng Cáo

## Mục Tiêu
Giới thiệu công cụ AI Marketing [1], tập trung vào
automation và tối ưu chi phí quảng cáo. Dựa trên
case study thực tế từ tài liệu công ty [1][2].

## Thông Điệp Chính
- AI giúp tối ưu chi phí quảng cáo lên 40% [1]
- Marketing automation tiết kiệm 6 giờ/tuần [1]
- Phân tích khách hàng chính xác hơn 35% [1]
- Tự động hóa email campaigns hiệu quả [1]

## Cấu Trúc Nội Dung
1. **Giới thiệu** (150 từ)
   - Tình hình marketing hiện tại
   - Thách thức và cơ hội [1]

2. **AI Marketing Tools** (300 từ)
   - Các công cụ phổ biến [1]
   - Tính năng chính [1]
   - Case study cụ thể [1]

3. **Lợi ích và ROI** (200 từ)
   - Số liệu cụ thể: 40% cost reduction [1]
   - Thời gian tiết kiệm [1]
   - Độ chính xác cải thiện [1]

4. **Kết luận & CTA** (100 từ)

---

## 📚 Tài Liệu Tham Khảo

[1] Nguyễn Văn A. (2024). "AI trong Marketing Digital 2024"
    https://example.com/ai-marketing
    Similarity: 87%

✅ Có citations [1][2][3]
✅ Biết rõ nguồn thông tin
✅ Dữ liệu cụ thể (40%, 6 giờ, 35%)
✅ Dựa trên tài liệu công ty
✅ Có thể kiểm chứng (click vào [1])
```

---

## 🎭 PHẦN 5: TEST METADATA FILTERING

### Test 1: Lọc theo Author
```bash
# Chỉ lấy tài liệu của "Nguyễn Văn A"
curl -G http://localhost:3001/api/rag/search \
  --data-urlencode "query=AI và công nghệ" \
  --data-urlencode "author=Nguyễn Văn A" \
  | python -m json.tool

# KẾT QUẢ: Chỉ trả về 2 tài liệu (AI Marketing + Software Dev)
# KHÔNG trả về tài liệu của "Trần Thị B" (Health)
```

### Test 2: Lọc theo Tags
```bash
# Chỉ lấy tài liệu về marketing
curl -G http://localhost:3001/api/rag/search \
  --data-urlencode "query=chiến lược kinh doanh" \
  --data-urlencode "tags=marketing" \
  | python -m json.tool

# KẾT QUẢ: Chỉ trả về "AI trong Marketing"
# KHÔNG trả về Software Dev hay Health
```

### Test 3: Kết hợp Author + Tags
```bash
curl -G http://localhost:3001/api/rag/search \
  --data-urlencode "query=phát triển ứng dụng" \
  --data-urlencode "author=Nguyễn Văn A" \
  --data-urlencode "tags=software,programming" \
  | python -m json.tool

# KẾT QUẢ: Chỉ trả về "Phát Triển Phần Mềm Best Practices"
```

---

## 📸 PHẦN 6: SCREENSHOTS & VIDEO

### Checklist cho Demo Video:

#### Scene 1: Trang Documents
```
□ Mở http://localhost:3000/documents
□ Show danh sách 5 documents
□ Highlight các cột: Title, Author, Tags, Created
□ Show nút "Upload Document"
```

#### Scene 2: Upload Document
```
□ Click "Upload"
□ Điền form với metadata đầy đủ
□ Show success message
□ Document xuất hiện trong list
□ Highlight metadata đã save
```

#### Scene 3: Search Documents
```
□ Nhập query: "trí tuệ nhân tạo quảng cáo"
□ Show search results với similarity score
□ Highlight snippet preview
□ Click vào document để xem full
```

#### Scene 4: Generate Brief WITHOUT RAG
```
□ Tạo idea mới
□ Generate brief (không dùng RAG)
□ Show brief KHÔNG có [1][2][3]
□ Highlight: No citations, no sources
```

#### Scene 5: Generate Brief WITH RAG
```
□ Generate brief (BẬT RAG)
□ Show loading + "Searching knowledge base..."
□ Show brief CÓ [1][2][3]
□ Highlight citations
□ Click [1] → show source document
□ Highlight số liệu cụ thể (40%, 6 giờ)
```

#### Scene 6: Compare Side-by-Side
```
Split screen:
Left: Brief WITHOUT RAG    | Right: Brief WITH RAG
- No citations            | - Citations [1][2][3]
- Generic info            | - Specific data (40%, 6h)
- No sources              | - Document sources
- Can't verify            | - Can click to verify
```

---

## 💡 PHẦN 7: KEY TAKEAWAYS

### Khi KHÔNG dùng RAG:
```
Ideas → Brief → Content
   ↓
AI dựa vào kiến thức chung
❌ Không có nguồn
❌ Có thể sai
❌ Không cụ thể
❌ Khó kiểm chứng
```

### Khi CÓ RAG:
```
Upload Documents → Knowledge Base
                        ↓
Ideas → Brief (search KB) → Content with Citations
           ↓
       Tìm tài liệu liên quan [1][2][3]
       AI tạo nội dung dựa trên nguồn
       ✅ Có citations
       ✅ Thông tin chính xác
       ✅ Số liệu cụ thể
       ✅ Có thể kiểm chứng
```

### Ảnh Hưởng Lên Toàn Bộ App:

| Component | Trước RAG | Sau RAG |
|-----------|-----------|---------|
| **Ideas** | Kiến thức chung | Dựa trên documents |
| **Briefs** | Không có citations | Có [1][2][3] |
| **Content** | Generic | Cụ thể, có nguồn |
| **Quality** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Trust** | 60% | 95% |

---

## 🎬 SCRIPT DEMO (30 giây)

```
[0:00-0:05]
"Trước đây, AI tạo nội dung từ kiến thức chung.
Không có nguồn, khó kiểm chứng."

[0:05-0:10]
"Giờ với Documents/RAG, bạn upload tài liệu công ty.
AI tìm kiếm và trích dẫn từ tài liệu THẬT."

[0:10-0:15]
"Brief có citations [1][2][3].
Key messages có số liệu cụ thể: 40%, 6 giờ, 35%."

[0:15-0:20]
"Click vào [1] để xem nguồn.
Mọi thông tin đều kiểm chứng được."

[0:20-0:25]
"Lọc theo author, tags, date.
Tìm kiếm thông minh theo ngữ nghĩa."

[0:25-0:30]
"Kết quả: Nội dung chính xác, đáng tin cậy,
dựa trên tài liệu công ty. Đó là RAG!"
```

---

## 🧪 VERIFICATION CHECKLIST

Sau khi demo, verify:

### Backend:
```bash
# 1. Check documents uploaded
curl http://localhost:3001/api/rag/stats

Expected:
{
  "total_documents": "3",
  "total_chunks": "3",
  "total_authors": "2"
}

# 2. Check search works
curl -G http://localhost:3001/api/rag/search \
  --data-urlencode "query=AI marketing" \
  | python -m json.tool

Expected: Returns AI Marketing document

# 3. Check brief has citations
curl http://localhost:3001/api/briefs/45/with-citations \
  | python -m json.tool

Expected:
{
  "brief": {...},
  "citations": [
    {
      "citation_index": 1,
      "doc_id": "...",
      "snippet": "..."
    }
  ]
}
```

### Frontend:
```
□ Documents page shows 3 docs
□ Metadata displayed (author, tags)
□ Search returns relevant results
□ Brief shows [1][2][3] citations
□ Click [1] opens source document
□ Filter by author works
□ Filter by tags works
```

---

**Demo này cho thấy**:
1. ✅ RAG làm thay đổi hoàn toàn chất lượng nội dung
2. ✅ Từ "AI bịa đặt" → "AI dựa trên nguồn tin cậy"
3. ✅ Từ "không kiểm chứng" → "có citations đầy đủ"
4. ✅ Từ "chung chung" → "cụ thể với số liệu"

**Đó chính là sức mạnh của RAG trong ứng dụng này! 🚀**
