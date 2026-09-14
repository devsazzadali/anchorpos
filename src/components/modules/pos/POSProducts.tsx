"use client"

import { useState, useMemo, useEffect } from "react"
import { usePOSStore } from "@/store/pos"
import { formatCurrency } from "@/lib/utils/currency"
import { playBeep } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { 
  PackageOpen, Sparkles, Droplets, Shield, 
  Disc, CircleDot, Zap, Wrench, Search, Tag, Loader2
} from "lucide-react"

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

const CATEGORIES = [
  "All",
  "Engine Oils & Lubes",
  "Braking & Drive",
  "Tyres & Wheels",
  "Helmets & Gear",
  "Electrical & Parts",
]

const ICONS = [Droplets, Shield, Wrench, Zap, Disc, CircleDot]
const GRADIENTS = [
  'from-amber-500/20 to-orange-500/10',
  'from-blue-500/20 to-indigo-500/10',
  'from-emerald-500/20 to-teal-500/10',
  'from-yellow-500/20 to-amber-500/10',
  'from-red-500/20 to-rose-500/10',
  'from-cyan-500/20 to-blue-500/10',
  'from-purple-500/20 to-pink-500/10'
]

interface POSProductsProps {
  searchQuery?: string
}

export default function POSProducts({ searchQuery = "" }: POSProductsProps) {
  const { toast } = useToast()
  const { addItem, cart } = usePOSStore()
  const [activeCategory, setActiveCategory] = useState("All")
  const [internalSearch, setInternalSearch] = useState("")
  
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = getSupabaseClient()
        // Note: For Phase 3, we temporarily pull everything. Later, implement pagination.
        const { data, error } = await supabase.from('products').select('*')
        
        if (error) throw error

        if (data) {
          // Map DB response to UI expected format (filling in missing fields with mocks)
          const mapped: ProductItem[] = data.map((item: any, i: number) => {
            return {
              id: item.id,
              sku: item.sku || `SKU-${i}`,
              name: item.name,
              category: CATEGORIES[(i % (CATEGORIES.length - 1)) + 1], // distribute categories
              brand: "Databyte", // Default brand
              price: item.unit_price || item.price || 0, // Fallback based on schema variant
              stock: 99, // MOCK STOCK (STORY-401 pending)
              categoryIcon: ICONS[i % ICONS.length],
              gradient: GRADIENTS[i % GRADIENTS.length]
            }
          })
          setProducts(mapped)
        }
      } catch (err: any) {
        toast({
          title: "Error loading products",
          description: err.message,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [toast])

  const effectiveSearch = searchQuery || internalSearch

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = activeCategory === "All" || p.category === activeCategory
      const query = effectiveSearch.toLowerCase().trim()
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)

      return matchCategory && matchSearch
    })
  }, [activeCategory, effectiveSearch, products])

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

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm font-mono tracking-widest uppercase">Syncing Catalog...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-transparent p-4 sm:p-6 overflow-hidden relative z-10">
      {/* Category Pills & Quick Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 shrink-0 scrollbar-thin">
        {CATEGORIES.map((cat) => {
          const count = cat === "All" 
            ? products.length 
            : products.filter(p => p.category === cat).length
          const isActive = activeCategory === cat

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 border backdrop-blur-md ${
                isActive
                  ? "bg-brand-500 text-white border-brand-400 shadow-[0_0_20px_rgba(var(--brand-500),0.4)]"
                  : "bg-surface-900/40 text-surface-400 hover:text-white hover:bg-surface-800/60 border-white/5"
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? "bg-white/25 text-white" : "bg-surface-800/50 text-surface-400"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
            {filteredProducts.map((product) => {
              const outOfStock = product.stock <= 0
              const Icon = product.categoryIcon
              const inCartQty = cart.get(product.id)?.quantity || 0

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`relative flex flex-col rounded-3xl p-4 border transition-all duration-300 cursor-pointer group select-none backdrop-blur-xl bento-card ${
                    outOfStock
                      ? "opacity-40 border-white/5 cursor-not-allowed bg-surface-900/20"
                      : inCartQty > 0
                      ? "glass-luxury border-brand-400 shadow-[0_0_30px_rgba(var(--brand-500),0.3)] scale-[1.02] z-10"
                      : "glass-panel border-white/5 hover:border-brand-500/30 hover:shadow-[0_0_20px_rgba(var(--brand-500),0.15)] hover:-translate-y-1 hover:scale-[1.01]"
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
