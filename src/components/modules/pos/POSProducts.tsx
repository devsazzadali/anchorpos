"use client"

import { useState, useMemo } from "react"
import { usePOSStore } from "@/store/pos"
import { formatCurrency } from "@/lib/utils/currency"
import { playBeep } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"
import { 
  PackageOpen, Sparkles, Droplets, Shield, 
  Disc, CircleDot, Zap, Wrench, Search, Tag
} from "lucide-react"
import { Input } from "@/components/ui/input"

export interface ProductItem {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  price: number // paise
  stock: number
  categoryIcon: any
  gradient: string
}

// ── Real Rangpur Bike Parlour Product Catalog ──────────────────────────────
export const POS_CATALOG: ProductItem[] = [
  { id: '1', sku: 'PROD0001', name: 'Motul 7100 4T 10W40 (1L Synthetic)', category: 'Engine Oils & Lubes', brand: 'Motul', price: 180000, stock: 40, categoryIcon: Droplets, gradient: 'from-amber-500/20 to-orange-500/10' },
  { id: '2', sku: 'PROD0002', name: 'Helmet Standard Full Face (DOT Certified)', category: 'Helmets & Gear', brand: 'Yamaha', price: 120000, stock: 10, categoryIcon: Shield, gradient: 'from-blue-500/20 to-indigo-500/10' },
  { id: '3', sku: 'PROD0003', name: 'Chain Lube Motul 100ml Spray', category: 'Engine Oils & Lubes', brand: 'Motul', price: 45000, stock: 50, categoryIcon: Droplets, gradient: 'from-amber-500/20 to-orange-500/10' },
  { id: '4', sku: 'PROD0004', name: 'Yamaha R15 V3 OEM Air Filter Element', category: 'Electrical & Parts', brand: 'Yamaha', price: 65000, stock: 24, categoryIcon: Wrench, gradient: 'from-emerald-500/20 to-teal-500/10' },
  { id: '5', sku: 'PROD0005', name: 'NGK Laser Iridium Spark Plug CR9EIX', category: 'Electrical & Parts', brand: 'NGK', price: 85000, stock: 35, categoryIcon: Zap, gradient: 'from-yellow-500/20 to-amber-500/10' },
  { id: '6', sku: 'PROD0006', name: 'Brembo Sintered Front Brake Pads', category: 'Braking & Drive', brand: 'Brembo', price: 145000, stock: 18, categoryIcon: Disc, gradient: 'from-red-500/20 to-rose-500/10' },
  { id: '7', sku: 'PROD0007', name: 'Michelin Pilot Street 100/80-17 Tubeless', category: 'Tyres & Wheels', brand: 'Michelin', price: 480000, stock: 12, categoryIcon: CircleDot, gradient: 'from-cyan-500/20 to-blue-500/10' },
  { id: '8', sku: 'PROD0008', name: 'DID 428 O-Ring Heavy Duty Chain & Sprocket', category: 'Braking & Drive', brand: 'DID', price: 350000, stock: 15, categoryIcon: Disc, gradient: 'from-red-500/20 to-rose-500/10' },
  { id: '9', sku: 'PROD0009', name: 'LED Headlight Bulb H4 6000K Ultra Beam', category: 'Electrical & Parts', brand: 'Osram', price: 110000, stock: 20, categoryIcon: Zap, gradient: 'from-yellow-500/20 to-amber-500/10' },
  { id: '10', sku: 'PROD0010', name: 'Clutch Cable Wire Yamaha FZ-S V2/V3', category: 'Braking & Drive', brand: 'Yamaha', price: 28000, stock: 30, categoryIcon: Wrench, gradient: 'from-purple-500/20 to-pink-500/10' },
  { id: '11', sku: 'PROD0011', name: 'Castrol Power1 4T 20W-50 1L Engine Oil', category: 'Engine Oils & Lubes', brand: 'Castrol', price: 62000, stock: 45, categoryIcon: Droplets, gradient: 'from-emerald-500/20 to-green-500/10' },
  { id: '12', sku: 'PROD0012', name: 'Steelmate Two-Way Remote Security Alarm', category: 'Electrical & Parts', brand: 'Steelmate', price: 220000, stock: 8, categoryIcon: Zap, gradient: 'from-blue-500/20 to-indigo-500/10' },
  { id: '13', sku: 'PROD0013', name: 'Front Stainless Steel Disc Rotor 282mm', category: 'Braking & Drive', brand: 'Brembo', price: 260000, stock: 6, categoryIcon: Disc, gradient: 'from-red-500/20 to-rose-500/10' },
  { id: '14', sku: 'PROD0014', name: 'Tubeless Tyre Brass Air Valve (Pair)', category: 'Tyres & Wheels', brand: 'Generic', price: 12000, stock: 80, categoryIcon: CircleDot, gradient: 'from-cyan-500/20 to-blue-500/10' },
  { id: '15', sku: 'PROD0015', name: 'Pro-Biker Hard Knuckle Riding Gloves', category: 'Helmets & Gear', brand: 'Pro-Biker', price: 85000, stock: 22, categoryIcon: Shield, gradient: 'from-purple-500/20 to-pink-500/10' },
]

