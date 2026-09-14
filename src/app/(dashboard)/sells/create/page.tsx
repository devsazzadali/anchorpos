"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ShoppingCart, Plus, Trash2, Search, ArrowLeft, 
  CreditCard, CheckCircle2, User, Building, Calendar,
  DollarSign, FileText, Printer, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { printCurrentWindow } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"
import { parseAmountInput, paise_to_display } from "@/lib/utils/currency"

interface SaleLineItem {
  id: string
  name: string
  sku: string
  price: number
  qty: number
  discount: number
  subtotal: number
}

const AVAILABLE_PRODUCTS = [
  { id: "p1", name: "Motul 7100 4T", sku: "MOT-1L", price: 45000, stock: 40 },
  { id: "p2", name: "KYT TT-Course", sku: "KYT-01", price: 120000, stock: 10 },
  { id: "p3", name: "Chain Lube C2", sku: "MOT-C2", price: 12000, stock: 50 },
  { id: "p4", name: "NGK Spark Plug", sku: "NGK-CR9", price: 90000, stock: 25 },
  { id: "p5", name: "Brembo Pads", sku: "BRM-BP", price: 165000, stock: 12 },
]

export default function CreateSalePage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [customer, setCustomer] = useState("CO0001 - Walk-In Customer")
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0])
  const [status, setStatus] = useState<"Final" | "Draft" | "Quotation">("Final")
  const [location, setLocation] = useState("RANGPUR BIKE PARLOUR")
  const [items, setItems] = useState<SaleLineItem[]>([
    {
      id: "p1",
      name: "Motul 7100 4T",
      sku: "MOT-1L",
      price: 45000,
      qty: 2,
      discount: 0,
      subtotal: 90000
    }
  ])

  // Adjustments
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [shipping, setShipping] = useState(0)

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paymentNote, setPaymentNote] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [generatedInvoiceNo, setGeneratedInvoiceNo] = useState(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`)

  // Calculations
  const rawSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const discountedSubtotal = Math.max(0, rawSubtotal - orderDiscount)
  const taxAmount = Math.round((discountedSubtotal * taxRate) / 100)
  const grandTotal = discountedSubtotal + taxAmount + shipping

  const handleAddItem = (prodId: string) => {
    playClick()
    const prod = AVAILABLE_PRODUCTS.find(p => p.id === prodId)
    if (!prod) return

    const existingIndex = items.findIndex(i => i.id === prod.id)
    if (existingIndex > -1) {
      setItems(prev => prev.map((item, idx) => {
        if (idx === existingIndex) {
          const newQty = item.qty + 1
          return {
            ...item,
            qty: newQty,
            subtotal: (item.price * newQty) - item.discount
          }
        }
        return item
      }))
    } else {
      setItems(prev => [
        ...prev,
        {
          id: prod.id,
          name: prod.name,
          sku: prod.sku,
          price: prod.price,
          qty: 1,
          discount: 0,
          subtotal: prod.price
        }
      ])
    }
    toast({
      title: "Product Added",
      description: `${prod.name} added to invoice lines.`
    })
  }

  const handleUpdateQty = (idx: number, qty: number) => {
    if (qty < 1) return
    setItems(prev => prev.map((item, i) => {
      if (i === idx) {
        return {
          ...item,
          qty,
          subtotal: (item.price * qty) - item.discount
        }
      }
      return item
    }))
  }

  const handleUpdateDiscount = (idx: number, discount: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === idx) {
        return {
          ...item,
          discount,
          subtotal: Math.max(0, (item.price * item.qty) - discount)
        }
      }
      return item
    }))
  }

  const handleRemoveItem = (idx: number) => {
    playClick()
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Invoice",
        description: "Please add at least one line item to complete the sale."
      })
      return
    }

    playSuccess()
    setIsSuccess(true)
    setIsReceiptModalOpen(true)
    toast({
      title: "Invoice Generated",
      description: `Sales invoice ${generatedInvoiceNo} has been saved.`
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-surface-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">Add Sale / Invoice</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Rangpur Bike Parlour
              </span>
            </div>
            <p className="text-surface-400 mt-0.5">Location BL0001 (Invoice Scheme: Default)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/pos")}
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <ShoppingCart className="w-4 h-4 mr-2 text-brand-400" /> Open POS Screen
          </Button>
        </div>
      </div>

      {isSuccess && !isReceiptModalOpen && (
        <div className="glass-panel border-emerald-500/40 bg-emerald-950/40 p-4 rounded-xl flex items-center gap-3 text-emerald-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold">Sale Invoice Created Successfully!</div>
            <div className="text-xs text-emerald-400/80">Invoice {generatedInvoiceNo} is saved to records.</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="glass-panel p-6 rounded-xl border border-surface-800 space-y-4">
          <h3 className="text-sm font-semibold uppercase text-surface-400 tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" /> Invoice Header & Customer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-surface-400 font-medium uppercase mb-1">Customer *</label>
              <select
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="CO0001 - Walk-In Customer">Walk-In Customer (CO0001)</option>
                <option value="CO0002 - Standard Bike Supply">Standard Bike Supply (CO0002)</option>
                <option value="CO0003 - Tanvir Motorcycle Club">Tanvir Motorcycle Club (CO0003)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-surface-400 font-medium uppercase mb-1">Sale Date *</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-surface-400 font-medium uppercase mb-1">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Final">Final (Completed Sale)</option>
                <option value="Draft">Draft (Save Pending)</option>
                <option value="Quotation">Quotation (Estimate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-surface-400 font-medium uppercase mb-1">Business Location *</label>
              <input
                type="text"
                value={location}
                disabled
                className="w-full bg-surface-900/60 border border-surface-800 rounded-lg px-3 py-2 text-sm text-surface-300"
              />
            </div>
          </div>
        </div>

        {/* Product Selection Bar */}
        <div className="glass-panel p-6 rounded-xl border border-surface-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-sm font-semibold uppercase text-surface-400 tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-400" /> Motorcycle Line Items
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-surface-400">Quick Add:</span>
              {AVAILABLE_PRODUCTS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddItem(p.id)}
                  className="px-2.5 py-1 text-xs rounded bg-surface-800 hover:bg-brand-600 text-surface-200 hover:text-white border border-surface-700 transition-colors"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-surface-800">
            <table className="w-full text-left text-sm text-surface-300">
              <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Product Name & SKU</th>
                  <th className="px-4 py-3">Unit Price (৳)</th>
                  <th className="px-4 py-3 w-28">Quantity</th>
                  <th className="px-4 py-3 w-28">Discount (৳)</th>
                  <th className="px-4 py-3 text-right">Subtotal (৳)</th>
                  <th className="px-4 py-3 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-surface-500">
                      No items added yet. Click above to add products.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id + idx} className="hover:bg-surface-800/20">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-xs font-mono text-brand-400">{item.sku}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-white">
                        ৳ {paise_to_display(item.price)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleUpdateQty(idx, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 bg-surface-900 border border-surface-700 rounded text-center text-white font-mono focus:outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount ? (item.discount / 100) : ''}
                          onChange={(e) => handleUpdateDiscount(idx, parseAmountInput(e.target.value))}
                          className="w-20 px-2 py-1 bg-surface-900 border border-surface-700 rounded text-center text-white font-mono focus:outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-brand-300">৳ {paise_to_display(item.subtotal)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-surface-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Section */}
          <div className="glass-panel p-6 rounded-xl border border-surface-800 space-y-4">
            <h3 className="text-sm font-semibold uppercase text-surface-400 tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-400" /> Payment Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-surface-400 font-medium uppercase mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "Card / POS", "bKash / Mobile"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                        paymentMethod === method
                          ? "bg-brand-600/20 border-brand-500 text-white"
                          : "bg-surface-900 border-surface-800 text-surface-400 hover:text-surface-200"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-surface-400 font-medium uppercase mb-1">Payment Amount (৳)</label>
                <input
                  type="number"
                  value={grandTotal}
                  readOnly
                  className="w-full bg-surface-900/60 border border-surface-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-surface-400 font-medium uppercase mb-1">Payment Note</label>
                <textarea
                  rows={2}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Optional payment remarks or transaction ID..."
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="glass-panel p-6 rounded-xl border border-surface-800 space-y-4">
            <h3 className="text-sm font-semibold uppercase text-surface-400 tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-400" /> Invoice Calculation
            </h3>

            <div className="space-y-3 divide-y divide-surface-800/60">
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-surface-400">Items Subtotal:</span>
                <span className="font-mono text-white">৳ {paise_to_display(rawSubtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-surface-400">Order Discount (৳):</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={orderDiscount ? (orderDiscount / 100) : ''}
                  onChange={(e) => setOrderDiscount(parseAmountInput(e.target.value))}
                  className="w-24 px-2 py-1 bg-surface-900 border border-surface-700 rounded text-right text-white font-mono text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-surface-400">Order Tax Rate:</span>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="bg-surface-900 border border-surface-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="0">None (0%)</option>
                  <option value="5">VAT (5%)</option>
                  <option value="7.5">VAT (7.5%)</option>
                </select>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-surface-400">Shipping Charges (৳):</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipping ? (shipping / 100) : ''}
                  onChange={(e) => setShipping(parseAmountInput(e.target.value))}
                  className="w-24 px-2 py-1 bg-surface-900 border border-surface-700 rounded text-right text-white font-mono text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-base font-bold text-white uppercase tracking-wider">Grand Total:</span>
                <span className="text-2xl font-bold font-mono text-brand-400">৳ {paise_to_display(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-brand-600 hover:bg-brand-500 text-white shadow-glow py-3"
              >
                <Printer className="w-4 h-4 mr-2" /> Save & Preview Invoice
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Invoice Receipt Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-surface-700 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-brand-400" /> Sales Invoice: {generatedInvoiceNo}
              </h3>
              <button onClick={() => { setIsReceiptModalOpen(false); router.push("/sells"); }} className="text-surface-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white text-black p-5 rounded-xl space-y-3 text-xs font-mono shadow-inner border border-gray-300">
              <div className="text-center border-b pb-2">
                <div className="font-extrabold text-sm uppercase">Rangpur Bike Parlour</div>
                <div className="text-[10px]">Station Road, Rangpur, Bangladesh</div>
                <div className="text-[10px]">Location: BL0001 &bull; Hotline: +880 1700-000000</div>
              </div>

              <div className="flex justify-between text-[11px] py-1 border-b">
                <div>
                  <div>Invoice: <strong>{generatedInvoiceNo}</strong></div>
                  <div>Customer: {customer.split("-")[1] || customer}</div>
                </div>
                <div className="text-right">
                  <div>{saleDate}</div>
                  <div>Status: <strong>{status}</strong></div>
                </div>
              </div>

              <table className="w-full text-left text-[11px]">
                <thead className="border-b">
                  <tr>
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-1 font-semibold">{i.name}</td>
                      <td className="py-1 text-center">{i.qty}</td>
                      <td className="py-1 text-right">৳ {paise_to_display(i.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-2 space-y-1 text-right text-[11px]">
                <div>Subtotal: ৳ {paise_to_display(rawSubtotal)}</div>
                {orderDiscount > 0 && <div className="text-red-600">Discount: -৳ {paise_to_display(orderDiscount)}</div>}
                {taxAmount > 0 && <div>VAT ({taxRate}%): ৳ {paise_to_display(taxAmount)}</div>}
                {shipping > 0 && <div>Freight: ৳ {paise_to_display(shipping)}</div>}
                <div className="font-bold text-sm text-black border-t pt-1">
                  Grand Total: ৳ {paise_to_display(grandTotal)}
                </div>
                <div className="text-[10px] text-gray-600">
                  Paid via {paymentMethod}: ৳ {paise_to_display(grandTotal)}
                </div>
              </div>

              <div className="text-center text-[9px] text-gray-500 pt-2 border-t border-dashed">
                Thank you for choosing Rangpur Bike Parlour!
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-800">
              <Button 
                variant="outline" 
                onClick={() => { setIsReceiptModalOpen(false); router.push("/sells"); }} 
                className="border-surface-700 text-surface-300"
              >
                Go to Sells List
              </Button>
              <Button 
                onClick={() => { playClick(); printCurrentWindow(); }} 
                className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
              >
                <Printer className="w-4 h-4 mr-1.5" /> Print Thermal Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
