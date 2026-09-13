"use client"

import { useState } from "react"
import { 
  RotateCcw, Plus, Search, Filter, ArrowDownRight, FileText, 
  CheckCircle, Clock, Printer, Download, Eye, Trash2, X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

interface PurchaseReturn {
  id: string
  date: string
  referenceNo: string
  parentPurchase: string
  supplier: string
  location: string
  itemReturned: string
  quantity: number
  reason: string
  status: "Completed" | "Pending"
  paymentStatus: "Refunded" | "Pending" | "Partial"
  totalAmount: number
}

const INITIAL_RETURNS: PurchaseReturn[] = [
  {
    id: "PR-0001",
    date: "2026-09-10",
    referenceNo: "PR2026/0001",
    parentPurchase: "PO2026/0001",
    supplier: "Motul Bangladesh (ACI Motors)",
    location: "RANGPUR BIKE PARLOUR",
    itemReturned: "Motul 7100 4T 10W40 (1L)",
    quantity: 3,
    reason: "Defective cap seal during unboxing",
    status: "Completed",
    paymentStatus: "Refunded",
    totalAmount: 1140.00
  },
  {
    id: "PR-0002",
    date: "2026-09-12",
    referenceNo: "PR2026/0002",
    parentPurchase: "PO2026/0002",
    supplier: "Yamaha Genuine Parts (ACI)",
    location: "RANGPUR BIKE PARLOUR",
    itemReturned: "R15 V3 Air Filter Genuine",
    quantity: 2,
    reason: "Wrong SKU dispatched by vendor",
    status: "Completed",
    paymentStatus: "Refunded",
    totalAmount: 900.00
  },
  {
    id: "PR-0003",
    date: "2026-09-13",
    referenceNo: "PR2026/0003",
    parentPurchase: "PO2026/0003",
    supplier: "Brembo Racing Imports BD",
    location: "RANGPUR BIKE PARLOUR",
    itemReturned: "Sintered Front Brake Pads",
    quantity: 1,
    reason: "Awaiting supplier credit adjustment",
    status: "Pending",
    paymentStatus: "Pending",
    totalAmount: 1650.00
  }
]

export default function PurchaseReturnsPage() {
  const { toast } = useToast()
  const [returns, setReturns] = useState<PurchaseReturn[]>(INITIAL_RETURNS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [viewingDebitNote, setViewingDebitNote] = useState<PurchaseReturn | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // New return form state
  const [selectedPO, setSelectedPO] = useState("PO2026/0001")
  const [supplierName, setSupplierName] = useState("Motul Bangladesh (ACI Motors)")
  const [itemName, setItemName] = useState("Motul 7100 4T 10W40 (1L)")
  const [returnReason, setReturnReason] = useState("Defective packaging / seal broken")
  const [returnQty, setReturnQty] = useState(1)
  const [returnAmount, setReturnAmount] = useState(380)

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    const newRecord: PurchaseReturn = {
      id: `PR-000${returns.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      referenceNo: `PR2026/000${returns.length + 1}`,
      parentPurchase: selectedPO,
      supplier: supplierName,
      location: "RANGPUR BIKE PARLOUR",
      itemReturned: itemName,
      quantity: returnQty,
      reason: returnReason,
      status: "Completed",
      paymentStatus: "Pending",
      totalAmount: returnAmount
    }
    setReturns([newRecord, ...returns])
    setIsCreateOpen(false)
    toast({
      title: "Debit Note Created",
      description: `Purchase return ${newRecord.referenceNo} recorded successfully.`
    })
  }

  const handleDelete = (id: string) => {
    playClick()
    setReturns(prev => prev.filter(r => r.id !== id))
    setDeletingId(null)
    toast({
      title: "Return Deleted",
      description: "Purchase return record removed successfully.",
      variant: "destructive"
    })
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Purchase_Returns_Rangpur_Bike_Parlour", [
      { header: "Date", key: "date" },
      { header: "Reference No", key: "referenceNo" },
      { header: "Parent Purchase PO", key: "parentPurchase" },
      { header: "Supplier", key: "supplier" },
      { header: "Item Returned", key: "itemReturned" },
      { header: "Qty", key: "quantity" },
      { header: "Reason", key: "reason" },
      { header: "Status", key: "status" },
      { header: "Refund Status", key: "paymentStatus" },
      { header: "Amount (BDT)", key: "totalAmount" }
    ], filtered)
    toast({
      title: "Export Completed",
      description: "Purchase returns exported to CSV."
    })
  }

  const filtered = returns.filter(r => 
    r.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.parentPurchase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.itemReturned.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalReturnAmount = returns.reduce((acc, r) => acc + r.totalAmount, 0)
  const pendingRefunds = returns.filter(r => r.paymentStatus === "Pending").reduce((acc, r) => acc + r.totalAmount, 0)

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Purchase Returns</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Supplier Debit Notes
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Supplier debit notes and merchandise returns for Rangpur Bike Parlour (BL0001)
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
            onClick={() => { playClick(); setIsCreateOpen(true) }} 
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Purchase Return
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
            ৳ {totalReturnAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-surface-400 mt-1">{returns.length} return records logged</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-surface-400 tracking-wider">Pending Supplier Refunds</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            ৳ {pendingRefunds.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-surface-400 mt-1">Awaiting supplier credit settlement</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-surface-400 tracking-wider">Settled Debit Notes</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            ৳ {(totalReturnAmount - pendingRefunds).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-surface-400 mt-1">Credited / Cash refunded to account</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search return by Ref No, Parent PO, or Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <span>Location:</span>
          <span className="px-2.5 py-1 rounded bg-surface-800 text-white font-medium border border-surface-700">
            RANGPUR BIKE PARLOUR (BL0001)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reference No</th>
                <th className="px-6 py-4">Parent PO</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Item Returned</th>
                <th className="px-6 py-4">Return Status</th>
                <th className="px-6 py-4">Refund Status</th>
                <th className="px-6 py-4 text-right">Total Amount (৳)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((ret) => (
                <tr key={ret.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{ret.date}</td>
                  <td className="px-6 py-4 font-mono font-bold text-white">{ret.referenceNo}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-surface-800 text-brand-400 font-mono text-xs border border-surface-700">
                      {ret.parentPurchase}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{ret.supplier}</td>
                  <td className="px-6 py-4 text-xs text-surface-300">
                    <div className="font-medium text-white">{ret.itemReturned}</div>
                    <div className="text-[11px] text-surface-400">{ret.quantity} pcs &bull; {ret.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ret.status === "Completed"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                        : "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ret.paymentStatus === "Refunded"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                        : "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                    }`}>
                      {ret.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-white">
                    ৳ {ret.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { playClick(); setViewingDebitNote(ret) }}
                        className="h-8 px-2 text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 text-xs"
                        title="View Debit Note"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Note
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { playClick(); setDeletingId(ret.id) }}
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

      {/* Add Return Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-surface-700 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-brand-400" /> Create Purchase Return & Debit Note
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-surface-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Parent Purchase PO</label>
                <select
                  value={selectedPO}
                  onChange={(e) => {
                    const val = e.target.value
                    setSelectedPO(val)
                    if (val === "PO2026/0001") {
                      setSupplierName("Motul Bangladesh (ACI Motors)")
                      setItemName("Motul 7100 4T 10W40 (1L)")
                      setReturnAmount(returnQty * 380)
                    } else if (val === "PO2026/0002") {
                      setSupplierName("Yamaha Genuine Parts (ACI)")
                      setItemName("Yamaha R15 V3 Air Filter")
                      setReturnAmount(returnQty * 450)
                    } else {
                      setSupplierName("Brembo Racing Imports BD")
                      setItemName("Brembo Brake Pads")
                      setReturnAmount(returnQty * 1650)
                    }
                  }}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="PO2026/0001">PO2026/0001 — Motul Bangladesh (৳ 38,120.00)</option>
                  <option value="PO2026/0002">PO2026/0002 — Yamaha Genuine Parts (৳ 24,500.00)</option>
                  <option value="PO2026/0003">PO2026/0003 — Brembo Racing Imports (৳ 18,200.00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={supplierName}
                    disabled
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg p-2.5 text-sm text-surface-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Item to Return</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={returnQty}
                    onChange={(e) => {
                      const q = parseInt(e.target.value) || 1
                      setReturnQty(q)
                      setReturnAmount(q * 380)
                    }}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Total Debit Amount (৳)</label>
                  <input
                    type="number"
                    value={returnAmount}
                    onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-surface-700 text-surface-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
                  Confirm Return & Create Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Debit Note Modal */}
      {viewingDebitNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-surface-700 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                <h3 className="text-lg font-bold text-white">Debit Note: {viewingDebitNote.referenceNo}</h3>
              </div>
              <button 
                onClick={() => setViewingDebitNote(null)}
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
                  <span className="font-bold text-xs uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-300">
                    DEBIT NOTE
                  </span>
                  <p className="font-mono mt-1 font-bold">{viewingDebitNote.referenceNo}</p>
                  <p className="text-gray-500">{viewingDebitNote.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded border border-gray-200">
                <div>
                  <span className="text-gray-500 uppercase block font-semibold">Debit To (Vendor):</span>
                  <span className="font-bold text-black">{viewingDebitNote.supplier}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block font-semibold">Against Purchase PO:</span>
                  <span className="font-mono font-bold text-black">{viewingDebitNote.parentPurchase}</span>
                </div>
              </div>

              <table className="w-full text-left border border-gray-200 mt-2">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-2 font-semibold">Description</th>
                    <th className="p-2 text-center font-semibold">Qty</th>
                    <th className="p-2 text-right font-semibold">Total Debit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 font-medium">
                      {viewingDebitNote.itemReturned}
                      <div className="text-[10px] text-gray-500 italic">Reason: {viewingDebitNote.reason}</div>
                    </td>
                    <td className="p-2 text-center font-mono">{viewingDebitNote.quantity}</td>
                    <td className="p-2 text-right font-mono font-bold">৳ {viewingDebitNote.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center pt-2 font-bold text-sm border-t border-gray-200">
                <span>Total Amount Debited:</span>
                <span className="font-mono text-base text-red-600">৳ {viewingDebitNote.totalAmount.toFixed(2)}</span>
              </div>

              <div className="text-[10px] text-gray-500 pt-2 border-t border-dashed">
                Please credit this amount to our running supplier ledger or refund via designated bank account.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setViewingDebitNote(null)} 
                className="border-surface-700 text-surface-300"
              >
                Close
              </Button>
              <Button 
                onClick={() => { playClick(); printCurrentWindow() }} 
                className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Debit Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-red-500/40 space-y-4 animate-scale-in">
            <h4 className="text-base font-bold text-white">Delete Purchase Return?</h4>
            <p className="text-xs text-surface-300">
              Are you sure you want to remove this return record? Any associated stock adjustment will be reverted.
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
