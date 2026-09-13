-- ============================================================
-- Migration 001: Core Extensions & Helper Functions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Fuzzy text search

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get current authenticated business_id from JWT claims
CREATE OR REPLACE FUNCTION auth_business_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'business_id')::UUID;
$$ LANGUAGE SQL STABLE;

-- Get current authenticated user_id
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;
