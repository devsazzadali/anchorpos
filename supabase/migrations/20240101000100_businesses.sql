-- ============================================================
-- Migration 002: Businesses & Locations
-- ============================================================

CREATE TABLE businesses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  logo_url            TEXT,
  currency            VARCHAR(3)   NOT NULL DEFAULT 'BDT',
  currency_symbol     VARCHAR(5)   NOT NULL DEFAULT '৳',
  currency_position   VARCHAR(6)   DEFAULT 'before',
  decimal_separator   VARCHAR(1)   DEFAULT '.',
  thousand_separator  VARCHAR(1)   DEFAULT ',',
  decimal_places      SMALLINT     DEFAULT 2,
  timezone            VARCHAR(100) DEFAULT 'Asia/Dhaka',
  fiscal_year_start   DATE,
  tax_number          VARCHAR(100),
  email               VARCHAR(255),
  phone               VARCHAR(50),
  address             TEXT,
  website             VARCHAR(255),
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE business_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  location_code   VARCHAR(20)  NOT NULL,
  name            VARCHAR(255) NOT NULL,
  landmark        TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  country         VARCHAR(100) DEFAULT 'Bangladesh',
  zip_code        VARCHAR(20),
  phone           VARCHAR(50),
  alternate_phone VARCHAR(50),
  email           VARCHAR(255),
  tax_number      VARCHAR(100),
  invoice_scheme_id UUID,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, location_code)
);

-- Triggers
CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_business_locations_updated_at
  BEFORE UPDATE ON business_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses_own" ON businesses
  FOR ALL USING (id = auth_business_id());

CREATE POLICY "locations_own" ON business_locations
  FOR ALL USING (business_id = auth_business_id());

-- Indexes
CREATE INDEX idx_business_locations_business ON business_locations(business_id);
