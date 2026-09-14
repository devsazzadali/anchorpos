"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Plus, Trash2, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, toBDTPaise, paise_to_display, calculateDiscountPct, computeLineTotal } from "@/lib/utils/currency"
import { playClick } from "@/lib/utils/audio"

interface PurchaseLine {
  id: string
  name: string
  sku: string
  qty: number
  unitCost: number // in paise
  subtotal: number // in paise
}

const MOTORCYCLE_PARTS_CATALOG = [
  { name: "Motul 7100 4T 10W40 (1L)", sku: "MOT-7100-1L", unitCost: 38000 },
  { name: "Yamaha R15 V3 OEM Air Filter", sku: "YAM-AF-R15", unitCost: 45000 },
  { name: "Brembo Sintered Brake Pads (Front)", sku: "BRM-BP-SIN", unitCost: 135000 },
  { name: "NGK Laser Iridium Spark Plug", sku: "NGK-CR9EIX", unitCost: 75000 },
  { name: "KYT TT-Course Helmet Standard", sku: "KYT-TTC-01", unitCost: 100000 },
  { name: "Michelin Pilot Street 100/80-17 Tyre", sku: "MCH-PS2-100", unitCost: 390000 },
]

export default function CreatePurchasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState("s1")
  const [selectedPartSku, setSelectedPartSku] = useState(MOTORCYCLE_PARTS_CATALOG[0].sku)
  const [addQty, setAddQty] = useState(10)

  const [lines, setLines] = useState<PurchaseLine[]>([
    { id: '1', name: 'Motul 7100 4T 10W40 (1L)', sku: 'MOT-7100-1L', qty: 10, unitCost: 38000, subtotal: 380000 }
  ])
  
  const [discountPct, setDiscountPct] = useState(0)
  const [shipping, setShipping] = useState(0)

  // Calculations
  const linesTotal = lines.reduce((sum, line) => sum + line.subtotal, 0)
  const discountAmt = calculateDiscountPct(linesTotal, discountPct)
  const grandTotal = linesTotal - discountAmt + shipping

  const handleAddPart = () => {
    playClick()
    const part = MOTORCYCLE_PARTS_CATALOG.find(p => p.sku === selectedPartSku)
    if (!part) return

    const existing = lines.find(l => l.sku === part.sku)
    if (existing) {
      setLines(lines.map(l => l.sku === part.sku ? {
        ...l,
        qty: l.qty + addQty,
        subtotal: computeLineTotal({ quantity: l.qty + addQty, unitPricePaise: l.unitCost, discountAmountPaise: 0, taxAmountPaise: 0 })
      } : l))
    } else {
      const newLine: PurchaseLine = {
        id: `line-${Date.now()}`,
        name: part.name,
        sku: part.sku,
        qty: addQty,
        unitCost: part.unitCost,
        subtotal: computeLineTotal({ quantity: addQty, unitPricePaise: part.unitCost, discountAmountPaise: 0, taxAmountPaise: 0 })
      }
      setLines([...lines, newLine])
    }
    toast({
      title: "Item Added",
      description: `${part.name} added to purchase order.`
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Order",
        description: "Please add at least one line item to create a purchase order."
      })
      return
    }

    setIsSubmitting(true)
    playClick()
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({
        title: "Purchase Order Saved",
        description: `PO successfully recorded for ${lines.length} items at Rangpur Bike Parlour.`,
        className: "bg-brand-500 text-white border-none",
      })
      router.push('/purchases')
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save purchase order."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateLineQty = (id: string, qty: number) => {
    if (qty < 1) return
    setLines(lines.map(l => l.id === id ? { ...l, qty, subtotal: computeLineTotal({ quantity: qty, unitPricePaise: l.unitCost, discountAmountPaise: 0, taxAmountPaise: 0 }) } : l))
  }
  
  const updateLineCost = (id: string, costPaise: number) => {
    setLines(lines.map(l => l.id === id ? { ...l, unitCost: costPaise, subtotal: computeLineTotal({ quantity: l.qty, unitPricePaise: costPaise, discountAmountPaise: 0, taxAmountPaise: 0 }) } : l))
  }

  const removeLine = (id: string) => {
    playClick()
    setLines(lines.filter(l => l.id !== id))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-surface-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Add Purchase Order</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Rangpur Bike Parlour (BL0001)
              </span>
            </div>
            <p className="text-surface-400 text-sm">Create a new OEM supplier purchase order or record incoming inventory bill</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Purchase
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Lines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Info */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-surface-800 pb-2 mb-4">Supplier & Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-surface-300">Supplier *</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="s1">Motul Bangladesh (ACI Motors)</SelectItem>
                    <SelectItem value="s2">Yamaha Genuine Parts (ACI)</SelectItem>
                    <SelectItem value="s3">Brembo Racing Imports BD</SelectItem>
                    <SelectItem value="s4">KYT Helmets Bangladesh</SelectItem>
                    <SelectItem value="s5">Standard Bike Supply</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-surface-300">Reference No</Label>
                <Input defaultValue={`PO2026/${Math.floor(1000 + Math.random() * 9000)}`} className="bg-surface-900 border-surface-700 text-white font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-300">Purchase Date *</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="bg-surface-900 border-surface-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-300">Purchase Status *</Label>
                <Select defaultValue="received">
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="received">Received & Stock Added</SelectItem>
                    <SelectItem value="pending">Pending Delivery</SelectItem>
                    <SelectItem value="ordered">Ordered from Factory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-surface-800 pb-2 mb-4">Motorcycle Inventory Items</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
              <div className="sm:col-span-8">
                <select
                  value={selectedPartSku}
                  onChange={(e) => setSelectedPartSku(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  {MOTORCYCLE_PARTS_CATALOG.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) — Cost: {formatCurrency(p.unitCost)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input 
                  type="number"
                  min="1"
                  value={addQty}
                  onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                  className="bg-surface-900 border-surface-700 text-white text-center font-mono"
                  placeholder="Qty"
                />
              </div>
              <div className="sm:col-span-2">
                <Button 
                  type="button"
                  onClick={handleAddPart}
                  className="w-full bg-surface-800 border border-surface-700 text-white hover:bg-brand-500 hover:border-brand-500"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-surface-800">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
                  <tr>
                    <th className="px-4 py-3">Product Name & SKU</th>
                    <th className="px-4 py-3 w-24 text-center">Qty</th>
                    <th className="px-4 py-3 w-32 text-right">Unit Cost (৳)</th>
                    <th className="px-4 py-3 w-32 text-right">Subtotal</th>
                    <th className="px-4 py-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800 bg-surface-900/20">
                  {lines.map((line) => (
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
                          onChange={(e) => updateLineQty(line.id, Number(e.target.value))}
                          className="w-full h-8 bg-surface-900 border-surface-700 text-white text-center p-1 font-mono" 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          type="number" 
                          step="0.01"
                          value={paise_to_display(line.unitCost)}
                          onChange={(e) => updateLineCost(line.id, toBDTPaise(e.target.value))}
                          className="w-full h-8 bg-surface-900 border-surface-700 text-white text-right p-1 font-mono" 
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-brand-400 font-medium">
                        {formatCurrency(line.subtotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" onClick={() => removeLine(line.id)} className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {lines.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-surface-500 text-xs">
                        No products added yet. Select a motorcycle part above and click Add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Totals & Payment */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white border-b border-surface-800 pb-2 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-brand-400" /> Totals
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-surface-300">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatCurrency(linesTotal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-surface-300">
                <span>Discount (%)</span>
                <Input 
                  type="number" 
                  min="0"
                  max="100"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-20 h-8 bg-surface-900 border-surface-700 text-white text-right font-mono" 
                />
              </div>

              <div className="flex justify-between items-center text-surface-300">
                <span>Freight / Shipping (৳)</span>
                <Input 
                  type="number" 
                  min="0"
                  value={paise_to_display(shipping)}
                  onChange={(e) => setShipping(toBDTPaise(e.target.value))}
                  className="w-24 h-8 bg-surface-900 border-surface-700 text-white text-right font-mono" 
                />
              </div>

              <div className="pt-4 border-t border-surface-800 flex justify-between items-center text-lg font-bold">
                <span className="text-white">Grand Total</span>
                <span className="text-brand-400 font-mono">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white border-b border-surface-800 pb-2 mb-4">Payment & Settlement</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-surface-300">Amount Paid (৳)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">৳</span>
                  <Input type="number" step="0.01" defaultValue={paise_to_display(grandTotal)} className="pl-8 bg-surface-900 border-surface-700 text-white font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-surface-300">Payment Account</Label>
                <Select defaultValue="cash">
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="Select account..." /></SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="cash">Cash Register (Counter Drawer)</SelectItem>
                    <SelectItem value="bank">City Bank Current A/C (1102938475)</SelectItem>
                    <SelectItem value="bkash">bKash Merchant (01711-000000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
