"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, Eye, Download, Sliders, CheckCircle2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface StockAdjustment {
  id: string
  date: string
  ref_no: string
  location: string
  type: "normal" | "abnormal"
  total_amount: number
  reason: string
  items: { name: string; qty: number; unitCost: number }[]
}

const INITIAL_ADJUSTMENTS: StockAdjustment[] = [
  { 
    id: '1', 
    date: '2026-09-12 10:30 AM', 
    ref_no: 'SA-2026-001', 
    location: 'Rangpur Main Branch (BL0001)', 
    type: 'normal', 
    total_amount: 15000, 
    reason: 'Damaged in transit - bottle seal leaking during shipment',
    items: [
      { name: "Motul 7100 4T 10W40 (1L)", qty: 10, unitCost: 1050 },
      { name: "Castrol Power1 20W40 (1L)", qty: 5, unitCost: 900 }
    ]
  },
  { 
    id: '2', 
    date: '2026-09-10 02:15 PM', 
    ref_no: 'SA-2026-002', 
    location: 'Rangpur Main Branch (BL0001)', 
    type: 'abnormal', 
    total_amount: 50000, 
    reason: 'Discrepancy identified during quarterly cycle inventory audit',
    items: [
      { name: "KYT TT-Course Helmet (Matte Black)", qty: 5, unitCost: 6500 },
      { name: "NGK Laser Iridium Plugs", qty: 25, unitCost: 700 }
    ]
  },
  { 
    id: '3', 
    date: '2026-09-08 04:45 PM', 
    ref_no: 'SA-2026-003', 
    location: 'Rangpur Main Branch (BL0001)', 
    type: 'normal', 
    total_amount: 4500, 
    reason: 'Brembo brake pads package tear / water damage',
    items: [
      { name: "Brembo Sintered Disc Pads", qty: 3, unitCost: 1500 }
    ]
  },
]

export default function StockAdjustmentsPage() {
  const { toast } = useToast()
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(INITIAL_ADJUSTMENTS)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "normal" | "abnormal">("all")

  // Modals
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StockAdjustment | null>(null)

  const filtered = adjustments.filter(adj => {
    const matchesSearch = adj.ref_no.toLowerCase().includes(search.toLowerCase()) ||
      adj.reason.toLowerCase().includes(search.toLowerCase()) ||
      adj.location.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || adj.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleDelete = () => {
    if (!deleteTarget) return
    setAdjustments(adjustments.filter(a => a.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Adjustment Deleted",
      description: `Adjustment ${deleteTarget.ref_no} deleted and stock rolled back.`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(a => ({
      "Reference No": a.ref_no,
      Date: a.date,
      Location: a.location,
      Type: a.type === 'normal' ? 'Normal (Damaged)' : 'Abnormal (Loss/Theft)',
      Reason: a.reason,
      "Total Paused Amount (BDT)": a.total_amount,
    }))
    exportToCsv("rangpur_bike_stock_adjustments.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} stock adjustment records.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Stock Adjustments</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Audit
            </span>
          </div>
          <p className="text-surface-400 mt-1">Manage inventory discrepancies, transit damages, and cycle count write-offs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportCsv}
            className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Link href="/stock-adjustments/create">
              <Plus className="w-4 h-4 mr-2" /> Add Adjustment
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search by Reference No, Reason, or Location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 focus-visible:ring-brand-500 h-10 w-full text-white"
          />
        </div>
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          <Button
            size="sm"
            variant={typeFilter === "all" ? "default" : "outline"}
            onClick={() => { playClick(); setTypeFilter("all") }}
            className={`h-8 text-xs ${typeFilter === "all" ? "bg-brand-600 text-white" : "border-surface-700 text-surface-300"}`}
          >
            All ({adjustments.length})
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "normal" ? "default" : "outline"}
            onClick={() => { playClick(); setTypeFilter("normal") }}
            className={`h-8 text-xs ${typeFilter === "normal" ? "bg-blue-600 text-white" : "border-surface-700 text-surface-300"}`}
          >
            Normal (Damage)
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "abnormal" ? "default" : "outline"}
            onClick={() => { playClick(); setTypeFilter("abnormal") }}
            className={`h-8 text-xs ${typeFilter === "abnormal" ? "bg-red-600 text-white" : "border-surface-700 text-surface-300"}`}
          >
            Abnormal (Loss)
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date &amp; Ref No</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Adjustment Type</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Adjustment Value</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-400">
                    No stock adjustments found.
                  </td>
                </tr>
              ) : (
                filtered.map((adj) => (
                  <tr key={adj.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{adj.date}</div>
                      <div className="text-xs text-brand-400 font-mono font-bold mt-0.5">{adj.ref_no}</div>
                    </td>
                    <td className="px-6 py-4 text-surface-300 text-xs">{adj.location}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`border-none ${
                        adj.type === 'normal' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {adj.type === 'normal' ? 'Normal (Damaged)' : 'Abnormal (Loss/Theft)'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-surface-400 text-xs italic max-w-xs truncate">{adj.reason}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white">
                      {formatCurrency(adj.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface-800 border-surface-700 text-surface-200 w-48">
                          <DropdownMenuItem 
                            onClick={() => { playClick(); setSelectedAdjustment(adj) }}
                            className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-surface-700" />
                          <DropdownMenuItem 
                            onClick={() => { playClick(); setDeleteTarget(adj) }}
                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Adjustment
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

      {/* View Details Modal */}
      <Dialog open={!!selectedAdjustment} onOpenChange={(open) => !open && setSelectedAdjustment(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold flex items-center justify-between">
              <span>Adjustment #{selectedAdjustment?.ref_no}</span>
              <Badge variant="secondary" className={`border-none ${
                selectedAdjustment?.type === 'normal' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedAdjustment?.type === 'normal' ? 'Normal (Damaged)' : 'Abnormal (Loss/Theft)'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-surface-400">Date:</span> <strong className="text-white">{selectedAdjustment?.date}</strong></div>
              <div><span className="text-surface-400">Location:</span> <strong className="text-white">{selectedAdjustment?.location}</strong></div>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/60 border border-surface-700">
              <span className="text-xs text-surface-400 block mb-1">Reason / Notes:</span>
              <p className="text-white text-xs leading-relaxed">{selectedAdjustment?.reason}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-surface-400 font-semibold uppercase tracking-wider">Adjusted Inventory Items</span>
              <div className="border border-surface-700 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-800 text-surface-400 uppercase">
                    <tr>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/60">
                    {selectedAdjustment?.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-white">{item.name}</td>
                        <td className="p-2.5 text-center font-mono text-brand-400 font-bold">{item.qty}</td>
                        <td className="p-2.5 text-right font-mono text-white">{formatCurrency(item.qty * item.unitCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-surface-800">
              <span className="text-surface-300">Total Adjustment Value:</span>
              <span className="text-xl font-mono text-white">{formatCurrency(selectedAdjustment?.total_amount || 0)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedAdjustment(null)} className="bg-brand-600 hover:bg-brand-500 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Adjustment?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete adjustment <strong className="text-white">{deleteTarget?.ref_no}</strong>? Stock quantities will be rolled back.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
