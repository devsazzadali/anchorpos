const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvqqufmwjfggtgfaqvtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cXF1Zm13amZnZ3RnZmFxdnRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTIyNzE3NiwiZXhwIjoyMTA0ODAzMTc2fQ.Jvz0UUG_FWDhx17bg6-4NPbc9W72xVGU9YSV_L6dLlA'
);

const POS_CATALOG = [
  { id: '1', sku: 'PROD0001', name: 'Motul 7100 4T 10W40 (1L Synthetic)', category: 'Engine Oils & Lubes', brand: 'Motul', price: 180000, stock: 40, gradient: 'from-amber-500/20 to-orange-500/10' },
  { id: '2', sku: 'PROD0002', name: 'Helmet Standard Full Face (DOT Certified)', category: 'Helmets & Gear', brand: 'Yamaha', price: 120000, stock: 10, gradient: 'from-blue-500/20 to-indigo-500/10' },
  { id: '3', sku: 'PROD0003', name: 'Chain Lube Motul 100ml Spray', category: 'Engine Oils & Lubes', brand: 'Motul', price: 45000, stock: 50, gradient: 'from-amber-500/20 to-orange-500/10' },
  { id: '4', sku: 'PROD0004', name: 'Yamaha R15 V3 OEM Air Filter Element', category: 'Electrical & Parts', brand: 'Yamaha', price: 65000, stock: 24, gradient: 'from-emerald-500/20 to-teal-500/10' },
  { id: '5', sku: 'PROD0005', name: 'NGK Laser Iridium Spark Plug CR9EIX', category: 'Electrical & Parts', brand: 'NGK', price: 85000, stock: 35, gradient: 'from-yellow-500/20 to-amber-500/10' },
  { id: '6', sku: 'PROD0006', name: 'Brembo Sintered Front Brake Pads', category: 'Braking & Drive', brand: 'Brembo', price: 145000, stock: 18, gradient: 'from-red-500/20 to-rose-500/10' },
  { id: '7', sku: 'PROD0007', name: 'Michelin Pilot Street 100/80-17 Tubeless', category: 'Tyres & Wheels', brand: 'Michelin', price: 480000, stock: 12, gradient: 'from-cyan-500/20 to-blue-500/10' },
  { id: '8', sku: 'PROD0008', name: 'DID 428 O-Ring Heavy Duty Chain & Sprocket', category: 'Braking & Drive', brand: 'DID', price: 350000, stock: 15, gradient: 'from-red-500/20 to-rose-500/10' },
  { id: '9', sku: 'PROD0009', name: 'LED Headlight Bulb H4 6000K Ultra Beam', category: 'Electrical & Parts', brand: 'Osram', price: 110000, stock: 20, gradient: 'from-yellow-500/20 to-amber-500/10' },
  { id: '10', sku: 'PROD0010', name: 'Clutch Cable Wire Yamaha FZ-S V2/V3', category: 'Braking & Drive', brand: 'Yamaha', price: 28000, stock: 30, gradient: 'from-purple-500/20 to-pink-500/10' },
  { id: '11', sku: 'PROD0011', name: 'Castrol Power1 4T 20W-50 1L Engine Oil', category: 'Engine Oils & Lubes', brand: 'Castrol', price: 62000, stock: 45, gradient: 'from-emerald-500/20 to-green-500/10' },
  { id: '12', sku: 'PROD0012', name: 'Steelmate Two-Way Remote Security Alarm', category: 'Electrical & Parts', brand: 'Steelmate', price: 220000, stock: 8, gradient: 'from-blue-500/20 to-indigo-500/10' },
  { id: '13', sku: 'PROD0013', name: 'Front Stainless Steel Disc Rotor 282mm', category: 'Braking & Drive', brand: 'Brembo', price: 260000, stock: 6, gradient: 'from-red-500/20 to-rose-500/10' },
  { id: '14', sku: 'PROD0014', name: 'Tubeless Tyre Brass Air Valve (Pair)', category: 'Tyres & Wheels', brand: 'Generic', price: 12000, stock: 80, gradient: 'from-cyan-500/20 to-blue-500/10' },
  { id: '15', sku: 'PROD0015', name: 'Pro-Biker Hard Knuckle Riding Gloves', category: 'Helmets & Gear', brand: 'Pro-Biker', price: 85000, stock: 22, gradient: 'from-purple-500/20 to-pink-500/10' }
];

async function seed() {
  const { data: businesses } = await supabase.from('businesses').select('id').limit(1);
  const business_id = businesses[0].id;
  
  for (const item of POS_CATALOG) {
    const payload = {
      business_id: business_id,
      name: item.name,
      sku: item.sku,
      unit_price: item.price
    };
    const { error } = await supabase.from('products').insert([payload]);
    if (error) {
       console.log("Error inserting", item.sku, error.message);
    } else {
       console.log("Inserted", item.sku);
    }
  }
}

seed();
