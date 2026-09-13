"use client"

import { useState } from "react"
import { 
  RotateCcw, Plus, Search, CheckCircle, Clock, AlertCircle, 
  Download, Printer, Eye, Trash2, X, FileText 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

interface SellReturn {
  id: string
  date: string
  returnNo: string
  parentInvoice: string
  customer: string
  itemDescription: string
  quantity: number
  location: string
  reason: string
  paymentStatus: "Refunded" | "Pending"
  amount: number
}

const INITIAL_RETURNS: SellReturn[] = [
  {
    id: "SR-001",
    date: "2026-09-12",
    returnNo: "SR2026/0001",
    parentInvoice: "INV-2026-0001",
    customer: "Walk-In Customer (R15 V3)",
    itemDescription: "Motul Chain Lube 100ml",
    quantity: 1,
    location: "RANGPUR BIKE PARLOUR",
    reason: "Customer wanted 400ml aerosol can instead",
    paymentStatus: "Refunded",
    amount: 120.00
  },
  {
    id: "SR-002",
    date: "2026-09-13",
    returnNo: "SR2026/0002",
    parentInvoice: "INV-2026-0002",
    customer: "Tanvir Ahmed (Yamaha FZ-S)",
    itemDescription: "NGK Laser Iridium Spark Plug",
    quantity: 1,
    location: "RANGPUR BIKE PARLOUR",
    reason: "Wrong heat range selected by customer",
    paymentStatus: "Refunded",
    amount: 900.00
  }
]

export default function SellReturnsPage() {
  const { toast } = useToast()
  const [returns, setReturns] = useState<SellReturn[]>(INITIAL_RETURNS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingCreditNote, setViewingCreditNote] = useState<SellReturn | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // New return form
  const [parentInvoice, setParentInvoice] = useState("INV-2026-0001")
  const [customer, setCustomer] = useState("Walk-In Customer")
  const [itemDescription, setItemDescription] = useState("Motul 7100 4T 10W40 (1L)")
  const [quantity, setQuantity] = useState(1)
  const [returnAmount, setReturnAmount] = useState(450)
  const [returnReason, setReturnReason] = useState("Customer requested exchange")

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    const newRecord: SellReturn = {
      id: `SR-00${returns.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      returnNo: `SR2026/000${returns.length + 1}`,
      parentInvoice,
      customer,
      itemDescription,
      quantity,
      location: "RANGPUR BIKE PARLOUR",
      reason: returnReason,
      paymentStatus: "Refunded",
      amount: returnAmount
    }
    setReturns([newRecord, ...returns])
    setIsModalOpen(false)
    toast({
      title: "Credit Note Issued",
      description: `Return ${newRecord.returnNo} logged and refunded successfully.`
    })
  }

  const handleDelete = (id: string) => {
    playClick()
    setReturns(prev => prev.filter(r => r.id !== id))
    setDeletingId(null)
    toast({
      title: "Return Deleted",
      description: "Customer return record removed.",
      variant: "destructive"
    })
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Sell_Returns_Rangpur_Bike_Parlour", [
      { header: "Date", key: "date" },
      { header: "Return Ref No", key: "returnNo" },
      { header: "Parent Invoice", key: "parentInvoice" },
      { header: "Customer", key: "customer" },
      { header: "Item Returned", key: "itemDescription" },
      { header: "Qty", key: "quantity" },
      { header: "Reason", key: "reason" },
      { header: "Payment Status", key: "paymentStatus" },
      { header: "Refund Amount (BDT)", key: "amount" }
    ], filtered)
    toast({
      title: "Export Completed",
      description: "Sales returns exported to CSV."
    })
  }

  const filtered = returns.filter(r => 
    r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.parentInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalReturned = returns.reduce((acc, r) => acc + r.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Sell Returns</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Customer Credit Notes
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Customer returns, merchandise exchanges, and refund adjustments for Rangpur Bike Parlour
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
            onClick={() => { playClick(); setIsModalOpen(true) }} 
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Sell Return
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-surface-400 tracking-wider">Total Returns</span>
            <RotateCcw className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            ৳ {totalReturned.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-surface-400 mt-1">{returns.length} customer return records logged</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-surface-400 tracking-wider">Refunded to Customers</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            ৳ {totalReturned.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-surface-400 mt-1">Paid out via cash drawer or store credit</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-surface-400 tracking-wider">Pending Claims</span>
            <Clock className="w-4 h-4 text-surface-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            ৳ 0.00
          </div>
          <div className="text-xs text-surface-400 mt-1">All customer claims settled in full</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search return by number, invoice number, customer, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="text-xs text-surface-400">
          Location: <span className="text-white font-semibold">BL0001 (RANGPUR BIKE PARLOUR)</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Return Ref No</th>
                <th className="px-6 py-4">Parent Invoice</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Item & Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total Refund (৳)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{r.date}</td>
                  <td className="px-6 py-4 font-mono font-bold text-white">{r.returnNo}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-surface-800 text-brand-400 font-mono text-xs border border-surface-700">
                      {r.parentInvoice}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{r.customer}</td>
                  <td className="px-6 py-4 text-xs text-surface-300">
                    <div className="font-semibold text-white">{r.itemDescription}</div>
                    <div className="text-[11px] text-surface-400">{r.quantity} pcs &bull; {r.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                      {r.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-white">
                    ৳ {r.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { playClick(); setViewingCreditNote(r) }}
                        className="h-8 px-2 text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 text-xs"
                        title="View Credit Note"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Note
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { playClick(); setDeletingId(r.id) }}
                        className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Return"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-surface-700 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-brand-400" /> Create Customer Credit Note & Return
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-surface-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Parent Invoice</label>
                <select
                  value={parentInvoice}
                  onChange={(e) => {
                    const inv = e.target.value
                    setParentInvoice(inv)
                    if (inv === "INV-2026-0001") {
                      setCustomer("Walk-In Customer (R15 V3)")
                      setItemDescription("Motul 7100 4T 10W40 (1L)")
                      setReturnAmount(450)
                    } else {
                      setCustomer("Walk-In Customer (Yamaha FZ)")
                      setItemDescription("NGK Laser Iridium Spark Plug")
                      setReturnAmount(900)
                    }
                  }}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="INV-2026-0001">INV-2026-0001 (৳ 15,000.00) — Walk-In Customer</option>
                  <option value="INV-2026-0002">INV-2026-0002 (৳ 10,160.00) — Walk-In Customer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Customer</label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Item Returned</label>
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Reason for Return</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Quantity Returned</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Refund Amount (৳)</label>
                  <input
                    type="number"
                    value={returnAmount}
                    onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-surface-700 text-surface-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
                  Submit Return & Refund
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Credit Note Modal */}
      {viewingCreditNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-surface-700 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                <h3 className="text-lg font-bold text-white">Credit Note: {viewingCreditNote.returnNo}</h3>
              </div>
              <button 
                onClick={() => setViewingCreditNote(null)}
                className="text-surface-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white text-black p-5 rounded-xl space-y-4 text-xs font-sans shadow-inner">
              <div className="border-b pb-3 flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide text-brand-700">Rangpur Bike Parlour</h4>
                  <p className="text-gray-600">Station Road, Rangpur, Bangladesh</p>
                  <p className="text-gray-600">Location Code: BL0001 &bull; Phone: +880 1700-000000</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    CREDIT NOTE
                  </span>
                  <p className="font-mono mt-1 font-bold">{viewingCreditNote.returnNo}</p>
                  <p className="text-gray-500">{viewingCreditNote.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded border border-gray-200">
                <div>
                  <span className="text-gray-500 uppercase block font-semibold">Credit To Customer:</span>
                  <span className="font-bold text-black">{viewingCreditNote.customer}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block font-semibold">Original Sales Invoice:</span>
                  <span className="font-mono font-bold text-black">{viewingCreditNote.parentInvoice}</span>
                </div>
              </div>

              <table className="w-full text-left border border-gray-200 mt-2">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-2 font-semibold">Returned Item</th>
                    <th className="p-2 text-center font-semibold">Qty</th>
                    <th className="p-2 text-right font-semibold">Refund Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 font-medium">
                      {viewingCreditNote.itemDescription}
                      <div className="text-[10px] text-gray-500 italic">Reason: {viewingCreditNote.reason}</div>
                    </td>
                    <td className="p-2 text-center font-mono">{viewingCreditNote.quantity}</td>
                    <td className="p-2 text-right font-mono font-bold">৳ {viewingCreditNote.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center pt-2 font-bold text-sm border-t border-gray-200">
                <span>Total Refunded (Cash/Credit):</span>
                <span className="font-mono text-base text-emerald-700">৳ {viewingCreditNote.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setViewingCreditNote(null)} 
                className="border-surface-700 text-surface-300"
              >
                Close
              </Button>
              <Button 
                onClick={() => { playClick(); printCurrentWindow() }} 
                className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Credit Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-red-500/40 space-y-4 animate-scale-in">
            <h4 className="text-base font-bold text-white">Delete Customer Return?</h4>
            <p className="text-xs text-surface-300">
              Are you sure you want to remove this return record? The refund amount and inventory adjustment will be reversed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setDeletingId(null)}
                className="border-surface-700 text-surface-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleDelete(deletingId)}
                className="bg-red-600 hover:bg-red-500 text-white shadow-glow"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
