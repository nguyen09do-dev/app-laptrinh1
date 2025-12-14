# Backend Refactor Summary - AI-Only Flow

## 📋 Tổng quan thay đổi

Refactor backend để chuyển sang **AI-only flow**: chỉ generate ideas từ AI, không có manual create/update.

---

## 🗄️ Database Schema Changes

### Bảng `ideas`

**Các cột:**
- `id` (SERIAL PRIMARY KEY)
- `title` (TEXT NOT NULL)
- `description` (TEXT NOT NULL)
- `persona` (TEXT NOT NULL)
- `industry` (TEXT NOT NULL)
- `rationale` (TEXT)
- `status` (TEXT DEFAULT 'generated') - **CHANGED**
  - Values: `'generated' | 'shortlisted' | 'approved' | 'archived'`
  - Bỏ: `'draft'`, `'selected'`
- `batch_id` (TEXT) - **NEW**
  - UUID để nhóm các ideas được generate trong cùng 1 lần
- `created_at` (TIMESTAMP DEFAULT NOW())

**Indexes:**
- `idx_ideas_batch_id` trên `batch_id`
- `idx_ideas_status` trên `status`
- `idx_ideas_created_at` trên `created_at DESC`

---

## 🔄 API Endpoints

### ✅ Giữ lại

1. **GET /api/ideas**
   - Lấy tất cả ideas

2. **GET /api/ideas/:id**
   - Lấy idea theo ID

3. **DELETE /api/ideas/:id**
   - Xóa idea

4. **POST /api/ideas/generate** - **REFACTORED**
   - Input: `{ persona: string, industry: string }`
   - Logic:
     - Tạo `batch_id` (UUID)
     - Gọi LLM với system + user prompt
     - Parse JSON từ '[' đến ']'
     - Validate bằng AJV
     - Retry 3 lần nếu fail
     - Insert với `status='generated'`, `batch_id`

5. **PATCH /api/ideas/:id/status** - **NEW**
   - Input: `{ status: "shortlisted" | "approved" | "archived" }`
   - Cập nhật status của idea

### ❌ Đã bỏ

- `POST /api/ideas` (manual create)
- `PUT /api/ideas/:id` (manual update)
- `POST /api/ideas/brief` (không liên quan)
- `POST /api/ideas/flowmap` (không liên quan)
- `GET /api/ideas/approved`
- `PUT /api/ideas/:id/approve`
- `PUT /api/ideas/:id/reject`

---

## 📝 Code Changes

### 1. `backend/src/services/ideas.service.ts`

**Removed:**
- `createIdea()` method
- `updateIdea()` method
- `approveIdea()` method
- `rejectIdea()` method
- `getApprovedIdeas()` method
- `generateBrief()` method
- `generateFlowmap()` method
- `getLanguageInstruction()` method

**Updated:**
- `Idea` interface: thêm `batch_id`, status type strict
- `generateIdeas()`:
  - Tạo `batch_id` (UUID)
  - System prompt: JSON-only
  - User prompt: generate 10 ideas
  - Extract JSON từ '[' đến ']'
  - Validate bằng AJV
  - Insert với `status='generated'`, `batch_id`

**Added:**
- `updateStatus()` method
- `extractJsonArray()` helper method

### 2. `backend/src/schema/ideaGenerate.schema.ts`

**Removed:**
- `createIdeaSchema`
- `updateIdeaSchema`

**Updated:**
- `ideaItemSchema`: `additionalProperties: false` (chỉ cho phép title, description, rationale)
- `generateRequestSchema`: chỉ `persona`, `industry`

**Added:**
- `updateStatusSchema`

### 3. `backend/src/controllers/ideas.controller.ts`

**Removed:**
- `createIdea()` handler
- `updateIdea()` handler
- `approveIdea()` handler
- `rejectIdea()` handler
- `getApprovedIdeas()` handler
- `generateBrief()` handler
- `generateFlowmap()` handler

**Updated:**
- `generateIdeas()`: chỉ nhận `persona`, `industry`

**Added:**
- `updateStatus()` handler

### 4. `backend/src/routes/ideas.routes.ts`

**Removed:**
- `POST /api/ideas`
- `PUT /api/ideas/:id`
- `POST /api/ideas/brief`
- `POST /api/ideas/flowmap`
- `GET /api/ideas/approved`
- `PUT /api/ideas/:id/approve`
- `PUT /api/ideas/:id/reject`

**Added:**
- `PATCH /api/ideas/:id/status`

---

## 🔧 Migration

Nếu database đã tồn tại, chạy `backend/migration.sql` để:
1. Thêm cột `batch_id`
2. Cập nhật status constraint
3. Migrate data cũ (status cũ → 'generated')
4. Tạo indexes

---

## ✅ Validation

- ✅ AJV schema chỉ validate: `title`, `description`, `rationale`
- ✅ Không yêu cầu LLM trả về `status`, `persona`, `industry`, `created_at`, `batch_id`
- ✅ Parse JSON từ '[' đầu tiên đến ']' cuối cùng
- ✅ Retry 3 lần với exponential backoff nếu parse/validate fail

---

## 🎯 Testing Checklist

- [ ] POST /api/ideas/generate với persona + industry
- [ ] Verify batch_id được tạo và lưu đúng
- [ ] Verify status = 'generated' cho tất cả ideas mới
- [ ] Verify JSON parsing từ '[' đến ']'
- [ ] Verify AJV validation
- [ ] Verify retry logic khi fail
- [ ] PATCH /api/ideas/:id/status với các status hợp lệ
- [ ] GET /api/ideas trả về đúng data
- [ ] GET /api/ideas/:id trả về đúng data
- [ ] DELETE /api/ideas/:id hoạt động đúng

---

## 📌 Notes

- LLMClient hiện tại không hỗ trợ system prompt riêng, nên system prompt được gộp vào đầu user prompt
- Default provider: Gemini (free)
- Default model: `gemini-2.5-flash`
- Temperature: 0.7















