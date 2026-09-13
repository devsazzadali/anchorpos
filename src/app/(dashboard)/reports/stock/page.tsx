"use client"

import { useState, useMemo } from "react"
import { Search, Download, Package, AlertTriangle, CheckCircle2, TrendingUp, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export interface StockItem {
  id: string
  sku: string
  name: string
  category: string
  unit: string
  inStock: number
  alertQty: number
  purchasePrice: number // paise
  sellPrice: number     // paise
  stockValue: number    // paise (inStock * purchasePrice)
}

const MOCK_STOCK: StockItem[] = [
  { id: '1', sku: 'PROD0001', name: 'Motul 7100 4T 10W40 (1L Synthetic)', category: 'Engine Oils & Lubes', unit: 'Pcs', inStock: 40, alertQty: 10, purchasePrice: 140000, sellPrice: 180000, stockValue: 5600000 },
  { id: '2', sku: 'PROD0002', name: 'Helmet Standard Full Face (DOT)', category: 'Helmets & Gear', unit: 'Pcs', inStock: 10, alertQty: 10, purchasePrice: 90000, sellPrice: 120000, stockValue: 900000 },
  { id: '3', sku: 'PROD0003', name: 'Chain Lube Motul 100ml Spray', category: 'Engine Oils & Lubes', unit: 'Pcs', inStock: 50, alertQty: 15, purchasePrice: 32000, sellPrice: 45000, stockValue: 1600000 },
  { id: '4', sku: 'PROD0004', name: 'Yamaha R15 V3 OEM Air Filter', category: 'Electrical & Parts', unit: 'Pcs', inStock: 24, alertQty: 8, purchasePrice: 48000, sellPrice: 65000, stockValue: 1152000 },
  { id: '5', sku: 'PROD0005', name: 'NGK Laser Iridium Spark Plug', category: 'Electrical & Parts', unit: 'Pcs', inStock: 35, alertQty: 10, purchasePrice: 65000, sellPrice: 85000, stockValue: 2275000 },
  { id: '6', sku: 'PROD0006', name: 'Brembo Sintered Front Brake Pads', category: 'Braking & Drive', unit: 'Pcs', inStock: 18, alertQty: 5, purchasePrice: 110000, sellPrice: 145000, stockValue: 1980000 },
  { id: '7', sku: 'PROD0007', name: 'Michelin Pilot Street 100/80-17 Tyre', category: 'Tyres & Wheels', unit: 'Pcs', inStock: 12, alertQty: 5, purchasePrice: 390000, sellPrice: 480000, stockValue: 4680000 },
  { id: '8', sku: 'PROD0008', name: 'DID 428 O-Ring Heavy Duty Chain Kit', category: 'Braking & Drive', unit: 'Pcs', inStock: 15, alertQty: 5, purchasePrice: 270000, sellPrice: 350000, stockValue: 4050000 },
  { id: '9', sku: 'PROD0009', name: 'LED Headlight Bulb H4 6000K', category: 'Electrical & Parts', unit: 'Pcs', inStock: 20, alertQty: 6, purchasePrice: 80000, sellPrice: 110000, stockValue: 1600000 },
  { id: '10', sku: 'PROD0010', name: 'Clutch Cable Wire Yamaha FZ-S', category: 'Braking & Drive', unit: 'Pcs', inStock: 3, alertQty: 10, purchasePrice: 18000, sellPrice: 28000, stockValue: 54000 },
  { id: '11', sku: 'PROD0011', name: 'Castrol Power1 4T 20W-50 1L Oil', category: 'Engine Oils & Lubes', unit: 'Pcs', inStock: 45, alertQty: 12, purchasePrice: 48000, sellPrice: 62000, stockValue: 2160000 },
  { id: '12', sku: 'PROD0012', name: 'Steelmate Two-Way Remote Alarm', category: 'Electrical & Parts', unit: 'Pcs', inStock: 0, alertQty: 4, purchasePrice: 170000, sellPrice: 220000, stockValue: 0 },
]

export default function StockReportPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const filtered = useMemo(() => {
    return MOCK_STOCK.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())

      if (filter === "low") return matchSearch && p.inStock <= p.alertQty && p.inStock > 0
      if (filter === "out") return matchSearch && p.inStock === 0
      return matchSearch
    })
  }, [search, filter])

  const lowStockCount = MOCK_STOCK.filter((p) => p.inStock <= p.alertQty && p.inStock > 0).length
  const outOfStockCount = MOCK_STOCK.filter((p) => p.inStock === 0).length
  const totalValue = MOCK_STOCK.reduce((s, p) => s + p.stockValue, 0)
  const totalRetailValue = MOCK_STOCK.reduce((s, p) => s + (p.inStock * p.sellPrice), 0)

  const handleExport = () => {
    playClick()
    exportToCsv("Inventory_Stock_Report_Rangpur_Bike_Parlour", [
      { header: "SKU", key: "sku" },
      { header: "Product Name", key: "name" },
      { header: "Category", key: "category" },
      { header: "In Stock", key: "inStock" },
      { header: "Alert Quantity", key: "alertQty" },
      { header: "Cost Price (Paise)", key: "purchasePrice" },
      { header: "Sell Price (Paise)", key: "sellPrice" },
      { header: "Total Value (Paise)", key: "stockValue" },
    ], filtered)
    toast({ title: "Stock Report Exported", description: "CSV file generated and downloaded." })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Stock Valuation Report</h2>
          <p className="text-surface-400 mt-1">Live inventory levels, reorder thresholds, and warehouse valuation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} className="bg-surface-800 border border-surface-700 hover:bg-surface-700 text-white shadow-sm">
            <Download className="w-4 h-4 mr-2 text-brand-400" /> Export CSV
          </Button>
          <Button 
            onClick={() => { playClick(); printCurrentWindow(); }} 
            className="bg-surface-800 border border-surface-700 hover:bg-surface-700 text-white shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2 text-blue-400" /> Print Valuation
          </Button>
        </div>
      </div>

      {/* Alert banner if low stock items exist */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p>
            <span className="font-bold text-white">{lowStockCount} items</span> are below reorder level, and <span className="font-bold text-red-400">{outOfStockCount} items</span> are out of stock. Immediate purchase orders recommended.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-500/20 text-brand-400"><Package className="w-5 h-5" /></div>
          <div>
            <p className="text-surface-400 text-xs font-medium">Total Tracked SKUs</p>
            <p className="text-2xl font-bold text-white font-mono mt-0.5">{MOCK_STOCK.length}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <p className="text-surface-400 text-xs font-medium">Low / Reorder Items</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-0.5">{lowStockCount + outOfStockCount}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <p className="text-surface-400 text-xs font-medium">Stock Value (@ Cost)</p>
          <p className="text-xl font-bold text-white font-mono mt-1">{formatCurrency(totalValue)}</p>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <p className="text-surface-400 text-xs font-medium">Retail Value (@ Sell)</p>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(totalRetailValue)}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              placeholder="Search motorcycle part, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[170px] bg-surface-900 border-surface-700 text-white text-xs">
                <SelectValue placeholder="Stock Filter" />
              </SelectTrigger>
              <SelectContent className="bg-surface-800 border-surface-700 text-white text-xs">
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="low">Low Stock Items</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-surface-400">
              {filtered.length} items
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">SKU & Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-center">Available</th>
                <th className="px-6 py-4 font-medium text-center">Alert Qty</th>
                <th className="px-6 py-4 font-medium text-right">Cost Price</th>
                <th className="px-6 py-4 font-medium text-right">Retail Price</th>
                <th className="px-6 py-4 font-medium text-right">Total Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
                    No items match the selected stock filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.inStock <= p.alertQty && p.inStock > 0
                  const isOut = p.inStock === 0

                  return (
                    <tr key={p.id} className="hover:bg-surface-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white group-hover:text-brand-300 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs font-mono text-surface-400 mt-0.5">{p.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-surface-300">{p.category}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-8 h-6 px-2.5 rounded-full font-mono text-xs font-bold ${
                          isOut ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          isLow ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {p.inStock} {p.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-mono text-surface-400">
                        {p.alertQty} {p.unit}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-surface-400">
                        {formatCurrency(p.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-medium text-white">
                        {formatCurrency(p.sellPrice)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-brand-400 text-sm">
                        {formatCurrency(p.stockValue)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