const CATEGORIES = [
  "All",
  "Engine Oils & Lubes",
  "Braking & Drive",
  "Tyres & Wheels",
  "Helmets & Gear",
  "Electrical & Parts",
]

interface POSProductsProps {
  searchQuery?: string
}

export default function POSProducts({ searchQuery = "" }: POSProductsProps) {
  const { toast } = useToast()
  const { addItem, cart } = usePOSStore()
  const [activeCategory, setActiveCategory] = useState("All")
  const [internalSearch, setInternalSearch] = useState("")

  const effectiveSearch = searchQuery || internalSearch

  const filteredProducts = useMemo(() => {
    return POS_CATALOG.filter((p) => {
      const matchCategory = activeCategory === "All" || p.category === activeCategory
      const query = effectiveSearch.toLowerCase().trim()
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)

      return matchCategory && matchSearch
    })
  }, [activeCategory, effectiveSearch])

  const handleProductClick = (p: ProductItem) => {
    if (p.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${p.name} is currently out of stock!`,
        variant: "destructive",
      })
      return
    }

    playBeep()

    addItem({
      id: p.id,
      product_id: p.id,
      variation_id: null,
      name: p.name,
      quantity: 1,
      unit_price: p.price,
      tax_rate: 0,
      tax_method: 'exclusive',
      discount_type: 'fixed',
      discount_value: 0,
      stock_available: p.stock,
    })
  }

  return (
    <div className="flex flex-col h-full bg-surface-950 p-4 sm:p-6 overflow-hidden">
      {/* Category Pills & Quick Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 shrink-0 scrollbar-thin">
        {CATEGORIES.map((cat) => {
          const count = cat === "All" 
            ? POS_CATALOG.length 
            : POS_CATALOG.filter(p => p.category === cat).length
          const isActive = activeCategory === cat

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2 border ${
                isActive
                  ? "bg-brand-500 text-white border-brand-400 shadow-glow"
                  : "bg-surface-900/90 text-surface-400 hover:text-white hover:bg-surface-800 border-surface-800"
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? "bg-white/25 text-white" : "bg-surface-800 text-surface-400"
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-surface-500 space-y-3 py-16">
            <PackageOpen className="w-12 h-12 text-surface-700 stroke-[1.5]" />
            <p className="text-sm">No products found matching &ldquo;{effectiveSearch}&rdquo;</p>
            <button
              onClick={() => { setActiveCategory("All"); setInternalSearch("") }}
              className="text-xs text-brand-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pb-8">
            {filteredProducts.map((product) => {
              const outOfStock = product.stock <= 0
              const Icon = product.categoryIcon
              const inCartQty = cart.get(product.id)?.quantity || 0

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`relative flex flex-col rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer group select-none ${
                    outOfStock
                      ? "opacity-40 border-surface-800 cursor-not-allowed bg-surface-900/40"
                      : inCartQty > 0
                      ? "bg-surface-900/90 border-brand-500 shadow-glow"
                      : "bg-surface-900/70 border-surface-800 hover:border-brand-500/50 hover:bg-surface-900 hover:shadow-glow hover:-translate-y-0.5"
                  }`}
                >
                  {/* Top Bar: Brand & Stock */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-800 text-surface-300">
                      {product.brand}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      outOfStock
                        ? "bg-red-500/20 text-red-400"
                        : product.stock <= 10
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {outOfStock ? "Out" : `${product.stock} in stock`}
                    </span>
                  </div>

                  {/* Visual Category Badge Graphic */}
                  <div className={`h-24 rounded-xl mb-3 flex flex-col items-center justify-center bg-gradient-to-br ${product.gradient} border border-white/5 relative overflow-hidden group-hover:scale-[1.02] transition-transform`}>
                    <Icon className="w-9 h-9 text-white/80 group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-mono text-surface-400 mt-1 uppercase">
                      {product.sku}
                    </span>

                    {/* Quantity already in cart badge */}
                    {inCartQty > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-500 text-white font-bold font-mono text-xs flex items-center justify-center shadow-glow">
                        {inCartQty}
                      </div>
                    )}
                  </div>

                  {/* Name & Pricing */}
                  <h3 className="text-xs font-semibold text-surface-200 line-clamp-2 leading-snug group-hover:text-white transition-colors mb-2 min-h-[32px]">
                    {product.name}
                  </h3>

                  <div className="mt-auto pt-2 border-t border-surface-800/80 flex items-baseline justify-between">
                    <span className="text-sm font-bold font-mono text-brand-400">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-[10px] text-surface-500 group-hover:text-brand-300 transition-colors">
                      + Add
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
