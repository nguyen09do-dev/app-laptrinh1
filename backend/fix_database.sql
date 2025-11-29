-- Kiểm tra và thêm cột batch_id nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ideas' AND column_name = 'batch_id'
    ) THEN
        ALTER TABLE ideas ADD COLUMN batch_id TEXT;
        CREATE INDEX idx_ideas_batch_id ON ideas(batch_id);
        RAISE NOTICE 'Added batch_id column and index';
    ELSE
        RAISE NOTICE 'batch_id column already exists';
    END IF;
END $$;

-- Kiểm tra và thêm các cột mới nếu cần
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ideas' AND column_name = 'brief'
    ) THEN
        ALTER TABLE ideas ADD COLUMN brief TEXT;
        RAISE NOTICE 'Added brief column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ideas' AND column_name = 'flowmap'
    ) THEN
        ALTER TABLE ideas ADD COLUMN flowmap JSONB;
        RAISE NOTICE 'Added flowmap column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ideas' AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE ideas ADD COLUMN approved_at TIMESTAMP;
        RAISE NOTICE 'Added approved_at column';
    END IF;
END $$;

-- Cập nhật status enum nếu cần
DO $$
BEGIN
    -- Thay đổi check constraint để hỗ trợ các status mới
    ALTER TABLE ideas DROP CONSTRAINT IF EXISTS ideas_status_check;
    ALTER TABLE ideas ADD CONSTRAINT ideas_status_check 
        CHECK (status IN ('draft', 'generated', 'shortlisted', 'selected', 'approved', 'archived'));
    RAISE NOTICE 'Updated status constraint';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
