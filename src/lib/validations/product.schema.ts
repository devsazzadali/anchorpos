import * as z from 'zod';

export const productSchema = z.object({
  type: z.enum(['single', 'variable']),
  name: z.string().min(1, 'Product name is required').max(255),
  brand_id: z.string().uuid().nullish(),
  unit_id: z.string().uuid({ message: 'Unit is required' }),
  category_id: z.string().uuid().nullish(),
  sku: z.string().max(100).nullish(),
  barcode_type: z.enum(['C128', 'C39', 'EAN13', 'EAN8', 'UPC-A', 'UPC-E']).default('C128'),
  alert_quantity: z.number().min(0).default(0),
  tax_id: z.string().uuid().nullish(),
  tax_method: z.enum(['inclusive', 'exclusive']).default('exclusive'),
  unit_price: z.number().positive('Selling price is required'),
  purchase_price: z.number().min(0).default(0),
  has_expiry: z.boolean().default(false),
  expiry_period: z.number().positive().nullish(),
  track_serial: z.boolean().default(false),
  description: z.string().nullish(),
  opening_stock_qty: z.number().min(0).default(0),
  opening_stock_date: z.string().nullish(),
  location_id: z.string().uuid().nullish(),
  variations: z.array(z.object({
    variation_name: z.string().min(1, 'Variation name is required'),
    sku: z.string().nullish(),
    unit_price: z.number().min(0),
    purchase_price: z.number().min(0).default(0),
  })).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
