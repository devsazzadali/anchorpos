"use client"

import { useState } from "react"
import { Barcode, Printer, Plus, Trash2, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"

interface LabelProduct {
  id: string
  name: string
  sku: string
  price: string
  qty: number
}

const INITIAL_PRODUCTS: LabelProduct[] = [
  { id: "1", name: "Motul 7100 4T 10W40 (1L)", sku: "MOT-7100-1L", price: "৳ 450.00", qty: 10 },
  { id: "2", name: "KYT TT-Course Helmet", sku: "KYT-TTC-01", price: "৳ 1,200.00", qty: 5 },
  { id: "3", name: "Motul C2 Chain Lube 100ml", sku: "MOT-C2-100", price: "৳ 120.00", qty: 20 },
]

const CATALOG_ADDITIONS = [
  { name: "NGK Laser Iridium Spark Plug", sku: "NGK-CR9EIX", price: "৳ 900.00" },
  { name: "Yamaha R15 V3 Air Filter Genuine", sku: "YAM-AF-R15", price: "৳ 450.00" },
  { name: "Brembo Sintered Brake Pads (Front)", sku: "BRM-BP-SIN", price: "৳ 1,650.00" },
  { name: "Michelin Pilot Street 2 (140/70-17)", sku: "MCH-PS2-140", price: "৳ 7,500.00" },
]

export default function PrintLabelsPage() {
  const { toast } = useToast()
  const [paperSize, setPaperSize] = useState("24")
  const [products, setProducts] = useState<LabelProduct[]>(INITIAL_PRODUCTS)
  const [showBusinessName, setShowBusinessName] = useState(true)
  const [showProductName, setShowProductName] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Add product form
  const [selectedCatalogSku, setSelectedCatalogSku] = useState(CATALOG_ADDITIONS[0].sku)
  const [addQty, setAddQty] = useState(10)

  const handlePrint = () => {
    playClick()
    toast({
      title: "Generating Sticker Sheet",
      description: `Printing ${products.reduce((s, p) => s + p.qty, 0)} barcode labels...`,
    })
    printCurrentWindow()
  }

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    const found = CATALOG_ADDITIONS.find(c => c.sku === selectedCatalogSku)
    if (!found) return

    const existing = products.find(p => p.sku === found.sku)
    if (existing) {
      setProducts(products.map(p => p.sku === found.sku ? { ...p, qty: p.qty + addQty } : p))
    } else {
      setProducts([
        ...products,
        {
          id: `lbl-${Date.now()}`,
          name: found.name,
          sku: found.sku,
          price: found.price,
          qty: addQty
        }
      ])
    }
    setIsAddOpen(false)
    toast({
      title: "Added to Sheet",
      description: `${found.name} added with quantity ${addQty}.`
    })
  }

  const handleRemove = (id: string) => {
    playClick()
    setProducts(products.filter(p => p.id !== id))
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Barcode_Labels_Rangpur_Bike_Parlour", [
      { header: "Product Name", key: "name" },
      { header: "SKU / Barcode", key: "sku" },
      { header: "Retail Price", key: "price" },
      { header: "Sticker Quantity", key: "qty" }
    ], products)
    toast({
      title: "Export Completed",
      description: "Barcode batch list downloaded as CSV."
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Print Barcode Labels</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Code 128
            </span>
          </div>
          <p className="text-surface-400 mt-1">Generate and print barcode stickers for Rangpur Bike Parlour inventory packaging</p>
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
            onClick={() => { playClick(); setIsAddOpen(true) }}
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>

          <Button onClick={handlePrint} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Printer className="w-4 h-4 mr-2" /> Print Sticker Sheet
          </Button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-200">Barcode Sticker Sheet Layout</label>
            <Select value={paperSize} onValueChange={setPaperSize}>
              <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface-800 border-surface-700 text-white">
                <SelectItem value="24">24 Labels per Sheet (A4 - 3x8)</SelectItem>
                <SelectItem value="30">30 Labels per Sheet (A4 - 3x10)</SelectItem>
                <SelectItem value="roll">Continuous Roll (Thermal Barcode Printer - 50x25mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-200">Included Information on Sticker</label>
            <div className="flex items-center gap-4 pt-2 text-xs text-surface-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showBusinessName} 
                  onChange={(e) => setShowBusinessName(e.target.checked)}
                  className="rounded bg-surface-900 accent-brand-500" 
                /> Business Name
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showProductName} 
                  onChange={(e) => setShowProductName(e.target.checked)}
                  className="rounded bg-surface-900 accent-brand-500" 
                /> Product Name
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showPrice} 
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded bg-surface-900 accent-brand-500" 
                /> Price
              </label>
            </div>
          </div>
        </div>

        {/* Selected Products Table */}
        <div className="border border-surface-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-900/80 text-surface-400 text-xs uppercase border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Retail Price</th>
                <th className="px-4 py-3 text-center w-36">Sticker Qty</th>
                <th className="px-4 py-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-400">{p.sku}</td>
                  <td className="px-4 py-3 font-mono text-white">{p.price}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={p.qty}
                      onChange={(e) => {
                        const q = parseInt(e.target.value) || 1
                        setProducts(products.map(item => item.id === p.id ? { ...item, qty: q } : item))
                      }}
                      className="w-20 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-center font-mono text-white text-xs"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(p.id)}
                      className="h-7 w-7 text-surface-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sticker Preview Grid */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Barcode className="w-4 h-4 text-brand-400" /> Live Interactive Sticker Preview
            </h4>
            <span className="text-xs text-surface-400">
              Total Labels in Queue: <strong className="text-white">{products.reduce((s, p) => s + p.qty, 0)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-white text-black flex flex-col items-center justify-center text-center shadow-lg border border-gray-300 transition-all">
                {showBusinessName && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Rangpur Bike Parlour</span>
                )}
                {showProductName && (
                  <span className="font-bold text-xs mt-1 text-black line-clamp-1">{p.name}</span>
                )}
                <div className="my-2 h-10 w-36 bg-gray-900 flex items-center justify-center text-white font-mono text-[9px] tracking-widest rounded-sm">
                  ||||| {p.sku} |||||
                </div>
                <span className="font-mono text-xs text-gray-600 font-bold">{p.sku}</span>
                {showPrice && (
                  <span className="font-bold text-sm text-black mt-1">{p.price}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-surface-700 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Barcode className="w-4 h-4 text-brand-400" /> Add Product to Label Sheet
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-surface-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Select Item from Catalog</label>
                <select
                  value={selectedCatalogSku}
                  onChange={(e) => setSelectedCatalogSku(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  {CATALOG_ADDITIONS.map((c) => (
                    <option key={c.sku} value={c.sku}>
                      {c.name} ({c.sku}) — {c.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Sticker Print Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={addQty}
                  onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-800">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 text-surface-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
                  Add to Sheet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
