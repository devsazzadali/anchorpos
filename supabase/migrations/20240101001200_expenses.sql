-- Migration 013: Expenses
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, code VARCHAR(20), description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID NOT NULL REFERENCES businesses(id),
  location_id UUID REFERENCES business_locations(id), category_id UUID REFERENCES expense_categories(id),
  ref_no VARCHAR(100) NOT NULL, expense_date DATE NOT NULL,
  amount BIGINT NOT NULL, tax_id UUID REFERENCES tax_rates(id), tax_amount BIGINT DEFAULT 0,
  account_id UUID REFERENCES payment_accounts(id),
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid','pending')),
  payment_date DATE, note TEXT, document_url TEXT, deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, ref_no)
);
CREATE TRIGGER trg_expense_categories_updated_at BEFORE UPDATE ON expense_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_expenses_business ON expenses(business_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expense_cats_own" ON expense_categories FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "expenses_own" ON expenses FOR ALL USING (business_id = auth_business_id());
