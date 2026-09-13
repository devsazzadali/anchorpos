"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, 
  Printer, Copy, Download, Eye, X, Check, ArrowUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export interface ProductRow {
  id: string
  name: string
  sku: string
  type: string
  category: string
  brand: string
  purchase_price: number
  unit_price: number
  stock: number
  status: 'active' | 'inactive'
}

const INITIAL_PRODUCTS: ProductRow[] = [
  { id: '1', name: 'Motul 7100 4T 10W40 (1L Synthetic)', sku: 'PROD0001', type: 'single', category: 'Engine Oils & Lubes', brand: 'Motul', purchase_price: 140000, unit_price: 180000, stock: 40, status: 'active' },
  { id: '2', name: 'Helmet Standard Full Face (DOT Certified)', sku: 'PROD0002', type: 'single', category: 'Helmets & Gear', brand: 'Yamaha', purchase_price: 90000, unit_price: 120000, stock: 10, status: 'active' },
  { id: '3', name: 'Chain Lube Motul 100ml Spray', sku: 'PROD0003', type: 'single', category: 'Engine Oils & Lubes', brand: 'Motul', purchase_price: 32000, unit_price: 45000, stock: 50, status: 'active' },
  { id: '4', name: 'Yamaha R15 V3 OEM Air Filter Element', sku: 'PROD0004', type: 'single', category: 'Electrical & Parts', brand: 'Yamaha', purchase_price: 48000, unit_price: 65000, stock: 24, status: 'active' },
  { id: '5', name: 'NGK Laser Iridium Spark Plug CR9EIX', sku: 'PROD0005', type: 'single', category: 'Electrical & Parts', brand: 'NGK', purchase_price: 65000, unit_price: 85000, stock: 35, status: 'active' },
  { id: '6', name: 'Brembo Sintered Front Brake Pads', sku: 'PROD0006', type: 'single', category: 'Braking & Drive', brand: 'Brembo', purchase_price: 110000, unit_price: 145000, stock: 18, status: 'active' },
  { id: '7', name: 'Michelin Pilot Street 100/80-17 Tubeless', sku: 'PROD0007', type: 'single', category: 'Tyres & Wheels', brand: 'Michelin', purchase_price: 390000, unit_price: 480000, stock: 12, status: 'active' },
  { id: '8', name: 'DID 428 O-Ring Heavy Duty Chain & Sprocket', sku: 'PROD0008', type: 'single', category: 'Braking & Drive', brand: 'DID', purchase_price: 270000, unit_price: 350000, stock: 15, status: 'active' },
]

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<ProductRow[]>(INITIAL_PRODUCTS)
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editStock, setEditStock] = useState("")

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)))
  }, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())

      const matchCategory = categoryFilter === "all" || p.category === categoryFilter
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "low" && p.stock <= 10 && p.stock > 0) ||
        (stockFilter === "out" && p.stock === 0) ||
        (stockFilter === "in" && p.stock > 10)

      return matchSearch && matchCategory && matchStock
    })
  }, [products, search, categoryFilter, stockFilter])

  // Handlers
  const handleExport = () => {
    playClick()
    exportToCsv("Products_Catalog_Rangpur_Bike_Parlour", [
      { header: "Product Name", key: "name" },
      { header: "SKU", key: "sku" },
      { header: "Category", key: "category" },
      { header: "Brand", key: "brand" },
      { header: "Purchase Price (Paise)", key: "purchase_price" },
      { header: "Selling Price (Paise)", key: "unit_price" },
      { header: "Current Stock", key: "stock" },
      { header: "Status", key: "status" },
    ], filtered)
    toast({ title: "Exported to CSV", description: "Product catalog downloaded successfully." })
  }

  const handleDuplicate = (prod: ProductRow) => {
    playClick()
    const duplicate: ProductRow = {
      ...prod,
      id: `P-${Date.now()}`,
      sku: `${prod.sku}-COPY`,
      name: `${prod.name} (Copy)`,
    }
    setProducts(prev => [duplicate, ...prev])
    toast({ title: "Product Duplicated", description: `${duplicate.name} added to catalog.` })
  }

  const handleOpenEdit = (prod: ProductRow) => {
    playClick()
    setSelectedProduct(prod)
    setEditName(prod.name)
    setEditPrice(String(prod.unit_price / 100))
    setEditStock(String(prod.stock))
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedProduct) return
    playClick()
    const updatedPrice = Math.round(Number(editPrice) * 100)
    const updatedStock = Number(editStock)

    setProducts(prev => prev.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          name: editName,
          unit_price: updatedPrice,
          stock: updatedStock,
        }
      }
      return p
    }))

    setIsEditOpen(false)
    toast({ title: "Product Updated", description: "Changes have been saved successfully." })
  }

  const handleDelete = () => {
    if (!selectedProduct) return
    playClick()
    setProducts(prev => prev.filter(p => p.id !== selectedProduct.id))
    setIsDeleteOpen(false)
    toast({ title: "Product Deleted", description: `${selectedProduct.name} removed.` })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Products</h2>
          <p className="text-surface-400 mt-1">Manage motorcycle parts, lubes, and gear inventory</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => { playClick(); setShowFilters(prev => !prev) }}
            className={`border-surface-700 bg-surface-800 text-surface-200 transition-colors ${
              showFilters ? 'bg-surface-700 text-white border-brand-500' : 'hover:bg-surface-700'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters {showFilters ? "(Active)" : ""}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2 text-brand-400" />
            Export CSV
          </Button>

          <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Link href="/products/create">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Expandable Filter Toolbar */}
      {showFilters && (
        <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center gap-4 border border-brand-500/20 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400 font-medium">Stock Status:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="in">In Stock (&gt;10)</option>
              <option value="low">Low Stock (&le;10)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {(categoryFilter !== "all" || stockFilter !== "all") && (
            <button
              onClick={() => { setCategoryFilter("all"); setStockFilter("all") }}
              className="text-xs text-brand-400 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
        {/* Search / Toolbar */}
        <div className="p-4 border-b border-surface-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input 
              placeholder="Search products by name, brand, or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 h-10 w-full text-white"
            />
          </div>
          <div className="flex items-center text-xs text-surface-400 font-medium">
            Showing <span className="font-bold text-white mx-1">{filtered.length}</span> of {products.length} products
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">Product Name & SKU</th>
                <th className="px-6 py-4 font-medium">Category / Brand</th>
                <th className="px-6 py-4 font-medium text-right">Purchase Price</th>
                <th className="px-6 py-4 font-medium text-right">Selling Price</th>
                <th className="px-6 py-4 font-medium text-center">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white group-hover:text-brand-300 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs text-surface-500 mt-0.5 font-mono">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-surface-200 text-xs font-medium">{product.category}</div>
                      <div className="text-xs text-surface-500 mt-0.5">{product.brand}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-surface-400 text-xs">
                      {formatCurrency(product.purchase_price)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-brand-400">
                      {formatCurrency(product.unit_price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-8 h-6 px-2 rounded font-mono text-xs font-bold ${
                        product.stock > 10 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        product.stock > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface-800 border-surface-700 text-surface-200 w-48 shadow-xl">
                          <DropdownMenuItem 
                            onClick={() => { playClick(); setSelectedProduct(product); setIsViewOpen(true) }}
                            className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer text-xs"
                          >
                            <Eye className="mr-2 h-4 w-4 text-brand-400" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleOpenEdit(product)}
                            className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer text-xs"
                          >
                            <FileEdit className="mr-2 h-4 w-4 text-blue-400" /> Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer text-xs">
                            <Link href="/products/labels">
                              <Printer className="mr-2 h-4 w-4 text-purple-400" /> Print Labels
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicate(product)}
                            className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer text-xs"
                          >
                            <Copy className="mr-2 h-4 w-4 text-emerald-400" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-surface-700" />
                          <DropdownMenuItem 
                            onClick={() => { playClick(); setSelectedProduct(product); setIsDeleteOpen(true) }}
                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer text-xs"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Details */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Product Specifications</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 mt-2 text-xs">
              <div className="p-4 rounded-xl bg-surface-800 border border-surface-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-surface-400">Product Name:</span>
                  <span className="font-bold text-white text-right max-w-[200px]">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">SKU / Code:</span>
                  <span className="font-mono text-brand-400 font-bold">{selectedProduct.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Category:</span>
                  <span className="text-white">{selectedProduct.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Brand:</span>
                  <span className="text-white">{selectedProduct.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Purchase Price:</span>
                  <span className="font-mono text-white">{formatCurrency(selectedProduct.purchase_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Selling Price:</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatCurrency(selectedProduct.unit_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Available Stock:</span>
                  <span className="font-mono font-bold text-white">{selectedProduct.stock} Pcs</span>
                </div>
              </div>
              <Button onClick={() => setIsViewOpen(false)} className="w-full bg-brand-600 hover:bg-brand-500 text-white">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Product */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-surface-400 block mb-1">Product Title</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-surface-800 border-surface-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-surface-400 block mb-1">Selling Price (৳)</label>
                <Input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="bg-surface-800 border-surface-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-surface-400 block mb-1">Stock Count</label>
                <Input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="bg-surface-800 border-surface-700 text-white font-mono"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1 bg-surface-800 border-surface-700 text-white">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display text-red-400">Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-surface-400 mt-2">
            Are you sure you want to remove <span className="text-white font-bold">{selectedProduct?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1 bg-surface-800 border-surface-700 text-white">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white">
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
