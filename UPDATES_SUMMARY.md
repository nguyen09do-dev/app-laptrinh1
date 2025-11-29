# 🎉 Bản cập nhật mới - AI Idea Generator

## ✅ Đã hoàn thành

### 1. Sửa lỗi Flowmap ❌ → ✅
**Vấn đề**: Flowmap không tạo được do lỗi JSON parsing (Unterminated string)

**Giải pháp**:
- Cải thiện prompt để AI trả về JSON đơn giản hơn
- Yêu cầu AI giữ text ngắn gọn, không có newlines/quotes đặc biệt
- Thêm better JSON cleaning logic

**File đã sửa**: `backend/src/services/ideas.service.ts:330-393`

---

### 2. Cải thiện nội dung Ideas 📝 ✅
**Yêu cầu**: Nội dung chi tiết hơn, có cấu trúc dòng và bước, mang tính academic

**Thay đổi**:
- Prompt mới yêu cầu 200-300 words per idea
- Cấu trúc bắt buộc:
  * Overview (1-2 đoạn giới thiệu)
  * Key concepts (danh sách điểm chính)
  * Step-by-step approach (các bước thực hiện)
  * Expected outcomes (kết quả mong đợi)
- Nội dung academic, professional-grade

**File đã sửa**: `backend/src/services/ideas.service.ts:142-172`

---

### 3. Cập nhật Database Schema 🗄️ ✅
**Thêm mới**:
- Column `brief` (TEXT) - lưu content brief AI-generated
- Column `flowmap` (JSONB) - lưu flowmap data
- Column `approved_at` (TIMESTAMP) - thời gian approve
- Status `approved` - cho ideas đã duyệt
- Indexes cho performance

**Migration file**: `backend/migrations/001_add_brief_flowmap_approved.sql`

**Chạy migration**:
```bash
docker exec -i ai_idea_postgres psql -U postgres -d ai_ideas_db < backend/migrations/001_add_brief_flowmap_approved.sql
```

---

### 4. API Endpoints mới 🚀 ✅

#### Approve Idea
```bash
PUT /api/ideas/:id/approve
# Duyệt idea, set status = 'approved', approved_at = NOW()
```

#### Reject Idea
```bash
PUT /api/ideas/:id/reject
# Reject idea, set status = 'draft', approved_at = NULL
```

#### Get Approved Ideas
```bash
GET /api/ideas/approved
# Lấy danh sách tất cả ideas đã approved
```

**Files đã cập nhật**:
- `backend/src/services/ideas.service.ts` - thêm methods
- `backend/src/controllers/ideas.controller.ts` - thêm controllers
- `backend/src/routes/ideas.routes.ts` - thêm routes

---

### 5. Lưu Brief & Flowmap vào Database 💾 ✅
**Trước đây**: Brief và Flowmap chỉ trả về, không lưu
**Bây giờ**: Tự động lưu vào database khi generate

**File đã sửa**:
- `backend/src/services/ideas.service.ts:317-321` (brief)
- `backend/src/services/ideas.service.ts:437-441` (flowmap)

---

## 🔨 Cần thực hiện tiếp (Frontend)

### Thêm các handlers vào Frontend

Thêm vào `frontend/app/page.tsx` sau hàm `handleDelete`:

