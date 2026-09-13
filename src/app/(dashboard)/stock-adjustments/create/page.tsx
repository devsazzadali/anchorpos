"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/currency"
import { playClick } from "@/lib/utils/audio"

interface AdjustmentLine {
  id: string
  name: string
  sku: string
  qty: number
  unitCost: number // in paise
  subtotal: number // in paise
}

const MOTORCYCLE_CATALOG = [
  { name: "NGK Iridium Spark Plug CR9EIX", sku: "NGK-CR9EIX", unitCost: 90000 },
  { name: "Motul 7100 4T 10W40 (1L)", sku: "MOT-7100-1L", unitCost: 38000 },
  { name: "Yamaha R15 V3 Air Filter Genuine", sku: "YAM-AF-R15", unitCost: 45000 },
  { name: "Brembo Sintered Brake Pads (Front)", sku: "BRM-BP-SIN", unitCost: 165000 },
  { name: "KYT Helmet Smoke Visor", sku: "KYT-VIS-SMK", unitCost: 40000 },
]

export default function AddStockAdjustmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProductSku, setSelectedProductSku] = useState(MOTORCYCLE_CATALOG[0].sku)
  const [customQty, setCustomQty] = useState(1)

  const [lines, setLines] = useState<AdjustmentLine[]>([
    { id: '1', name: 'NGK Iridium Spark Plug CR9EIX', sku: 'NGK-CR9EIX', qty: 2, unitCost: 90000, subtotal: 180000 }
  ])

  const handleAddProduct = () => {
    playClick()
    const item = MOTORCYCLE_CATALOG.find(p => p.sku === selectedProductSku)
    if (!item) return

    const existing = lines.find(l => l.sku === item.sku)
    if (existing) {
      setLines(lines.map(l => l.sku === item.sku ? {
        ...l,
        qty: l.qty + customQty,
        subtotal: (l.qty + customQty) * l.unitCost
      } : l))
      toast({
        title: "Quantity Increased",
        description: `Added ${customQty} more ${item.name} to adjustment list.`
      })
    } else {
      const newLine: AdjustmentLine = {
        id: `line-${Date.now()}`,
        name: item.name,
        sku: item.sku,
        qty: customQty,
        unitCost: item.unitCost,
        subtotal: customQty * item.unitCost
      }
      setLines([...lines, newLine])
      toast({
        title: "Product Added",
        description: `${item.name} added to stock adjustment.`
      })
    }
    setCustomQty(1)
  }

  const handleRemoveLine = (id: string) => {
    playClick()
    setLines(lines.filter(l => l.id !== id))
  }

  const totalAmount = lines.reduce((sum, line) => sum + line.subtotal, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Adjustment",
        description: "Please add at least one product to adjust."
      })
      return
    }

    setIsSubmitting(true)
    playClick()
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      toast({
        title: "Stock Adjustment Saved",
        description: `Successfully adjusted inventory for ${lines.length} items at Rangpur Bike Parlour.`,
      })
      router.push('/stock-adjustments')
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save stock adjustment."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-surface-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Add Stock Adjustment</h2>
            <p className="text-surface-400 text-sm">Record damaged, expired, or discrepant inventory for Rangpur Bike Parlour</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Adjustment
          </Button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-surface-300">Reference No</Label>
            <Input defaultValue={`ADJ-${Date.now().toString().slice(-6)}`} className="bg-surface-900 border-surface-700 text-white font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Date *</Label>
            <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="bg-surface-900 border-surface-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Location</Label>
            <Input disabled defaultValue="BL0001 - RANGPUR BIKE PARLOUR" className="bg-surface-800 border-surface-700 text-surface-300 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Adjustment Type *</Label>
            <Select defaultValue="normal">
              <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent className="bg-surface-800 border-surface-700 text-white">
                <SelectItem value="normal">Normal (Damage, Expiry, Unboxing defect)</SelectItem>
                <SelectItem value="abnormal">Abnormal (Theft, Transit Loss, Fire)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-surface-800">
          <h3 className="text-sm font-bold text-surface-300 uppercase tracking-wider">Select Motorcycle Part to Adjust</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <select
                value={selectedProductSku}
                onChange={(e) => setSelectedProductSku(e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                {MOTORCYCLE_CATALOG.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku}) — Cost: {formatCurrency(p.unitCost)}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Input 
                type="number" 
                min="1" 
                value={customQty} 
                onChange={(e) => setCustomQty(parseInt(e.target.value) || 1)}
                className="bg-surface-900 border-surface-700 text-white text-center font-mono"
                placeholder="Qty"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                type="button"
                onClick={handleAddProduct}
                className="w-full bg-surface-800 border border-surface-700 text-white hover:bg-brand-500 hover:border-brand-500"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add to List
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-surface-800 mt-4">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
                <tr>
                  <th className="px-4 py-3">Product Name & SKU</th>
                  <th className="px-4 py-3 w-32 text-center">Qty to Reduce</th>
                  <th className="px-4 py-3 w-32 text-right">Unit Cost</th>
                  <th className="px-4 py-3 w-32 text-right">Subtotal</th>
                  <th className="px-4 py-3 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800 bg-surface-900/20">
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-surface-500 text-xs">
                      No products added yet. Select a motorcycle part above and click "Add to List".
                    </td>
                  </tr>
                ) : (
                  lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3 text-white font-medium">
                        <div>{line.name}</div>
                        <div className="text-xs text-surface-400 font-mono">{line.sku}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          type="number" 
                          min="1"
                          value={line.qty} 
                          onChange={(e) => {
                            const q = parseInt(e.target.value) || 1
                            setLines(lines.map(l => l.id === line.id ? { ...l, qty: q, subtotal: q * l.unitCost } : l))
                          }}
                          className="w-full h-8 bg-surface-900 border-surface-700 text-white text-center p-1 font-mono" 
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-surface-300">
                        {formatCurrency(line.unitCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-400 font-medium">
                        {formatCurrency(line.subtotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveLine(line.id)} 
                          className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end pt-4">
            <div className="text-right">
              <p className="text-surface-400 text-xs uppercase font-semibold mb-1">Total Inventory Value Loss</p>
              <p className="text-2xl font-bold font-mono text-red-400">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-surface-800">
          <Label className="text-surface-300">Reason / Damage Report Notes</Label>
          <textarea 
            rows={3}
            className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Document unboxing defects, transit damages, or stock audit count discrepancies..."
          />
        </div>
      </div>
    </div>
  )
}
