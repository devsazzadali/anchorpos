-- ============================================================
-- Migration 005: Tax Rates
-- ============================================================

CREATE TABLE tax_rates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  rate        DECIMAL(8,4) NOT NULL DEFAULT 0,
  type        VARCHAR(20)  DEFAULT 'percentage',
  is_default  BOOLEAN      DEFAULT FALSE,
  sub_taxes   JSONB        DEFAULT '[]',
  -- sub_taxes example:
  -- [{"name": "VAT", "rate": 15}, {"name": "SD", "rate": 5}]
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_tax_rates_updated_at
  BEFORE UPDATE ON tax_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tax_rates_own" ON tax_rates
  FOR ALL USING (business_id = auth_business_id());

CREATE INDEX idx_tax_rates_business ON tax_rates(business_id);
