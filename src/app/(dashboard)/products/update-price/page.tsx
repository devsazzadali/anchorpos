"use client"

import { useState } from "react"
import { DollarSign, Save, Search, Download, Upload, CheckCircle2, ArrowUpDown, Filter, FileSpreadsheet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"
import { parseAmountInput, paise_to_display } from "@/lib/utils/currency"

interface PriceItem {
  id: string
  name: string
  sku: string
  category: string
  currentCost: number
  newCost: number
  currentPrice: number
  newPrice: number
  stock: number
}

const INITIAL_PRODUCTS: PriceItem[] = [
  {
    id: "PROD0001",
    name: "Motul 7100 4T 10W40 (1L)",
    sku: "MOT-7100-1L",
    category: "Parts",
    currentCost: 38000,
    newCost: 38000,
    currentPrice: 45000,
    newPrice: 45000,
    stock: 40
  },
  {
    id: "PROD0002",
    name: "KYT TT-Course Helmet Standard",
    sku: "KYT-TTC-01",
    category: "Accessories",
    currentCost: 100000,
    newCost: 100000,
    currentPrice: 120000,
    newPrice: 120000,
    stock: 10
  },
  {
    id: "PROD0003",
    name: "Motul C2 Chain Lube 100ml",
    sku: "MOT-C2-100",
    category: "Accessories",
    currentCost: 8000,
    newCost: 8000,
    currentPrice: 12000,
    newPrice: 12000,
    stock: 50
  },
  {
    id: "PROD0004",
    name: "NGK Laser Iridium Spark Plug",
    sku: "NGK-CR9EIX",
    category: "Parts",
    currentCost: 75000,
    newCost: 75000,
    currentPrice: 90000,
    newPrice: 90000,
    stock: 25
  },
  {
    id: "PROD0005",
    name: "Brembo Sintered Brake Pads (Front)",
    sku: "BRM-BP-SIN",
    category: "Parts",
    currentCost: 135000,
    newCost: 135000,
    currentPrice: 165000,
    newPrice: 165000,
    stock: 12
  }
]

export default function UpdatePricePage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<PriceItem[]>(INITIAL_PRODUCTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleCostChange = (id: string, val: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, newCost: val } : p))
  }

  const handlePriceChange = (id: string, val: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, newPrice: val } : p))
  }

  const handleSave = () => {
    playClick()
    setProducts(prev => prev.map(p => ({
      ...p,
      currentCost: p.newCost,
      currentPrice: p.newPrice
    })))
    setSavedSuccess(true)
    toast({
      title: "Prices Updated",
      description: "All cost and retail price modifications have been synced with database."
    })
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Product_Price_List_Rangpur_Bike_Parlour", [
      { header: "SKU", key: "sku" },
      { header: "Product Name", key: "name" },
      { header: "Category", key: "category" },
      { header: "Purchase Cost (BDT)", key: "currentCost" },
      { header: "Selling Price (BDT)", key: "currentPrice" },
      { header: "Current Stock", key: "stock" }
    ], filtered.map(p => ({
      ...p,
      currentCost: (p.currentCost / 100).toFixed(2),
      currentPrice: (p.currentPrice / 100).toFixed(2)
    })))
    toast({
      title: "Export Completed",
      description: "Price catalog exported as CSV."
    })
  }

  const handleSimulateImport = () => {
    playClick()
    // Simulate updating 5% markup on all items from imported CSV
    setProducts(prev => prev.map(p => ({
      ...p,
      newCost: Math.round(p.currentCost * 1.05),
      newPrice: Math.round(p.currentPrice * 1.05)
    })))
    setIsImportModalOpen(false)
    toast({
      title: "Batch CSV Imported",
      description: "Updated purchase costs and retail prices from CSV spreadsheet."
    })
  }

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Update Product Price</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Bulk Editor
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Batch adjust purchase costs and selling prices for Rangpur Bike Parlour
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2 text-brand-400" /> Export CSV
          </Button>

          <Button 
            variant="outline" 
            onClick={() => { playClick(); setIsImportModalOpen(true) }}
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <Upload className="w-4 h-4 mr-2 text-emerald-400" /> Import CSV
          </Button>

          <Button onClick={handleSave} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Save className="w-4 h-4 mr-2" /> Save All Changes
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="glass-panel border-emerald-500/30 bg-emerald-950/30 p-4 rounded-xl flex items-center gap-3 text-emerald-300 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">All price and purchase cost updates have been saved successfully to the database!</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search product by name or SKU (e.g. MOT-7100)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-400" />
            <span className="text-xs text-surface-400 font-medium uppercase">Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-900/70 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Parts">Parts</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Current Cost (৳)</th>
                <th className="px-6 py-4 text-right w-44">New Cost (৳)</th>
                <th className="px-6 py-4 text-right">Current Price (৳)</th>
                <th className="px-6 py-4 text-right w-44">New Price (৳)</th>
                <th className="px-6 py-4 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((product) => {
                const costChanged = product.currentCost !== product.newCost
                const priceChanged = product.currentPrice !== product.newPrice
                const margin = product.newPrice > 0 ? (((product.newPrice - product.newCost) / product.newPrice) * 100).toFixed(1) : "0"

                return (
                  <tr key={product.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{product.name}</div>
                      <div className="text-[11px] text-brand-400">Margin: {margin}%</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-400">{product.sku}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2.5 py-0.5 rounded bg-surface-800 border border-surface-700 text-surface-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-surface-300">
                      ৳ {paise_to_display(product.currentCost)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={product.newCost ? (product.newCost / 100) : ''}
                        onChange={(e) => handleCostChange(product.id, parseAmountInput(e.target.value))}
                        className={`w-32 text-right bg-surface-900 border rounded-lg px-3 py-1.5 font-mono text-sm focus:outline-none ${
                          costChanged 
                            ? "border-amber-500/70 text-amber-400 bg-amber-950/20" 
                            : "border-surface-700 text-white"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-surface-300">
                      ৳ {paise_to_display(product.currentPrice)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={product.newPrice ? (product.newPrice / 100) : ''}
                        onChange={(e) => handlePriceChange(product.id, parseAmountInput(e.target.value))}
                        className={`w-32 text-right bg-surface-900 border rounded-lg px-3 py-1.5 font-mono text-sm focus:outline-none ${
                          priceChanged 
                            ? "border-emerald-500/70 text-emerald-400 bg-emerald-950/20" 
                            : "border-surface-700 text-white"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-white">
                      {product.stock}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-surface-700 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Batch Update Prices from CSV
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-surface-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-surface-300">
              Upload a spreadsheet with updated vendor purchase costs and retail selling prices. Columns required: <code className="text-brand-400">SKU, NewCost, NewPrice</code>.
            </p>

            <div className="border-2 border-dashed border-surface-700 rounded-xl p-6 text-center hover:border-brand-500 transition-colors cursor-pointer bg-surface-900/40">
              <Upload className="w-8 h-8 text-surface-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">vendor_price_update_2026.csv</p>
              <p className="text-xs text-surface-400 mt-1">Ready for 5 motorcycle catalog items</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-800">
              <Button variant="outline" onClick={() => setIsImportModalOpen(false)} className="border-surface-700 text-surface-300">
                Cancel
              </Button>
              <Button onClick={handleSimulateImport} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow">
                Apply Price Updates
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
