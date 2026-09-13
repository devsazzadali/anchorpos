import Dexie, { type Table } from 'dexie';

export interface LocalProduct {
  id: string; business_id: string; type: 'single' | 'variable'; name: string;
  sku: string | null; barcode_type: string | null; category_id: string | null;
  category_name: string | null; brand_id: string | null; brand_name: string | null;
  unit_id: string | null; unit_name: string | null; tax_id: string | null;
  tax_rate: number; tax_method: 'inclusive' | 'exclusive'; unit_price: number;
  purchase_price: number; alert_quantity: number; image_url: string | null;
  is_active: boolean; updated_at: string; _synced: boolean;
}

export interface LocalProductVariation {
  id: string; product_id: string; business_id: string; variation_name: string;
  sku: string | null; unit_price: number; purchase_price: number; is_active: boolean; _synced: boolean;
}

export interface LocalContact {
  id: string; business_id: string; contact_code: string; type: 'supplier' | 'customer' | 'both';
  name: string; business_name: string | null; mobile: string | null; email: string | null;
  city: string | null; credit_limit: number; customer_group_id: string | null; is_active: boolean;
  updated_at: string; _synced: boolean;
}

export interface LocalStockLevel {
  id: string; product_id: string; variation_id: string | null; location_id: string;
  business_id: string; qty_available: number; updated_at: string;
}

export interface LocalSell {
  id: string; local_id: string; business_id: string; location_id: string;
  customer_id: string | null; customer_name: string | null; invoice_no: string;
  sell_date: string; status: 'draft' | 'quotation' | 'final'; payment_status: 'paid' | 'partial' | 'due';
  subtotal: number; tax_amount: number; discount_amount: number; shipping_amount: number;
  grand_total: number; amount_paid: number; is_offline_sale: boolean; created_at: string;
  updated_at: string; _synced: boolean; _sync_error: string | null;
}

export interface LocalSellLine {
  id: string; sell_id: string; product_id: string; variation_id: string | null;
  product_name: string; variation_name: string | null; quantity: number; unit_price: number;
  tax_amount: number; discount_amount: number; subtotal: number; _synced: boolean;
}

export interface SyncQueueItem {
  id?: number; operation: 'INSERT' | 'UPDATE' | 'DELETE'; table: string;
  record_id: string; payload: string; timestamp: number; retries: number; max_retries: number;
  priority: 1 | 2 | 3; status: 'pending' | 'processing' | 'failed'; error: string | null;
}

export interface LocalPaymentAccount {
  id: string; business_id: string; name: string; account_type: 'cash' | 'bank' | 'mobile'; is_active: boolean;
}

export class POSDatabase extends Dexie {
  products!: Table<LocalProduct, string>;
  productVariations!: Table<LocalProductVariation, string>;
  contacts!: Table<LocalContact, string>;
  stockLevels!: Table<LocalStockLevel, string>;
  sells!: Table<LocalSell, string>;
  sellLines!: Table<LocalSellLine, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  paymentAccounts!: Table<LocalPaymentAccount, string>;

  constructor() {
    super('DatabytePOS');
    this.version(1).stores({
      products:          'id, business_id, [business_id+name], category_id, brand_id, sku, is_active, _synced',
      productVariations: 'id, product_id, business_id',
      contacts:          'id, business_id, type, [business_id+type], mobile, contact_code, _synced',
      stockLevels:       'id, product_id, location_id, business_id, [product_id+location_id]',
      sells:             'id, local_id, business_id, sell_date, customer_id, _synced',
      sellLines:         'id, sell_id, product_id',
      syncQueue:         '++id, status, priority, timestamp, [status+priority+timestamp]',
      paymentAccounts:   'id, business_id, account_type',
    });
  }
}

let _db: POSDatabase | null = null;
export function getDb(): POSDatabase {
  if (!_db) { _db = new POSDatabase(); }
  return _db;
}
export const db = typeof window !== 'undefined' ? getDb() : (null as unknown as POSDatabase);