```typescript
/**
 * Approve một idea
 */
const handleApprove = async (idea: Idea) => {
  try {
    const response = await fetch(`/api/ideas/${idea.id}/approve`, { method: 'PUT' });
    const result: ApiResponse<Idea> = await response.json();

    if (result.success && result.data) {
      // Update local state
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? result.data! : i)));
      if (selectedIdea?.id === idea.id) setSelectedIdea(result.data);
      fetchApprovedIdeas(); // Refresh approved list
    }
  } catch (err) {
    console.error('Approve error:', err);
    setError('Không thể approve idea');
  }
};

/**
 * Reject một idea
 */
const handleReject = async (idea: Idea) => {
  try {
    const response = await fetch(`/api/ideas/${idea.id}/reject`, { method: 'PUT' });
    const result: ApiResponse<Idea> = await response.json();

    if (result.success && result.data) {
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? result.data! : i)));
      if (selectedIdea?.id === idea.id) setSelectedIdea(result.data);
      fetchApprovedIdeas();
    }
  } catch (err) {
    console.error('Reject error:', err);
    setError('Không thể reject idea');
  }
};

/**
 * Fetch approved ideas
 */
const fetchApprovedIdeas = async () => {
  try {
    const response = await fetch('/api/ideas/approved');
    const result: ApiResponse<Idea[]> = await response.json();
    if (result.success && result.data) {
      setApprovedIdeas(result.data);
    }
  } catch (err) {
    console.error('Fetch approved error:', err);
  }
};

/**
 * Update idea
 */
const handleUpdateIdea = async (id: number, updates: Partial<Idea>) => {
  try {
    const response = await fetch(`/api/ideas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const result: ApiResponse<Idea> = await response.json();

    if (result.success && result.data) {
      setIdeas((prev) => prev.map((i) => (i.id === id ? result.data! : i)));
      if (selectedIdea?.id === id) setSelectedIdea(result.data);
      setEditingIdea(null);
    }
  } catch (err) {
    console.error('Update error:', err);
    setError('Không thể update idea');
  }
};

/**
 * Copy to clipboard
 */
const handleCopyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert('Đã copy vào clipboard!');
};
```

### Thêm nút Approve/Reject trong Modal

Trong phần "Actions" của modal (dòng ~712), thêm:

```tsx
{/* Approve/Reject buttons */}
{selectedIdea.status !== 'approved' && (
  <button
    onClick={() => handleApprove(selectedIdea)}
    className="flex-1 py-3 px-4 bg-mint-500/20 hover:bg-mint-500/30 border border-mint-500/30 text-mint-400 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
  >
    <span>✅</span>
    <span>Approve</span>
  </button>
)}
{selectedIdea.status === 'approved' && (
  <button
    onClick={() => handleReject(selectedIdea)}
    className="flex-1 py-3 px-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
  >
    <span>↩️</span>
    <span>Reject</span>
  </button>
)}

{/* Edit button */}
<button
  onClick={() => setEditingIdea(selectedIdea)}
  className="py-3 px-4 bg-midnight-600/50 hover:bg-midnight-600 border border-midnight-500 text-midnight-200 font-semibold rounded-xl transition-all flex items-center gap-2"
>
  <span>✏️</span>
  <span>Edit</span>
</button>

{/* Copy button */}
<button
  onClick={() => {
    const text = `${selectedIdea.title}\n\n${selectedIdea.description}\n\n${selectedIdea.brief || ''}`;
    handleCopyToClipboard(text);
  }}
  className="py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all flex items-center gap-2"
>
  <span>📋</span>
  <span>Copy</span>
