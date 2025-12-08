# ✅ Quy Trình Tạo Content Đã Được Sửa

## 📋 Tổng Quan

Quy trình tạo content đã được sửa lại để tuân theo đúng luồng nghiệp vụ:

```
Ideas → Briefs → Draft Packs → Review → Approve → Publish → Contents
```

## 🔄 Flow Trước Khi Sửa (SAI)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Ideas   │────▶│  Briefs  │────▶│ Contents │
└──────────┘     └──────────┘     └──────────┘
                       │
                       └─────────────────────────────┐
                        Bỏ qua bước Packs              │
                        (không có review/approval)    │
                        ❌ SAI QUY TRÌNH              │
                                                      ▼
                                                 Tạo trực tiếp
```

**Vấn Đề:**
- ❌ Nhảy thẳng từ Brief sang Content (bỏ qua Packs)
- ❌ Không có cơ chế duyệt draft
- ❌ Không theo đúng database schema (content_packs bị bỏ qua)
- ❌ Content page có chức năng generate (sai - chỉ nên edit/view)

## ✅ Flow Sau Khi Sửa (ĐÚNG)

```
┌──────────┐     ┌──────────┐     ┌────────────────┐     ┌──────────┐
│  Ideas   │────▶│  Briefs  │────▶│ Draft Packs    │────▶│ Contents │
└──────────┘     └──────────┘     │ (4 statuses)   │     └──────────┘
                                  └────────────────┘
                                         │
                                         ├─▶ draft (mới tạo)
                                         ├─▶ review (đang xem xét)
                                         ├─▶ approved (đã duyệt)
                                         └─▶ published (xuất bản → Content)
```

## 🎯 Chi Tiết Từng Bước

### 1️⃣ Ideas Page (Không đổi)
- Tạo và duyệt ý tưởng
- Status: pending → approved
- Approved ideas hiển thị trong Briefs page

### 2️⃣ Briefs Page (ĐÃ SỬA)

**Thay Đổi:**
- Nút: "Tạo Content" → **"Tạo Draft"**
- API endpoint: `/api/contents/from-brief/:id` → **`/api/packs/from-brief/:id`**
- Navigation: Chuyển đến `/packs` (không phải `/content`)

**Các Tùy Chọn Khi Tạo Draft:**
```javascript
{
  wordCount: 800,      // Độ dài mong muốn
  style: 'professional', // professional | casual | academic
  useRAG: true         // ✨ Sử dụng RAG từ Knowledge Base
}
```

**Request Example:**
```http
POST /api/packs/from-brief/123
Content-Type: application/json

{
  "wordCount": 800,
  "style": "professional",
  "useRAG": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pack_id": "uuid-here",
    "brief_id": 123,
    "draft_content": "...",
    "word_count": 810,
    "status": "draft"
  }
}
```

### 3️⃣ Packs Page (Duyệt Draft)

**Workflow State Machine:**
```
draft ──────▶ review ──────▶ approved ──────▶ published
  │                              │                 │
  └──────────────────────────────┴─────────────────┘
           (Có thể quay lại draft để chỉnh sửa)
```

**Chức Năng:**
- ✅ Xem draft content
- ✅ Chỉnh sửa nội dung
- ✅ Thay đổi status:
  - `draft` → `review` (Gửi duyệt)
  - `review` → `approved` (Phê duyệt)
  - `approved` → `published` (Xuất bản)
- ✅ Khi chọn "published" → Tự động tạo Content

**API Endpoint:**
```http
POST /api/packs/update-status
{
  "pack_id": "uuid",
  "status": "published"
}
```

### 4️⃣ Contents Page (Chỉ Xem/Sửa)

**Vai Trò:**
- ✅ Xem danh sách content đã publish
- ✅ Chỉnh sửa content
- ✅ Xóa content
- ❌ KHÔNG có chức năng tạo content mới (đã bỏ)

**Nguồn Content:**
- Content chỉ được tạo từ Packs có status = "published"
- API: `POST /api/contents/from-pack/:packId`

## 🔧 Các Thay Đổi Kỹ Thuật

### Backend Changes

**1. Packs Controller**
```typescript
// File: backend/src/controllers/packs.controller.ts

