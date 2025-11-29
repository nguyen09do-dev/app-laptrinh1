-- Add implementation column to ideas table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ideas' AND column_name = 'implementation'
    ) THEN
        ALTER TABLE ideas ADD COLUMN implementation JSONB;
        COMMENT ON COLUMN ideas.implementation IS 'Detailed implementation plan with steps, resources, timeline';
    END IF;
END $$;
