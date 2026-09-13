-- ============================================================
-- Migration 017: Database Views (for Reports & Dashboard)
-- ============================================================

-- Purchase summary per supplier
CREATE VIEW v_purchase_summary AS
  SELECT p.business_id, p.supplier_id, c.name AS supplier_name,
    COUNT(p.id) AS total_purchases,
    SUM(p.grand_total) AS total_amount,
    SUM(p.amount_paid) AS total_paid,
    SUM(p.amount_due) AS total_due
  FROM purchases p LEFT JOIN contacts c ON c.id = p.supplier_id
  WHERE p.deleted_at IS NULL
  GROUP BY p.business_id, p.supplier_id, c.name;

-- Sales summary per customer per month
CREATE VIEW v_sell_summary AS
  SELECT s.business_id, s.customer_id, c.name AS customer_name, s.location_id,
    DATE_TRUNC('month', s.sell_date) AS month,
    COUNT(s.id) AS total_sales,
    SUM(s.grand_total) AS total_amount,
    SUM(s.amount_paid) AS total_paid,
    SUM(s.amount_due) AS total_due
  FROM sells s LEFT JOIN contacts c ON c.id = s.customer_id
  WHERE s.deleted_at IS NULL AND s.status = 'final'
  GROUP BY s.business_id, s.customer_id, c.name, s.location_id, DATE_TRUNC('month', s.sell_date);

-- Profit & Loss per month
CREATE VIEW v_profit_loss AS
  SELECT s.business_id,
    DATE_TRUNC('month', s.sell_date) AS month,
    SUM(s.grand_total) AS total_sales,
    SUM(s.tax_amount) AS total_tax_collected,
    SUM(s.discount_amount) AS total_discounts_given,
    (SELECT COALESCE(SUM(e.amount),0) FROM expenses e
     WHERE e.business_id = s.business_id
       AND DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', s.sell_date)
       AND e.deleted_at IS NULL) AS total_expenses
  FROM sells s
  WHERE s.deleted_at IS NULL AND s.status = 'final'
  GROUP BY s.business_id, DATE_TRUNC('month', s.sell_date);

-- Trending products (last 30 days)
CREATE VIEW v_trending_products AS
  SELECT sl.product_id, p.name, p.sku, s.business_id,
    SUM(sl.quantity) AS total_qty_sold,
    SUM(sl.subtotal) AS total_revenue,
    COUNT(DISTINCT sl.sell_id) AS sale_count
  FROM sell_lines sl
  JOIN sells s ON s.id = sl.sell_id
  JOIN products p ON p.id = sl.product_id
  WHERE s.sell_date >= CURRENT_DATE - INTERVAL '30 days'
    AND s.deleted_at IS NULL AND s.status = 'final'
  GROUP BY sl.product_id, p.name, p.sku, s.business_id
  ORDER BY total_qty_sold DESC;

-- Customer ledger (net balance per customer)
CREATE VIEW v_customer_ledger AS
  SELECT c.id AS contact_id, c.name, c.business_id,
    COALESCE(SUM(s.grand_total), 0) AS total_invoiced,
    COALESCE(SUM(s.amount_paid), 0) AS total_paid,
    COALESCE(SUM(s.amount_due), 0)  AS total_due
  FROM contacts c
  LEFT JOIN sells s ON s.customer_id = c.id AND s.deleted_at IS NULL AND s.status = 'final'
  WHERE c.type IN ('customer','both') AND c.deleted_at IS NULL
  GROUP BY c.id, c.name, c.business_id;

-- Supplier ledger
CREATE VIEW v_supplier_ledger AS
  SELECT c.id AS contact_id, c.name, c.business_id,
    COALESCE(SUM(p.grand_total), 0) AS total_purchased,
    COALESCE(SUM(p.amount_paid), 0) AS total_paid,
    COALESCE(SUM(p.amount_due), 0)  AS total_due
  FROM contacts c
  LEFT JOIN purchases p ON p.supplier_id = c.id AND p.deleted_at IS NULL
  WHERE c.type IN ('supplier','both') AND c.deleted_at IS NULL
  GROUP BY c.id, c.name, c.business_id;
