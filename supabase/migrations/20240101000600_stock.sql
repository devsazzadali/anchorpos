-- ============================================================
-- Migration 007: Stock Management (Ledger-Based)
-- ============================================================
-- DESIGN PRINCIPLE: Never UPDATE stock directly.
-- Current stock = SUM(all movements for product+location)
-- This gives full audit trail and is race-condition safe.

CREATE TABLE stock_movements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    UUID NOT NULL REFERENCES businesses(id),
  product_id     UUID NOT NULL REFERENCES products(id),
  variation_id   UUID REFERENCES product_variations(id),
  location_id    UUID NOT NULL REFERENCES business_locations(id),
  -- Positive = stock IN, Negative = stock OUT
  quantity       DECIMAL(15,4) NOT NULL,
  unit_cost      BIGINT DEFAULT 0,
  movement_type  VARCHAR(30) NOT NULL
    CHECK (movement_type IN (
      'OPENING_STOCK',
      'PURCHASE',
      'PURCHASE_RETURN',
      'SALE',
      'SALE_RETURN',
      'ADJUSTMENT_NORMAL',
      'ADJUSTMENT_ABNORMAL',
      'TRANSFER_IN',
      'TRANSFER_OUT'
    )),
  reference_id   UUID,
  reference_type VARCHAR(30),
  lot_number     VARCHAR(100),
  serial_number  VARCHAR(255),
  expiry_date    DATE,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
  -- NOTE: No updated_at — stock movements are immutable (append-only)
);

-- Materialized view: current stock per product+location
-- More efficient than SELECT SUM() every time
CREATE MATERIALIZED VIEW mv_current_stock AS
  SELECT
    product_id,
    variation_id,
    location_id,
    business_id,
    SUM(quantity)              AS qty_available,
    SUM(quantity * unit_cost)  AS stock_value
  FROM stock_movements
  GROUP BY product_id, variation_id, location_id, business_id;

-- Unique index (needed for CONCURRENTLY refresh)
CREATE UNIQUE INDEX idx_mv_current_stock
  ON mv_current_stock(product_id, COALESCE(variation_id, '00000000-0000-0000-0000-000000000000'::UUID), location_id);

-- Function to get current stock (always live calculation)
CREATE OR REPLACE FUNCTION get_current_stock(
  p_product_id  UUID,
  p_location_id UUID,
  p_variation_id UUID DEFAULT NULL
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(quantity), 0)
  FROM stock_movements
  WHERE product_id  = p_product_id
    AND location_id = p_location_id
    AND (p_variation_id IS NULL OR variation_id = p_variation_id);
$$ LANGUAGE SQL STABLE;

-- Indexes
CREATE INDEX idx_stock_movements_product  ON stock_movements(product_id, location_id);
CREATE INDEX idx_stock_movements_business ON stock_movements(business_id);
CREATE INDEX idx_stock_movements_created  ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_ref      ON stock_movements(reference_id, reference_type);

-- RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_movements_own" ON stock_movements
  FOR ALL USING (business_id = auth_business_id());
