# TODO: Thêm Bulk Delete UI vào Ideas Page

## ✅ Đã làm xong:
1. ✅ Backend APIs (`POST /api/ideas/bulk-delete`, `/api/briefs/bulk-delete`)
2. ✅ Frontend utilities (`frontend/lib/bulkDelete.ts`)
3. ✅ State management (selectedIds, bulkDeleting)
4. ✅ Handler functions (handleBulkDelete, handleToggleSelect, handleToggleSelectAll)
5. ✅ Import Trash2 icon from lucide-react

## ⚠️ CẦN LÀM: Thêm UI Elements

### 1. Thêm Bulk Action Bar (sau dòng 578, trước Filter tabs)

```tsx
{/* Bulk Actions Bar */}
{selectedIds.length > 0 && (
  <div className="mb-4 p-4 bg-midnight-800/80 border border-midnight-600 rounded-xl flex items-center justify-between">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={selectedIds.length === filteredIdeas.length && filteredIdeas.length > 0}
        onChange={handleToggleSelectAll}
        className="w-5 h-5 rounded border-midnight-500 text-ocean-400 focus:ring-ocean-500"
      />
      <span className="text-midnight-200">
        Đã chọn <strong>{selectedIds.length}</strong> idea(s)
      </span>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => setSelectedIds([])}
        className="px-4 py-2 text-midnight-400 hover:text-midnight-200 transition-colors"
      >
        Bỏ chọn
      </button>
      <button
        onClick={handleBulkDelete}
        disabled={bulkDeleting}
        className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <Trash2 size={18} />
        {bulkDeleting ? 'Đang xóa...' : `Xóa ${selectedIds.length} item(s)`}
      </button>
    </div>
  </div>
)}
```

### 2. Thêm Checkbox vào mỗi Card (Grid View)

Tìm dòng ~766 nơi render idea card, thêm checkbox:

```tsx
<div
  key={idea.id}
  onClick={() => setSelectedIdea(idea)}
  className="glass-card rounded-xl p-5 cursor-pointer hover:border-midnight-500 transition-all duration-200 hover:scale-[1.02] relative"
>
  {/* Checkbox - Top Left Corner */}
  <div className="absolute top-3 left-3 z-10">
    <input
      type="checkbox"
      checked={selectedIds.includes(idea.id)}
      onChange={(e) => {
        e.stopPropagation();
        handleToggleSelect(idea.id);
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-5 h-5 rounded border-midnight-500 text-ocean-400 focus:ring-ocean-500 cursor-pointer"
    />
  </div>

  {/* Rest of card content... */}
  <div className="flex items-start justify-between mb-3">
    {getStatusBadge(idea.status)}
    <button
      onClick={(e) => { e.stopPropagation(); handleDelete(idea.id); }}
      className="text-midnight-500 hover:text-coral-400 transition-colors p-1"
    >
      🗑️
    </button>
  </div>
  {/* ... */}
</div>
```

### 3. Thêm Select All Checkbox vào Header

Tìm phần header "📊 Ideas Generated" (dòng ~626), thêm:

```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={selectedIds.length === filteredIdeas.length && filteredIdeas.length > 0}
      onChange={handleToggleSelectAll}
      className="w-5 h-5 rounded border-midnight-500 text-ocean-400 focus:ring-ocean-500"
      title="Select all"
    />
    <h2 className="text-3xl font-bold text-midnight-50">
      📊 Ideas Generated
    </h2>
  </div>

  <div className="flex items-center gap-3">
    {/* View Mode Toggles */}
    <button
      onClick={() => setViewMode('grid')}
      className={`p-2 rounded-lg transition-colors ${
        viewMode === 'grid'
          ? 'bg-ocean-500 text-white'
          : 'bg-midnight-700 text-midnight-300 hover:bg-midnight-600'
      }`}
    >
      <LayoutGrid size={20} />
    </button>
    <button
      onClick={() => setViewMode('table')}
      className={`p-2 rounded-lg transition-colors ${
        viewMode === 'table'
          ? 'bg-ocean-500 text-white'
          : 'bg-midnight-700 text-midnight-300 hover:bg-midnight-600'
      }`}
    >
      <Table2 size={20} />
    </button>
  </div>
</div>
```

### 4. Update IdeasTableView Component

File: `frontend/app/components/IdeasTableView.tsx`

Thêm props:
```tsx
interface IdeasTableViewProps {
  ideas: Idea[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  // ... existing props
}
```

Thêm checkbox column vào table.

---

## 🎯 Kết quả mong đợi:

- [ ] Hiển thị bulk action bar khi có items được chọn
- [ ] Checkbox ở mỗi card/row
- [ ] Select all checkbox ở header
- [ ] Button "Xóa X item(s)" hoạt động
- [ ] Toast notification sau khi xóa thành công
- [ ] Clear selection sau khi xóa

---

## 🧪 Test Cases:

1. Select 1 idea → Click Delete → Confirm → Should delete 1
2. Select all → Click Delete → Confirm → Should delete all
3. Select 3 ideas → Click "Bỏ chọn" → Selection cleared
4. Delete while modal open → Modal should close if deleted idea
5. Refresh page → Selection should reset

---

## 📍 Vị trí file cần edit:

- `frontend/app/ideas/page.tsx` - Thêm UI elements ở 3 vị trí trên
- `frontend/app/components/IdeasTableView.tsx` - Thêm checkbox column (nếu dùng table view)

**Handlers đã sẵn sàng, chỉ cần thêm UI!**
