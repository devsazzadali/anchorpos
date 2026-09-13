-- ============================================================
-- Migration 004: Contacts (Suppliers & Customers)
-- ============================================================

CREATE TABLE customer_groups (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name             VARCHAR(100) NOT NULL,
  calculation_base VARCHAR(20)  DEFAULT 'percentage',
  amount           DECIMAL(10,4) DEFAULT 0,
  description      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_code     VARCHAR(20)  NOT NULL,
  type             VARCHAR(20)  NOT NULL CHECK (type IN ('supplier','customer','both')),
  business_name    VARCHAR(255),
  name             VARCHAR(255) NOT NULL,
  tax_number       VARCHAR(100),
  email            VARCHAR(255),
  mobile           VARCHAR(50),
  alternate_mobile VARCHAR(50),
  address_line1    TEXT,
  address_line2    TEXT,
  city             VARCHAR(100),
  state            VARCHAR(100),
  country          VARCHAR(100) DEFAULT 'Bangladesh',
  zip_code         VARCHAR(20),
  shipping_address TEXT,
  pay_term_number  INTEGER      DEFAULT 0,
  pay_term_type    VARCHAR(10)  DEFAULT 'days',
  opening_balance  BIGINT       DEFAULT 0,
  opening_balance_date DATE,
  credit_limit     BIGINT       DEFAULT 0,
  customer_group_id UUID        REFERENCES customer_groups(id),
  is_active        BOOLEAN      DEFAULT TRUE,
  deleted_at       TIMESTAMPTZ,
  created_by       UUID         REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(business_id, contact_code)
);

-- Triggers
CREATE TRIGGER trg_customer_groups_updated_at
  BEFORE UPDATE ON customer_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Full-text search index
CREATE INDEX idx_contacts_fts ON contacts
  USING gin(to_tsvector('english', name || ' ' || COALESCE(business_name, '') || ' ' || COALESCE(mobile, '')));
CREATE INDEX idx_contacts_business ON contacts(business_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_mobile ON contacts(mobile);
CREATE INDEX idx_contacts_code ON contacts(business_id, contact_code);

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_own" ON contacts
  FOR ALL USING (business_id = auth_business_id());

CREATE POLICY "customer_groups_own" ON customer_groups
  FOR ALL USING (business_id = auth_business_id());