</button>
```

### Thêm Edit Modal

Sau modal chi tiết idea, thêm edit modal:

```tsx
{/* Edit Modal */}
{editingIdea && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setEditingIdea(null)}
  >
    <div
      className="glass-card rounded-2xl p-6 max-w-2xl w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-bold text-midnight-100 mb-6">✏️ Edit Idea</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-midnight-300 mb-2">Title</label>
          <input
            type="text"
            value={editingIdea.title}
            onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
            className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-midnight-300 mb-2">Description</label>
          <textarea
            value={editingIdea.description}
            onChange={(e) => setEditingIdea({ ...editingIdea, description: e.target.value })}
            rows={8}
            className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100"
          />
        </div>

        {editingIdea.brief && (
          <div>
            <label className="block text-sm font-medium text-midnight-300 mb-2">Brief</label>
            <textarea
              value={editingIdea.brief}
              onChange={(e) => setEditingIdea({ ...editingIdea, brief: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => handleUpdateIdea(editingIdea.id, editingIdea)}
          className="flex-1 py-3 bg-mint-500 hover:bg-mint-400 text-white font-semibold rounded-xl transition-all"
        >
          💾 Save Changes
        </button>
        <button
          onClick={() => setEditingIdea(null)}
          className="py-3 px-6 bg-midnight-700 hover:bg-midnight-600 text-midnight-200 font-semibold rounded-xl transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

### Thêm tab "Approved Ideas"

Trong phần "Ideas List" section (dòng ~457), thêm tab switcher:

```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex gap-3">
    <button
      onClick={() => setViewMode('all')}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        viewMode === 'all'
          ? 'bg-midnight-600 text-white'
          : 'text-midnight-400 hover:text-midnight-200'
      }`}
    >
      📋 All Ideas ({ideas.length})
    </button>
    <button
      onClick={() => { setViewMode('approved'); fetchApprovedIdeas(); }}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        viewMode === 'approved'
          ? 'bg-mint-500/20 text-mint-400 border border-mint-500/30'
          : 'text-midnight-400 hover:text-midnight-200'
      }`}
    >
      ✅ Approved ({approvedIdeas.length})
    </button>
  </div>

  <button
    onClick={fetchIdeas}
    disabled={loading}
    className="px-4 py-2 text-sm bg-midnight-800/50 hover:bg-midnight-700/50 border border-midnight-600 rounded-lg text-midnight-300 transition-colors duration-200 flex items-center gap-2"
  >
    {loading ? <div className="spinner w-4 h-4 border-2" /> : <span>🔄</span>}
    Refresh
  </button>
</div>

{/* Show ideas based on viewMode */}
{(viewMode === 'all' ? ideas : approvedIdeas).map((idea, index) => (
  // ... existing idea card code
))}
```

### Fetch approved ideas on mount

Thêm vào useEffect:

```typescript
useEffect(() => {
  fetchIdeas();
  fetchApprovedIdeas();
}, []);
```

---

## 🎯 Tóm tắt

### Backend ✅ HOÀN THÀNH
- ✅ Sửa lỗi flowmap (JSON parsing)
- ✅ Cải thiện prompt ideas (academic, structured, 200-300 words)
- ✅ Update database schema (brief, flowmap, approved status)
- ✅ API endpoints cho approve/reject/get approved
- ✅ Auto-save brief và flowmap vào database

### Frontend ⚠️ CẦN THÊM CODE
Tôi đã cung cấp tất cả code cần thiết ở trên. Bạn chỉ cần:
1. Copy các function handlers vào file
2. Thêm nút Approve/Reject/Edit/Copy vào modal
3. Thêm Edit Modal
4. Thêm tab switcher cho Approved Ideas
5. Thêm `fetchApprovedIdeas()` vào useEffect

Tất cả code đã được viết sẵn, chỉ cần paste vào đúng vị trí!

---

## 🧪 Test

```bash
# 1. Generate ideas mới - check xem có chi tiết hơn không
POST /api/ideas/generate
Body: {
  "persona": "Content Creator",
  "industry": "Technology",
  "language": "vi"
}

# 2. Generate flowmap - check xem có tạo được không
POST /api/ideas/flowmap
Body: {
  "ideaId": 1,
  "title": "...",
  "description": "..."
}

# 3. Approve idea
PUT /api/ideas/1/approve

# 4. Get approved ideas
GET /api/ideas/approved

# 5. Update idea
PUT /api/ideas/1
Body: {
  "title": "Updated title",
  "description": "Updated description"
}
```

---

## 📞 Support

Nếu có lỗi, check:
1. Backend logs: Xem terminal backend
2. Frontend logs: Xem browser console (F12)
3. Database: `docker exec -it ai_idea_postgres psql -U postgres -d ai_ideas_db`

Enjoy! 🎉
