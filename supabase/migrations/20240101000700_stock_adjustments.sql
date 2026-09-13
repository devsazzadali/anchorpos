-- Migration 008: Stock Adjustments
CREATE TABLE stock_adjustments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id),
  location_id     UUID NOT NULL REFERENCES business_locations(id),
  ref_no          VARCHAR(50) NOT NULL,
  date            DATE NOT NULL,
  adjustment_type VARCHAR(20) DEFAULT 'normal' CHECK (adjustment_type IN ('normal','abnormal')),
  total_amount    BIGINT DEFAULT 0,
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE stock_adjustment_lines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id UUID NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id),
  variation_id  UUID REFERENCES product_variations(id),
  quantity      DECIMAL(15,4) NOT NULL,
  unit_cost     BIGINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_stock_adj_updated_at BEFORE UPDATE ON stock_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_stock_adj_business ON stock_adjustments(business_id);
CREATE INDEX idx_stock_adj_lines_adj ON stock_adjustment_lines(adjustment_id);
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustment_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_adj_own" ON stock_adjustments FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "stock_adj_lines_own" ON stock_adjustment_lines FOR ALL USING (adjustment_id IN (SELECT id FROM stock_adjustments WHERE business_id = auth_business_id()));
