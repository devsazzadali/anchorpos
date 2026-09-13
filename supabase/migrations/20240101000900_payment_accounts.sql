-- Migration 010: Payment Accounts (Cash, Bank, Mobile)
CREATE TABLE payment_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  account_type    VARCHAR(20) NOT NULL CHECK (account_type IN ('cash','bank','mobile')),
  account_number  VARCHAR(100),
  bank_name       VARCHAR(255),
  branch          VARCHAR(255),
  opening_balance BIGINT DEFAULT 0,
  opening_date    DATE,
  note            TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE account_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id),
  account_id       UUID NOT NULL REFERENCES payment_accounts(id),
  amount           BIGINT NOT NULL,
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('OPENING','PURCHASE_PAYMENT','SELL_PAYMENT','EXPENSE','REFUND_IN','REFUND_OUT','TRANSFER_IN','TRANSFER_OUT','ADJUSTMENT')),
  reference_id     UUID,
  reference_type   VARCHAR(30),
  notes            TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION get_account_balance(p_account_id UUID) RETURNS BIGINT AS $$ SELECT COALESCE(SUM(amount),0) FROM account_transactions WHERE account_id = p_account_id; $$ LANGUAGE SQL STABLE;
CREATE TRIGGER trg_payment_accounts_updated_at BEFORE UPDATE ON payment_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_account_txn_account ON account_transactions(account_id);
CREATE INDEX idx_account_txn_date ON account_transactions(transaction_date DESC);
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_accounts_own" ON payment_accounts FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "account_txn_own" ON account_transactions FOR ALL USING (business_id = auth_business_id());
