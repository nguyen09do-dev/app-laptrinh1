-- Migration script để cập nhật schema cho AI-only flow
-- Chạy script này nếu database đã tồn tại

-- 1. Thêm cột batch_id nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ideas' AND column_name = 'batch_id'
    ) THEN
        ALTER TABLE ideas ADD COLUMN batch_id TEXT;
    END IF;
END $$;

-- 2. Cập nhật status constraint
-- Xóa constraint cũ
ALTER TABLE ideas DROP CONSTRAINT IF EXISTS ideas_status_check;

-- Thêm constraint mới với status values mới
ALTER TABLE ideas ADD CONSTRAINT ideas_status_check 
    CHECK (status IN ('generated', 'shortlisted', 'approved', 'archived'));

-- 3. Cập nhật các records có status cũ thành 'generated'
UPDATE ideas 
SET status = 'generated' 
WHERE status NOT IN ('generated', 'shortlisted', 'approved', 'archived');

-- 4. Set default status cho các records NULL
UPDATE ideas 
SET status = 'generated' 
WHERE status IS NULL;

-- 5. Tạo indexes
CREATE INDEX IF NOT EXISTS idx_ideas_batch_id ON ideas(batch_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

-- 6. Xóa các cột không cần thiết (nếu có)
-- Lưu ý: Chỉ xóa nếu chắc chắn không cần dữ liệu
-- ALTER TABLE ideas DROP COLUMN IF EXISTS brief;
-- ALTER TABLE ideas DROP COLUMN IF EXISTS flowmap;
-- ALTER TABLE ideas DROP COLUMN IF EXISTS approved_at;