// Thêm method mới
async generateDraftFromBrief(request, reply) {
  const { wordCount, style, useRAG, searchFilters } = request.body;

  const pack = await packsService.generateDraftComplete({
    brief_id: briefId,
    useRAG,
    wordCount,
    style,
    searchFilters,
  });

  return { success: true, data: pack };
}
```

**2. Packs Service**
```typescript
// File: backend/src/services/packs.service.ts

// Updated interface
interface CreateDraftInput {
  pack_id?: string;
  brief_id: number;
  audience?: string;
  // RAG options (MỚI)
  useRAG?: boolean;
  wordCount?: number;
  style?: string;
  searchFilters?: any;
}

// New method
async generateDraftComplete(input: CreateDraftInput): Promise<ContentPack> {
  // Wraps streaming generation, waits for completion
  // Returns complete pack object
}
```

**3. Routes**
```typescript
// File: backend/src/routes/packs.routes.ts

// New endpoint
fastify.post('/packs/from-brief/:briefId', {
  handler: packsController.generateDraftFromBrief
});
```

### Frontend Changes

**1. Briefs Page**
```typescript
// File: frontend/app/briefs/page.tsx

// Renamed function
const handleGenerateDraft = async (briefId: number) => {
  const response = await fetch(
    `http://localhost:3001/api/packs/from-brief/${briefId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        wordCount: contentOptions.wordCount,
        style: contentOptions.style,
        useRAG: contentOptions.useRAG, // ✨ Hỗ trợ RAG
      }),
    }
  );

  if (data.success) {
    router.push(`/packs?openId=${data.data.pack_id}`);
  }
};
```

**2. UI Changes**
- Button text: "Tạo Content" → "Tạo Draft"
- Loading text: "Đang tạo content..." → "Đang tạo draft..."
- Modal button: "Tạo Content" → "Tạo Draft Pack"

## 📊 Database Schema

### content_packs Table
```sql
CREATE TABLE content_packs (
    pack_id UUID PRIMARY KEY,
    brief_id INTEGER REFERENCES briefs(id),
    draft_content TEXT,
    word_count INTEGER,
    status pack_status DEFAULT 'draft',  -- draft | review | approved | published
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Pack Status Flow
```
┌─────────┐
│  draft  │ ──────┐
└─────────┘       │
      ▲           ▼
      │      ┌────────┐
      └──────│ review │
             └────────┘
                  │
                  ▼
             ┌──────────┐
             │ approved │
             └──────────┘
                  │
                  ▼
             ┌───────────┐
             │ published │ ────▶ Tạo Content
             └───────────┘
```

## 🎨 RAG Integration

### Tính Năng Mới: RAG Toggle

Khi tạo draft, người dùng có thể bật/tắt RAG:

**RAG BẬT:**
```javascript
useRAG: true
→ Tìm kiếm trong Knowledge Base
→ Nội dung dựa trên tài liệu thật
→ Có citations [1][2][3]
→ Chính xác, đáng tin cậy
```

**RAG TẮT:**
```javascript
useRAG: false
→ Sử dụng kiến thức tổng quát của AI
→ Không có citations
→ Nội dung sáng tạo tự do
```

### UI RAG Toggle
```typescript
{/* RAG Option */}
<div className="flex items-center gap-3">
  <input
    type="checkbox"
    checked={contentOptions.useRAG}
    onChange={(e) => setContentOptions({
      ...contentOptions,
      useRAG: e.target.checked
    })}
  />
  <label>
    📚 Sử dụng RAG
    <span className="badge">{useRAG ? 'BẬT' : 'TẮT'}</span>
  </label>
</div>

{useRAG && (
  <div className="benefits">
    ✓ Nội dung dựa trên tài liệu thực
    ✓ Có trích dẫn nguồn [1][2][3]
    ✓ Số liệu cụ thể và đáng tin cậy
    ✓ Giảm thiểu "hallucination"
  </div>
)}
```

## 🧪 Testing Workflow

### Test Case 1: Tạo Draft từ Brief

1. Vào Briefs page
2. Click "Tạo Draft" trên một brief
3. Chọn options:
   - Word Count: 800
   - Style: Professional
   - RAG: BẬT
4. Click "Tạo Draft Pack"
5. **Kết quả mong đợi:**
   - Chuyển đến Packs page
   - Pack mới có status = "draft"
   - Nội dung đã được generate

### Test Case 2: Review & Approve Draft

1. Vào Packs page
2. Xem draft vừa tạo
3. Chỉnh sửa nội dung nếu cần
4. Click "Send to Review" → status = "review"
5. Click "Approve" → status = "approved"
6. **Kết quả mong đợi:**
   - Status thay đổi đúng
   - Pack sẵn sàng publish

### Test Case 3: Publish Pack → Content

1. Ở Packs page, với pack status = "approved"
2. Click "Publish"
3. **Kết quả mong đợi:**
   - Status = "published"
   - Content mới xuất hiện trong Contents page
   - Brief_id được liên kết đúng

## 📝 API Endpoints Summary

### Packs Endpoints
```
GET    /api/packs                      # Lấy tất cả packs
GET    /api/packs/:packId              # Lấy pack theo ID
POST   /api/packs/from-brief/:briefId  # ✨ Tạo draft từ brief (NEW)
POST   /api/packs/draft                # Tạo draft với SSE streaming
POST   /api/packs/update-status        # Cập nhật status
PATCH  /api/packs/:packId/status       # Cập nhật status (alt)
DELETE /api/packs/:packId              # Xóa pack
```

### Contents Endpoints
```
GET    /api/contents                   # Lấy tất cả contents
GET    /api/contents/:id               # Lấy content theo ID
POST   /api/contents/from-pack/:packId # Tạo content từ pack published
DELETE /api/contents/:id               # Xóa content
```

## 🎓 Best Practices

1. **Luôn tạo Draft trước:**
   - Không bao giờ tạo Content trực tiếp từ Brief
   - Phải qua Packs để có cơ chế review

2. **Sử dụng RAG khi:**
   - Cần nội dung chính xác, có nguồn gốc
   - Viết về sản phẩm/dịch vụ của công ty
   - Cần số liệu cụ thể

3. **Không sử dụng RAG khi:**
   - Viết nội dung sáng tạo, tổng quát
   - Không có tài liệu liên quan trong Knowledge Base
   - Muốn AI tự do sáng tạo

4. **Status Progression:**
   - Luôn theo đúng flow: draft → review → approved → published
   - Không nhảy bước
   - Có thể quay lại draft để chỉnh sửa

## 🔗 Related Files

**Backend:**
- `backend/src/controllers/packs.controller.ts` - Packs controller với method mới
- `backend/src/services/packs.service.ts` - Packs service với RAG support
- `backend/src/routes/packs.routes.ts` - Routes định nghĩa endpoint mới
- `backend/src/controllers/contents.controller.ts` - Contents controller (không thay đổi)

**Frontend:**
- `frontend/app/briefs/page.tsx` - Briefs page với nút "Tạo Draft"
- `frontend/app/packs/page.tsx` - Packs page để review
- `frontend/app/content/page.tsx` - Contents page chỉ view/edit

**Database:**
- `backend/migrations/002_add_content_packs.sql` - Schema cho content_packs

## ✅ Summary

Quy trình đã được sửa đúng theo nghiệp vụ:

1. ✅ Briefs → Packs (tạo draft)
2. ✅ Packs review workflow (draft → review → approved)
3. ✅ Packs → Contents (publish)
4. ✅ RAG integration với toggle UI
5. ✅ Contents chỉ để view/edit

**Lợi ích:**
- 🎯 Đúng quy trình nghiệp vụ
- 📋 Có cơ chế review/approval
- 🔍 Hỗ trợ RAG cho nội dung chính xác
- 🎨 UI/UX rõ ràng, dễ hiểu
- 💾 Tuân theo database schema
