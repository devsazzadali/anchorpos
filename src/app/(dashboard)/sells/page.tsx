"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Search, Filter, Printer, MoreHorizontal, 
  FileEdit, Trash2, Plus, Eye, DollarSign, Download,
  CheckCircle2, Clock, X, AlertCircle
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
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export interface SellInvoice {
  id: string
  invoiceNo: string
  date: string
  customer: string
  location: string
  paymentStatus: 'paid' | 'partial' | 'due'
  total: number // paise
  paid: number  // paise
  due: number   // paise
}

const INITIAL_SELLS: SellInvoice[] = [
  { id: '1', invoiceNo: 'INV-2026-0001', date: '2026-09-12 03:30 PM', customer: 'Walk-In Customer', location: 'RANGPUR BIKE PARLOUR', paymentStatus: 'paid', total: 1500000, paid: 1500000, due: 0 },
  { id: '2', invoiceNo: 'INV-2026-0002', date: '2026-09-13 11:30 AM', customer: 'Rahim Chowdhury', location: 'RANGPUR BIKE PARLOUR', paymentStatus: 'paid', total: 1016000, paid: 1016000, due: 0 },
  { id: '3', invoiceNo: 'INV-2026-0003', date: '2026-09-13 02:15 PM', customer: 'Karim Ullah (Bike Garage)', location: 'RANGPUR BIKE PARLOUR', paymentStatus: 'partial', total: 850000, paid: 500000, due: 350000 },
]

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  partial: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  due: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export default function SellsPage() {
  const { toast } = useToast()
  const [sells, setSells] = useState<SellInvoice[]>(INITIAL_SELLS)
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  // Modals
  const [selectedSell, setSelectedSell] = useState<SellInvoice | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isPayOpen, setIsPayOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [payAmount, setPayAmount] = useState("")

  const filtered = useMemo(() => {
    return sells.filter((s) => {
      const matchSearch =
        !search ||
        s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        s.customer.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === "all" || s.paymentStatus === statusFilter
      return matchSearch && matchStatus
    })
  }, [sells, search, statusFilter])

  // Handlers
  const handleExport = () => {
    playClick()
    exportToCsv("Sales_Invoices_Rangpur_Bike_Parlour", [
      { header: "Invoice No", key: "invoiceNo" },
      { header: "Date", key: "date" },
      { header: "Customer", key: "customer" },
      { header: "Location", key: "location" },
      { header: "Payment Status", key: "paymentStatus" },
      { header: "Total Amount (Paise)", key: "total" },
      { header: "Paid Amount (Paise)", key: "paid" },
      { header: "Due Amount (Paise)", key: "due" },
    ], filtered)
    toast({ title: "Exported to CSV", description: "Sales records downloaded successfully." })
  }

  const handleOpenPay = (sell: SellInvoice) => {
    playClick()
    setSelectedSell(sell)
    setPayAmount(String(sell.due / 100))
    setIsPayOpen(true)
  }

  const handleConfirmPayment = () => {
    if (!selectedSell) return
    playSuccess()
    const addedPaise = Math.round(Number(payAmount) * 100)
    const newPaid = selectedSell.paid + addedPaise
    const newDue = Math.max(0, selectedSell.total - newPaid)
    const newStatus: 'paid' | 'partial' | 'due' = newDue === 0 ? 'paid' : 'partial'

    setSells(prev => prev.map(s => {
      if (s.id === selectedSell.id) {
        return {
          ...s,
          paid: newPaid,
          due: newDue,
          paymentStatus: newStatus,
        }
      }
      return s
    }))

    setIsPayOpen(false)
    toast({
      title: "Payment Received",
      description: `Collected ${formatCurrency(addedPaise)} for ${selectedSell.invoiceNo}.`,
    })
  }

  const handleDelete = () => {
    if (!selectedSell) return
    playClick()
    setSells(prev => prev.filter(s => s.id !== selectedSell.id))
    setIsDeleteOpen(false)
    toast({ title: "Invoice Removed", description: `${selectedSell.invoiceNo} has been deleted.` })
  }

  const handlePrint = (sell: SellInvoice) => {
    playClick()
    window.print()
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Sales Invoices</h2>
          <p className="text-surface-400 mt-1">Review POS transactions, receipts, and payment settlements</p>
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

          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2 text-brand-400" />
            Export CSV
          </Button>

          <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Link href="/pos">
              <Plus className="w-4 h-4 mr-2" /> New Sale (POS)
            </Link>
          </Button>
        </div>
      </div>

      {/* Expandable Filter Bar */}
      {showFilters && (
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-brand-500/20 animate-fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-surface-400 font-medium">Payment Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid (Settled)</option>
              <option value="partial">Partial Payment</option>
              <option value="due">Due / Unpaid</option>
            </select>
          </div>

          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-xs text-brand-400 hover:underline ml-auto"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Sales", value: formatCurrency(sells.reduce((s, x) => s + x.total, 0)), color: "text-white" },
          { label: "Total Collected", value: formatCurrency(sells.reduce((s, x) => s + x.paid, 0)), color: "text-emerald-400" },
          { label: "Outstanding Due", value: formatCurrency(sells.reduce((s, x) => s + x.due, 0)), color: "text-red-400" },
          { label: "Total Invoices", value: String(sells.length), color: "text-brand-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-4 rounded-xl">
            <p className="text-surface-400 text-xs font-medium">{stat.label}</p>
            <p className={`text-xl font-bold font-mono mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              placeholder="Search by invoice no or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 h-10 w-full text-white"
            />
          </div>
          <div className="text-xs text-surface-400 font-medium">
            Showing <span className="font-bold text-white">{filtered.length}</span> invoices
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Invoice</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium text-right">Due</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
                    No sales invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sell) => (
                  <tr key={sell.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{sell.date}</div>
                      <div className="text-xs text-brand-400 mt-0.5 font-mono">{sell.invoiceNo}</div>
                    </td>
                    <td className="px-6 py-4 text-surface-200 font-medium text-xs">{sell.customer}</td>
                    <td className="px-6 py-4 text-surface-400 text-xs">{sell.location}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${STATUS_STYLES[sell.paymentStatus]}`}>
                        {sell.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-white">{formatCurrency(sell.total)}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs">
                      <span className={sell.due > 0 ? "text-red-400 font-bold" : "text-surface-600"}>
                        {sell.due > 0 ? formatCurrency(sell.due) : "—"}
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
                            onClick={() => { playClick(); setSelectedSell(sell); setIsViewOpen(true) }}
                            className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer text-xs"
                          >
                            <Eye className="mr-2 h-4 w-4 text-brand-400" /> View Details
                          </DropdownMenuItem>

                          {sell.due > 0 && (
                            <DropdownMenuItem 
                              onClick={() => handleOpenPay(sell)}
                              className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer text-xs text-emerald-400"
                            >
                              <DollarSign className="mr-2 h-4 w-4" /> Collect Due
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem 
                            onClick={() => handlePrint(sell)}
                            className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer text-xs"
                          >
                            <Printer className="mr-2 h-4 w-4 text-blue-400" /> Print Invoice
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-surface-700" />

                          <DropdownMenuItem 
                            onClick={() => { playClick(); setSelectedSell(sell); setIsDeleteOpen(true) }}
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
            <DialogTitle className="text-lg font-display">Invoice Summary</DialogTitle>
          </DialogHeader>
          {selectedSell && (
            <div className="space-y-4 mt-2 text-xs">
              <div className="p-4 rounded-xl bg-surface-800 border border-surface-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-surface-400">Invoice:</span>
                  <span className="font-mono font-bold text-brand-400">{selectedSell.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Date:</span>
                  <span className="text-white">{selectedSell.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Customer:</span>
                  <span className="text-white font-bold">{selectedSell.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Branch:</span>
                  <span className="text-white">{selectedSell.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Total Bill:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(selectedSell.total)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedSell.paid)}</span>
                </div>
                <div className="flex justify-between text-red-400 font-medium">
                  <span>Balance Due:</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedSell.due)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handlePrint(selectedSell)} className="flex-1 border-surface-700 text-white">
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <Button onClick={() => setIsViewOpen(false)} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Collect Due Payment */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Collect Outstanding Due
            </DialogTitle>
          </DialogHeader>
          {selectedSell && (
            <div className="space-y-4 mt-2">
              <div className="p-3 rounded-lg bg-surface-800 border border-surface-700 text-xs space-y-1">
                <p className="text-surface-400">Invoice: <span className="text-white font-mono">{selectedSell.invoiceNo}</span></p>
                <p className="text-surface-400">Customer: <span className="text-white font-bold">{selectedSell.customer}</span></p>
                <p className="text-red-400 font-bold">Current Due: {formatCurrency(selectedSell.due)}</p>
              </div>
              <div>
                <label className="text-xs text-surface-400 block mb-1">Collection Amount (৳)</label>
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
                  Confirm Pay
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
            <DialogTitle className="text-base font-display text-red-400">Delete Invoice?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-surface-400 mt-2">
            Are you sure you want to remove <span className="text-white font-bold">{selectedSell?.invoiceNo}</span>?
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
