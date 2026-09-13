-- Migration 009: Invoice Schemes + Atomic Number Generator
CREATE TABLE invoice_schemes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  prefix       VARCHAR(20) DEFAULT '',
  start_number INTEGER DEFAULT 1,
  total_digits SMALLINT DEFAULT 4,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE invoice_counters (
  scheme_id     UUID PRIMARY KEY REFERENCES invoice_schemes(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  last_updated  TIMESTAMPTZ DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_scheme_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_scheme invoice_schemes%ROWTYPE;
  v_next   INTEGER;
BEGIN
  SELECT * INTO v_scheme FROM invoice_schemes WHERE id = p_scheme_id FOR UPDATE;
  UPDATE invoice_counters SET current_value = current_value + 1, last_updated = NOW() WHERE scheme_id = p_scheme_id RETURNING current_value INTO v_next;
  IF NOT FOUND THEN
    INSERT INTO invoice_counters(scheme_id, current_value) VALUES (p_scheme_id, v_scheme.start_number) RETURNING current_value INTO v_next;
  END IF;
  RETURN v_scheme.prefix || lpad(v_next::TEXT, v_scheme.total_digits, '0');
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_invoice_schemes_updated_at BEFORE UPDATE ON invoice_schemes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE invoice_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schemes_own" ON invoice_schemes FOR ALL USING (business_id = auth_business_id());
