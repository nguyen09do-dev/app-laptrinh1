-- Migration: Create integration_credentials table
-- Version: 009
-- Description: Store credentials for third-party integrations (Mailchimp, WordPress, etc.)

-- =====================================================
-- 1. Create integration_credentials table
-- =====================================================
CREATE TABLE IF NOT EXISTS integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure only one credential per platform
    CONSTRAINT unique_platform UNIQUE (platform),

    -- Validate platform values
    CONSTRAINT valid_platform CHECK (
        platform IN ('mailchimp', 'wordpress')
    )
);

-- Create index on platform for faster lookups
CREATE INDEX IF NOT EXISTS idx_integration_credentials_platform ON integration_credentials(platform);

-- Create index on config JSONB for queries
CREATE INDEX IF NOT EXISTS idx_integration_credentials_config ON integration_credentials USING GIN (config);

-- =====================================================
-- 2. Create function for auto-updating updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_integration_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. Create trigger for auto-updating updated_at
-- =====================================================
DROP TRIGGER IF EXISTS trigger_integration_credentials_updated_at ON integration_credentials;
CREATE TRIGGER trigger_integration_credentials_updated_at
    BEFORE UPDATE ON integration_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_credentials_updated_at();

-- =====================================================
-- 4. Add comments for documentation
-- =====================================================
COMMENT ON TABLE integration_credentials IS 'Store API credentials for third-party integrations';
COMMENT ON COLUMN integration_credentials.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN integration_credentials.platform IS 'Platform name: mailchimp, wordpress';
COMMENT ON COLUMN integration_credentials.config IS 'JSONB config containing API keys, URLs, and other credentials';
COMMENT ON COLUMN integration_credentials.created_at IS 'Timestamp when credential was created';
COMMENT ON COLUMN integration_credentials.updated_at IS 'Auto-updated timestamp on each modification';

-- =====================================================
-- 5. Verify migration
-- =====================================================
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'integration_credentials'
    ) INTO table_exists;

    IF table_exists THEN
        RAISE NOTICE '✅ Migration 009 completed successfully!';
        RAISE NOTICE '   - integration_credentials table: OK';
    ELSE
        RAISE EXCEPTION '❌ Migration verification failed';
    END IF;
END $$;
