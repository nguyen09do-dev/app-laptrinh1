# Hướng dẫn sử dụng chức năng Bulk Delete

## Backend APIs

### 1. Bulk Delete Ideas
**Endpoint**: `POST /api/ideas/bulk-delete`

**Request Body**:
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully deleted 5 idea(s)",
  "deletedCount": 5
}
```

### 2. Bulk Delete Briefs
**Endpoint**: `POST /api/briefs/bulk-delete`

**Request Body**:
```json
{
  "ids": [1, 2, 3]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully deleted 3 brief(s)",
  "deletedCount": 3
}
```

## Frontend Usage

### Import utility functions:
```typescript
import { bulkDeleteIdeas, bulkDeleteBriefs, bulkDeleteContents } from '@/lib/bulkDelete';
import { showToast } from '@/lib/toast';
```

### Example 1: Bulk delete với checkbox selection
```typescript
const [selectedIds, setSelectedIds] = useState<number[]>([]);

// Khi user check/uncheck item
const handleToggleSelect = (id: number) => {
  setSelectedIds(prev =>
    prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]
  );
};

// Khi user click bulk delete button
const handleBulkDelete = async () => {
  if (selectedIds.length === 0) {
    showToast.error('Vui lòng chọn ít nhất 1 item để xóa');
    return;
  }

  const confirmed = window.confirm(
    `Bạn có chắc muốn xóa ${selectedIds.length} item(s)?`
  );

  if (!confirmed) return;

  const result = await bulkDeleteIdeas(selectedIds);

  if (result.success) {
    showToast.success(`Đã xóa ${result.deletedCount} idea(s)`);
    setSelectedIds([]);
    // Refresh data
    fetchIdeas();
  } else {
    showToast.error(result.error || 'Không thể xóa');
  }
};
```

### Example 2: Delete all items with filter
```typescript
// Xóa tất cả ideas có status = 'archived'
const handleDeleteAllArchived = async () => {
  const archivedIds = ideas
    .filter(idea => idea.status === 'archived')
    .map(idea => idea.id);

  if (archivedIds.length === 0) {
    showToast.info('Không có archived ideas để xóa');
    return;
  }

  const result = await bulkDeleteIdeas(archivedIds);

  if (result.success) {
    showToast.success(`Đã xóa ${result.deletedCount} archived idea(s)`);
    fetchIdeas();
  }
};
```

### Example 3: UI Component với checkbox
```tsx
<div className="space-y-2">
  {/* Select All checkbox */}
  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
    <input
      type="checkbox"
      checked={selectedIds.length === ideas.length}
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedIds(ideas.map(i => i.id));
        } else {
          setSelectedIds([]);
        }
      }}
    />
    <span>Chọn tất cả</span>

    {selectedIds.length > 0 && (
      <button
        onClick={handleBulkDelete}
        className="ml-auto px-4 py-1 bg-red-500 text-white rounded"
      >
        Xóa {selectedIds.length} item(s)
      </button>
    )}
  </div>

  {/* Item list */}
  {ideas.map(idea => (
    <div key={idea.id} className="flex items-center gap-2 p-2 border rounded">
      <input
        type="checkbox"
        checked={selectedIds.includes(idea.id)}
        onChange={() => handleToggleSelect(idea.id)}
      />
      <span>{idea.title}</span>
    </div>
  ))}
</div>
```

## Tips

1. **Validation**: Backend tự động validate:
   - `ids` array không được rỗng
   - `ids` phải là array of numbers

2. **Cascade Delete**: Khi xóa idea/brief, các records liên quan cũng bị xóa theo (cascade):
   - Xóa idea → xóa luôn brief và content liên quan
   - Xóa brief → xóa luôn content liên quan

3. **Performance**: Bulk delete sử dụng `ANY($1::int[])` trong SQL nên rất nhanh, có thể xóa hàng trăm records cùng lúc.

4. **User Experience**: Nên có:
   - Confirmation dialog trước khi xóa
   - Toast notification sau khi xóa
   - Loading state trong khi xóa
   - Clear selection sau khi xóa thành công

## Ví dụ hoàn chỉnh

Xem file `frontend/app/ideas/page.tsx` hoặc `frontend/app/briefs/page.tsx` để tham khảo implementation đầy đủ.
