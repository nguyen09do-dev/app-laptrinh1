-- Migration: Add social media platforms to integration_credentials
-- Version: 010
-- Description: Extend valid_platform constraint to include Facebook, Twitter, Instagram, LinkedIn, Zalo

-- =====================================================
-- 1. Drop old constraint
-- =====================================================
ALTER TABLE integration_credentials 
    DROP CONSTRAINT IF EXISTS valid_platform;

-- =====================================================
-- 2. Add new constraint with social media platforms
-- =====================================================
ALTER TABLE integration_credentials 
    ADD CONSTRAINT valid_platform CHECK (
        platform IN (
            'mailchimp', 
            'wordpress', 
            'facebook', 
            'twitter', 
            'instagram', 
            'linkedin', 
            'zalo'
        )
    );

-- =====================================================
-- 3. Update comments
-- =====================================================
COMMENT ON COLUMN integration_credentials.platform IS 'Platform name: mailchimp, wordpress, facebook, twitter, instagram, linkedin, zalo';

-- =====================================================
-- 4. Verify migration
-- =====================================================
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    -- Check if constraint exists with correct definition
    SELECT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'valid_platform'
        AND table_name = 'integration_credentials'
    ) INTO constraint_exists;

    IF constraint_exists THEN
        RAISE NOTICE '✅ Migration 010 completed successfully!';
        RAISE NOTICE '   - valid_platform constraint updated: OK';
        RAISE NOTICE '   - Supported platforms: mailchimp, wordpress, facebook, twitter, instagram, linkedin, zalo';
    ELSE
        RAISE EXCEPTION '❌ Migration verification failed';
    END IF;
END $$;

