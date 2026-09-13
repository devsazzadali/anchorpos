-- ============================================================
-- Migration 012: Sells / POS
-- ============================================================

CREATE TABLE sells (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID NOT NULL REFERENCES businesses(id),
  location_id         UUID NOT NULL REFERENCES business_locations(id),
  customer_id         UUID REFERENCES contacts(id),
  commission_agent_id UUID REFERENCES user_profiles(id),
  invoice_no          VARCHAR(100) NOT NULL,
  sell_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  status              VARCHAR(20) NOT NULL DEFAULT 'final'
                        CHECK (status IN ('draft','quotation','final')),
  payment_status      VARCHAR(20) NOT NULL DEFAULT 'due'
                        CHECK (payment_status IN ('paid','partial','due')),
  subtotal        BIGINT NOT NULL DEFAULT 0,
  tax_amount      BIGINT DEFAULT 0,
  discount_amount BIGINT DEFAULT 0,
  shipping_amount BIGINT DEFAULT 0,
  grand_total     BIGINT NOT NULL DEFAULT 0,
  amount_paid     BIGINT DEFAULT 0,
  amount_due      BIGINT GENERATED ALWAYS AS (grand_total - amount_paid) STORED,
  change_amount   BIGINT DEFAULT 0,
  tax_id          UUID REFERENCES tax_rates(id),
  discount_pct    DECIMAL(8,4) DEFAULT 0,
  notes           TEXT,
  shipping_status VARCHAR(20) DEFAULT 'not_applicable'
                    CHECK (shipping_status IN ('not_applicable','ordered','packed','shipped','delivered','cancelled')),
  delivered_to    VARCHAR(255),
  shipping_details TEXT,
  pos_session_id  UUID,
  is_offline_sale BOOLEAN DEFAULT FALSE,
  local_id        VARCHAR(100) UNIQUE,
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, invoice_no)
);

CREATE TABLE sell_lines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sell_id        UUID NOT NULL REFERENCES sells(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id),
  variation_id   UUID REFERENCES product_variations(id),
  quantity       DECIMAL(15,4) NOT NULL,
  unit_price     BIGINT NOT NULL,
  tax_id         UUID REFERENCES tax_rates(id),
  tax_amount     BIGINT DEFAULT 0,
  discount_amount BIGINT DEFAULT 0,
  subtotal       BIGINT NOT NULL,
  serial_numbers TEXT[],
  warranty_id    UUID REFERENCES warranties(id),
  lot_number     VARCHAR(100),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sell_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sell_id           UUID NOT NULL REFERENCES sells(id) ON DELETE CASCADE,
  business_id       UUID NOT NULL,
  account_id        UUID NOT NULL REFERENCES payment_accounts(id),
  amount            BIGINT NOT NULL,
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  method            VARCHAR(30),
  card_transaction_no VARCHAR(100),
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sell_returns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id),
  sell_id      UUID NOT NULL REFERENCES sells(id),
  ref_no       VARCHAR(100) NOT NULL,
  return_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount BIGINT NOT NULL DEFAULT 0,
  notes        TEXT,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sell_return_lines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id    UUID NOT NULL REFERENCES sell_returns(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  quantity     DECIMAL(15,4) NOT NULL,
  unit_price   BIGINT NOT NULL,
  subtotal     BIGINT NOT NULL
);

CREATE TABLE pos_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id),
  location_id     UUID NOT NULL REFERENCES business_locations(id),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  opened_at       TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  opening_balance BIGINT DEFAULT 0,
  closing_balance BIGINT,
  notes           TEXT,
  status          VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open','closed'))
);

-- Auto-update payment_status when sell_payments change
CREATE OR REPLACE FUNCTION update_sell_payment_status()
RETURNS TRIGGER AS $$
DECLARE v_total BIGINT; v_paid BIGINT;
BEGIN
  SELECT grand_total INTO v_total FROM sells WHERE id = COALESCE(NEW.sell_id, OLD.sell_id);
  SELECT COALESCE(SUM(amount),0) INTO v_paid FROM sell_payments WHERE sell_id = COALESCE(NEW.sell_id, OLD.sell_id);
  UPDATE sells
    SET amount_paid = v_paid,
        payment_status = CASE
          WHEN v_paid >= v_total THEN 'paid'
          WHEN v_paid > 0 THEN 'partial'
          ELSE 'due' END
    WHERE id = COALESCE(NEW.sell_id, OLD.sell_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sell_payment_status
  AFTER INSERT OR UPDATE OR DELETE ON sell_payments
  FOR EACH ROW EXECUTE FUNCTION update_sell_payment_status();

CREATE TRIGGER trg_sells_updated_at
  BEFORE UPDATE ON sells FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_sells_business  ON sells(business_id);
CREATE INDEX idx_sells_customer  ON sells(customer_id);
CREATE INDEX idx_sells_date      ON sells(sell_date DESC);
CREATE INDEX idx_sells_status    ON sells(status, payment_status);
CREATE INDEX idx_sells_invoice   ON sells(invoice_no);
CREATE INDEX idx_sells_local_id  ON sells(local_id);
CREATE INDEX idx_sell_lines_sell ON sell_lines(sell_id);
CREATE INDEX idx_sell_lines_prod ON sell_lines(product_id);

-- RLS
ALTER TABLE sells ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_return_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sells_own" ON sells FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "sell_lines_own" ON sell_lines FOR ALL USING (sell_id IN (SELECT id FROM sells WHERE business_id = auth_business_id()));
CREATE POLICY "sell_payments_own" ON sell_payments FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "sell_returns_own" ON sell_returns FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "sell_return_lines_own" ON sell_return_lines FOR ALL USING (return_id IN (SELECT id FROM sell_returns WHERE business_id = auth_business_id()));
CREATE POLICY "pos_sessions_own" ON pos_sessions FOR ALL USING (business_id = auth_business_id());
