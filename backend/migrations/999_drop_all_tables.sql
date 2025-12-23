-- Drop all tables to start fresh
-- WARNING: This will delete ALL data!

DROP TABLE IF EXISTS derivatives CASCADE;
DROP TABLE IF EXISTS content_versions CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS content_packs CASCADE;
DROP TABLE IF EXISTS briefs CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS integration_credentials CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop vector extension if exists
DROP EXTENSION IF EXISTS vector CASCADE;

