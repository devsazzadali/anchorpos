-- ============================================================
-- Migration 003: Users & Roles
-- ============================================================

CREATE TABLE roles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  description  TEXT,
  permissions  JSONB NOT NULL DEFAULT '{}',
  -- permissions shape:
  -- {
  --   "products":  { "view": true, "create": true, "edit": true, "delete": false },
  --   "purchases": { "view": true, "create": true, "edit": false, "delete": false },
  --   "sells":     { "view": true, "create": true, "edit": true, "delete": false },
  --   "expenses":  { "view": true, "create": true, "edit": true, "delete": false },
  --   "contacts":  { "view": true, "create": true, "edit": true, "delete": false },
  --   "reports":   { "view": true },
  --   "users":     { "view": false, "create": false, "edit": false, "delete": false },
  --   "settings":  { "view": false, "edit": false }
  -- }
  is_system    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, name)
);

CREATE TABLE user_profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role_id             UUID NOT NULL REFERENCES roles(id),
  location_id         UUID REFERENCES business_locations(id),
  first_name          VARCHAR(100) NOT NULL,
  last_name           VARCHAR(100),
  username            VARCHAR(100),
  phone               VARCHAR(50),
  avatar_url          TEXT,
  language            VARCHAR(10)  DEFAULT 'en',
  max_discount_pct    DECIMAL(5,2) DEFAULT 0,
  is_active           BOOLEAN      DEFAULT TRUE,
  is_commission_agent BOOLEAN      DEFAULT FALSE,
  commission_rate     DECIMAL(5,2) DEFAULT 0,
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(business_id, username)
);

-- Convenience view joining user + role + email
CREATE VIEW v_users AS
  SELECT
    up.*,
    r.name        AS role_name,
    r.permissions,
    au.email,
    bl.name       AS location_name
  FROM user_profiles up
  JOIN roles r ON r.id = up.role_id
  JOIN auth.users au ON au.id = up.id
  LEFT JOIN business_locations bl ON bl.id = up.location_id;

-- Triggers
CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_own" ON roles
  FOR ALL USING (business_id = auth_business_id());

CREATE POLICY "profiles_own" ON user_profiles
  FOR ALL USING (business_id = auth_business_id());

-- Indexes
CREATE INDEX idx_user_profiles_business ON user_profiles(business_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role_id);
CREATE INDEX idx_roles_business ON roles(business_id);
