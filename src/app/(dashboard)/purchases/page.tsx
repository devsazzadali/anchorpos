"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, 
  Printer, Eye, CreditCard, Download, CheckCircle2, Clock 
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
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export interface PurchaseItem {
  id: string
  date: string
  ref_no: string
  supplier: string
  status: 'received' | 'pending' | 'ordered'
  payment_status: 'paid' | 'partial' | 'due'
  grand_total: number
  paid: number
  due: number
}

const INITIAL_PURCHASES: PurchaseItem[] = [
  { id: '1', date: '2026-09-12 11:30 AM', ref_no: 'PO2026/0001', supplier: 'Standard Bike Supply', status: 'received', payment_status: 'paid', grand_total: 3812000, paid: 3812000, due: 0 },
  { id: '2', date: '2026-09-13 09:15 AM', ref_no: 'PO2026/0002', supplier: 'Motul Bangladesh Distributors', status: 'received', payment_status: 'partial', grand_total: 1500000, paid: 1000000, due: 500000 },
]

export default function PurchasesPage() {
  const { toast } = useToast()
  const [purchases, setPurchases] = useState<PurchaseItem[]>(INITIAL_PURCHASES)
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  // Modals
  const [selectedPo, setSelectedPo] = useState<PurchaseItem | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isPayOpen, setIsPayOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [payAmount, setPayAmount] = useState("")

  const filtered = useMemo(() => {
    return purchases.filter((po) => {
      const matchSearch =
        !search ||
        po.ref_no.toLowerCase().includes(search.toLowerCase()) ||
        po.supplier.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === "all" || po.payment_status === statusFilter
      return matchSearch && matchStatus
    })
  }, [purchases, search, statusFilter])

  const handleExport = () => {
    playClick()
    exportToCsv("Purchase_Orders_Rangpur_Bike_Parlour", [
      { header: "Purchase Ref", key: "ref_no" },
      { header: "Date", key: "date" },
      { header: "Supplier", key: "supplier" },
      { header: "Order Status", key: "status" },
      { header: "Payment Status", key: "payment_status" },
      { header: "Total Amount (Paise)", key: "grand_total" },
      { header: "Paid Amount (Paise)", key: "paid" },
      { header: "Due Amount (Paise)", key: "due" },
    ], filtered)
    toast({ title: "Exported Purchases", description: "CSV file downloaded." })
  }

  const handleConfirmPayment = () => {
    if (!selectedPo) return
    playSuccess()
    const addedPaise = Math.round(Number(payAmount) * 100)
    const newPaid = selectedPo.paid + addedPaise
    const newDue = Math.max(0, selectedPo.grand_total - newPaid)
    const newStatus: 'paid' | 'partial' | 'due' = newDue === 0 ? 'paid' : 'partial'

    setPurchases(prev => prev.map(p => {
      if (p.id === selectedPo.id) {
        return {
          ...p,
          paid: newPaid,
          due: newDue,
          payment_status: newStatus,
        }
      }
      return p
    }))

    setIsPayOpen(false)
    toast({
      title: "Supplier Payment Recorded",
      description: `Paid ${formatCurrency(addedPaise)} for ${selectedPo.ref_no}.`,
    })
  }

  const handleDelete = () => {
    if (!selectedPo) return
    playClick()
    setPurchases(prev => prev.filter(p => p.id !== selectedPo.id))
    setIsDeleteOpen(false)
    toast({ title: "Purchase Order Removed", description: `${selectedPo.ref_no} deleted.` })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Purchase Orders</h2>
          <p className="text-surface-400 mt-1">Manage supplier procurement, incoming shipments, and bills</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => { playClick(); setShowFilters(prev => !prev) }}
            className={`border-surface-700 bg-surface-800 text-surface-200 ${
              showFilters ? 'bg-surface-700 text-white border-brand-500' : 'hover:bg-surface-700'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters {showFilters ? "(Active)" : ""}
          </Button>

          <Button variant="outline" onClick={handleExport} className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200">
            <Download className="w-4 h-4 mr-2 text-brand-400" /> Export CSV
          </Button>

          <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Link href="/purchases/create">
              <Plus className="w-4 h-4 mr-2" />
              Add Purchase
            </Link>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-brand-500/20 animate-fade-in text-xs">
          <span className="text-surface-400 font-medium">Payment Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Purchases</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="due">Due / Unpaid</option>
          </select>
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")} className="text-xs text-brand-400 hover:underline ml-auto">
              Reset
            </button>
          )}
        </div>
      )}

      <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input 
              placeholder="Search by Reference No or Supplier..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 h-10 w-full text-white"
            />
          </div>
          <div className="text-xs text-surface-400">
            Showing <span className="font-bold text-white">{filtered.length}</span> purchase orders
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Ref No</th>
                <th className="px-6 py-4 font-medium">Supplier</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Grand Total</th>
                <th className="px-6 py-4 font-medium text-right">Paid</th>
                <th className="px-6 py-4 font-medium text-right">Due</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
                    No purchase orders found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((po) => (
                  <tr key={po.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{po.date}</div>
                      <div className="text-xs text-brand-400 mt-0.5 font-mono">{po.ref_no}</div>
                    </td>
                    <td className="px-6 py-4 text-surface-200 text-xs font-medium">{po.supplier}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Badge variant="secondary" className="border-none bg-emerald-500/20 text-emerald-400 text-[10px] capitalize">
                          {po.status}
                        </Badge>
                        <Badge variant="secondary" className={`border-none text-[10px] capitalize ${
                          po.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          po.payment_status === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {po.payment_status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-white">
                      {formatCurrency(po.grand_total)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400 text-xs">
                      {formatCurrency(po.paid)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs">
                      <span className={po.due > 0 ? "text-red-400 font-bold" : "text-surface-500"}>
                        {po.due > 0 ? formatCurrency(po.due) : "৳ 0.00"}
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
                          <DropdownMenuItem onClick={() => { playClick(); setSelectedPo(po); setIsViewOpen(true) }} className="hover:bg-surface-700 cursor-pointer text-xs">
                            <Eye className="mr-2 h-4 w-4 text-brand-400" /> View Order
                          </DropdownMenuItem>

                          {po.due > 0 && (
                            <DropdownMenuItem onClick={() => { playClick(); setSelectedPo(po); setPayAmount(String(po.due / 100)); setIsPayOpen(true) }} className="hover:bg-surface-700 cursor-pointer text-xs text-emerald-400">
                              <CreditCard className="mr-2 h-4 w-4" /> Pay Supplier
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => { playClick(); printCurrentWindow() }} className="hover:bg-surface-700 cursor-pointer text-xs">
                            <Printer className="mr-2 h-4 w-4 text-blue-400" /> Print PO
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-surface-700" />

                          <DropdownMenuItem onClick={() => { playClick(); setSelectedPo(po); setIsDeleteOpen(true) }} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer text-xs">
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

      {/* Modal: View PO Details */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Purchase Order Summary</DialogTitle>
          </DialogHeader>
          {selectedPo && (
            <div className="space-y-4 mt-2 text-xs">
              <div className="p-4 rounded-xl bg-surface-800 border border-surface-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-surface-400">Reference:</span>
                  <span className="font-mono font-bold text-brand-400">{selectedPo.ref_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Supplier:</span>
                  <span className="text-white font-bold">{selectedPo.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Order Date:</span>
                  <span className="text-white">{selectedPo.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Bill Total:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(selectedPo.grand_total)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Paid:</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedPo.paid)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Outstanding:</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedPo.due)}</span>
                </div>
              </div>
              <Button onClick={() => setIsViewOpen(false)} className="w-full bg-brand-600 hover:bg-brand-500 text-white">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Pay Supplier */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Pay Supplier Due
            </DialogTitle>
          </DialogHeader>
          {selectedPo && (
            <div className="space-y-4 mt-2">
              <div className="p-3 rounded-lg bg-surface-800 border border-surface-700 text-xs space-y-1">
                <p className="text-surface-400">Order: <span className="text-white font-mono">{selectedPo.ref_no}</span></p>
                <p className="text-surface-400">Supplier: <span className="text-white font-bold">{selectedPo.supplier}</span></p>
                <p className="text-red-400 font-bold">Outstanding: {formatCurrency(selectedPo.due)}</p>
              </div>
              <div>
                <label className="text-xs text-surface-400 block mb-1">Disbursement Amount (৳)</label>
                <Input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="bg-surface-800 border-surface-700 text-white font-mono text-lg font-bold"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsPayOpen(false)} className="flex-1 bg-surface-800 border-surface-700 text-white">
                  Cancel
                </Button>
                <Button onClick={handleConfirmPayment} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                  Confirm Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display text-red-400">Delete Purchase Order?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-surface-400 mt-2">
            Are you sure you want to remove <span className="text-white font-bold">{selectedPo?.ref_no}</span>?
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
