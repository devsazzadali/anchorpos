-- ============================================================
-- Migration 006: Product Catalog
-- ============================================================

-- Categories (hierarchical, supports parent/child)
CREATE TABLE product_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES product_categories(id),
  name        VARCHAR(255) NOT NULL,
  short_code  VARCHAR(20),
  description TEXT,
  image_url   TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE units (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  short_name    VARCHAR(20),
  allow_decimal BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE warranties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  duration      INTEGER,
  duration_unit VARCHAR(10) DEFAULT 'months',
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE variation_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  values      TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE selling_price_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Main products table
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type         VARCHAR(20) NOT NULL DEFAULT 'single'
                 CHECK (type IN ('single', 'variable')),
  name         VARCHAR(255) NOT NULL,
  sku          VARCHAR(100),
  barcode_type VARCHAR(10) DEFAULT 'C128'
                 CHECK (barcode_type IN ('C128','C39','EAN13','EAN8','UPC-A','UPC-E')),
  brand_id     UUID REFERENCES brands(id),
  category_id  UUID REFERENCES product_categories(id),
  unit_id      UUID REFERENCES units(id),
  warranty_id  UUID REFERENCES warranties(id),
  tax_id       UUID REFERENCES tax_rates(id),
  tax_method   VARCHAR(15) DEFAULT 'exclusive'
                 CHECK (tax_method IN ('inclusive','exclusive')),
  -- Prices stored as integers (paise)
  unit_price     BIGINT NOT NULL DEFAULT 0,
  purchase_price BIGINT DEFAULT 0,
  alert_quantity DECIMAL(10,4) DEFAULT 0,
  track_serial   BOOLEAN DEFAULT FALSE,
  has_expiry     BOOLEAN DEFAULT FALSE,
  expiry_period  INTEGER,
  description    TEXT,
  image_url      TEXT,
  brochure_url   TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  deleted_at     TIMESTAMPTZ,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, sku)
);

-- Variations for variable products
CREATE TABLE product_variations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  business_id    UUID NOT NULL,
  variation_name VARCHAR(255) NOT NULL,
  sku            VARCHAR(100),
  unit_price     BIGINT NOT NULL DEFAULT 0,
  purchase_price BIGINT DEFAULT 0,
  alert_quantity DECIMAL(10,4) DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Selling price overrides per group
CREATE TABLE product_price_group_prices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variation_id   UUID REFERENCES product_variations(id) ON DELETE CASCADE,
  price_group_id UUID NOT NULL REFERENCES selling_price_groups(id),
  price          BIGINT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier link for product
CREATE TABLE product_suppliers (
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id, contact_id)
);

-- Triggers
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_product_variations_updated_at
  BEFORE UPDATE ON product_variations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_product_categories_updated_at
  BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Full-text search
CREATE INDEX idx_products_fts ON products
  USING gin(to_tsvector('english', name || ' ' || COALESCE(sku, '')));
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_sku ON products(business_id, sku);
CREATE INDEX idx_product_variations_product ON product_variations(product_id);

-- RLS on all catalog tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE variation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE selling_price_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_group_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "products_own" ON products FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "product_variations_own" ON product_variations FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "product_categories_own" ON product_categories FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "brands_own" ON brands FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "units_own" ON units FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "warranties_own" ON warranties FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "variation_templates_own" ON variation_templates FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "selling_price_groups_own" ON selling_price_groups FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "product_price_group_prices_own" ON product_price_group_prices
  FOR ALL USING (product_id IN (SELECT id FROM products WHERE business_id = auth_business_id()));
CREATE POLICY "product_suppliers_own" ON product_suppliers
  FOR ALL USING (product_id IN (SELECT id FROM products WHERE business_id = auth_business_id()));
