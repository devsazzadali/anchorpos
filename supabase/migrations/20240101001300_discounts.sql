-- Migration 014: Discounts & Promotions
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(100), discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  amount DECIMAL(10,4) NOT NULL DEFAULT 0, priority SMALLINT DEFAULT 1,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, is_active BOOLEAN DEFAULT TRUE, applies_to_all BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE discount_products (
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (discount_id, product_id)
);
CREATE TRIGGER trg_discounts_updated_at BEFORE UPDATE ON discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "discounts_own" ON discounts FOR ALL USING (business_id = auth_business_id());
