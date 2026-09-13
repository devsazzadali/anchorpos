-- ============================================================
-- Migration 011: Purchases
-- ============================================================

CREATE TABLE purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id),
  location_id     UUID NOT NULL REFERENCES business_locations(id),
  supplier_id     UUID REFERENCES contacts(id),
  ref_no          VARCHAR(100) NOT NULL,
  invoice_no      VARCHAR(100),
  purchase_date   DATE NOT NULL,
  due_date        DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'received'
                    CHECK (status IN ('received','pending','ordered')),
  payment_status  VARCHAR(20) NOT NULL DEFAULT 'due'
                    CHECK (payment_status IN ('paid','partial','due')),
  subtotal        BIGINT NOT NULL DEFAULT 0,
  tax_amount      BIGINT DEFAULT 0,
  discount_amount BIGINT DEFAULT 0,
  shipping_amount BIGINT DEFAULT 0,
  grand_total     BIGINT NOT NULL DEFAULT 0,
  amount_paid     BIGINT DEFAULT 0,
  amount_due      BIGINT GENERATED ALWAYS AS (grand_total - amount_paid) STORED,
  tax_id          UUID REFERENCES tax_rates(id),
  discount_pct    DECIMAL(8,4) DEFAULT 0,
  notes           TEXT,
  document_url    TEXT,
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, ref_no)
);

CREATE TABLE purchase_lines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id  UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  quantity     DECIMAL(15,4) NOT NULL,
  unit_cost    BIGINT NOT NULL,
  tax_id       UUID REFERENCES tax_rates(id),
  tax_amount   BIGINT DEFAULT 0,
  discount_amount BIGINT DEFAULT 0,
  subtotal     BIGINT NOT NULL,
  lot_number   VARCHAR(100),
  expiry_date  DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id  UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  business_id  UUID NOT NULL,
  account_id   UUID NOT NULL REFERENCES payment_accounts(id),
  amount       BIGINT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method       VARCHAR(30),
  notes        TEXT,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update payment_status when payments change
CREATE OR REPLACE FUNCTION update_purchase_payment_status()
RETURNS TRIGGER AS $$
DECLARE v_total BIGINT; v_paid BIGINT;
BEGIN
  SELECT grand_total INTO v_total FROM purchases WHERE id = COALESCE(NEW.purchase_id, OLD.purchase_id);
  SELECT COALESCE(SUM(amount),0) INTO v_paid FROM purchase_payments WHERE purchase_id = COALESCE(NEW.purchase_id, OLD.purchase_id);
  UPDATE purchases
    SET amount_paid = v_paid,
        payment_status = CASE
          WHEN v_paid >= v_total THEN 'paid'
          WHEN v_paid > 0 THEN 'partial'
          ELSE 'due' END
    WHERE id = COALESCE(NEW.purchase_id, OLD.purchase_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchase_payment_status
  AFTER INSERT OR UPDATE OR DELETE ON purchase_payments
  FOR EACH ROW EXECUTE FUNCTION update_purchase_payment_status();

CREATE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_purchases_business  ON purchases(business_id);
CREATE INDEX idx_purchases_supplier  ON purchases(supplier_id);
CREATE INDEX idx_purchases_date      ON purchases(purchase_date DESC);
CREATE INDEX idx_purchases_status    ON purchases(status, payment_status);
CREATE INDEX idx_purchase_lines_pur  ON purchase_lines(purchase_id);
CREATE INDEX idx_purchase_lines_prod ON purchase_lines(product_id);

-- RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_own" ON purchases FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "purchase_lines_own" ON purchase_lines
  FOR ALL USING (purchase_id IN (SELECT id FROM purchases WHERE business_id = auth_business_id()));
CREATE POLICY "purchase_payments_own" ON purchase_payments FOR ALL USING (business_id = auth_business_id());
