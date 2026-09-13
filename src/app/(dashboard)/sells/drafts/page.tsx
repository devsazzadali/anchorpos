"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  FileEdit, Search, ShoppingCart, Trash2, ArrowRight, 
  CheckCircle2, Download, Printer, Eye, X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

interface DraftRecord {
  id: string
  date: string
  referenceNo: string
  customer: string
  location: string
  itemsCount: number
  itemsDescription: string
  totalAmount: number
}

const INITIAL_DRAFTS: DraftRecord[] = [
  {
    id: "DRF-001",
    date: "2026-09-12",
    referenceNo: "DFT2026/0001",
    customer: "Walk-In Customer (Yamaha FZS)",
    location: "RANGPUR BIKE PARLOUR",
    itemsCount: 2,
    itemsDescription: "1x Motul 7100 4T 10W40 + 1x Motul C2 Chain Lube",
    totalAmount: 570.00
  },
  {
    id: "DRF-002",
    date: "2026-09-13",
    referenceNo: "DFT2026/0002",
    customer: "Walk-In Customer (R15 V3)",
    location: "RANGPUR BIKE PARLOUR",
    itemsCount: 1,
    itemsDescription: "1x KYT TT-Course Full Face Helmet",
    totalAmount: 1200.00
  },
  {
    id: "DRF-003",
    date: "2026-09-13",
    referenceNo: "DFT2026/0003",
    customer: "Biplob Bike Modification Club",
    location: "RANGPUR BIKE PARLOUR",
    itemsCount: 2,
    itemsDescription: "2x NGK Iridium Spark Plugs CR9EIX",
    totalAmount: 1800.00
  }
]

export default function DraftsPage() {
  const { toast } = useToast()
  const [drafts, setDrafts] = useState<DraftRecord[]>(INITIAL_DRAFTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingDraft, setViewingDraft] = useState<DraftRecord | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleConvert = (draft: DraftRecord) => {
    playClick()
    setDrafts(prev => prev.filter(d => d.id !== draft.id))
    toast({
      title: "Draft Converted to Sale",
      description: `Draft order ${draft.referenceNo} is now an active sale ready for receipt printing.`
    })
  }

  const handleDelete = (id: string) => {
    playClick()
    setDrafts(prev => prev.filter(d => d.id !== id))
    setDeletingId(null)
    toast({
      title: "Draft Deleted",
      description: "Draft order removed successfully.",
      variant: "destructive"
    })
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Draft_Sales_Rangpur_Bike_Parlour", [
      { header: "Date", key: "date" },
      { header: "Reference No", key: "referenceNo" },
      { header: "Customer", key: "customer" },
      { header: "Location", key: "location" },
      { header: "Items Count", key: "itemsCount" },
      { header: "Items Summary", key: "itemsDescription" },
      { header: "Total Amount (BDT)", key: "totalAmount" }
    ], filtered)
    toast({
      title: "Export Completed",
      description: "Draft sales exported to CSV."
    })
  }

  const filtered = drafts.filter(d => 
    d.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.itemsDescription.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Draft Sales</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pending Carts
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Incomplete orders and saved carts ready for final checkout at Rangpur Bike Parlour
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

          <Link href="/sells/create">
            <Button className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              <ShoppingCart className="w-4 h-4 mr-2" /> New Sale / Draft
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search drafts by reference number, customer, or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="text-xs text-surface-400">
          Saved Draft Orders: <span className="text-white font-bold">{drafts.length}</span>
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
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items Summary</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Total (৳)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-surface-500">
                    No drafts found.
                  </td>
                </tr>
              ) : (
                filtered.map((draft) => (
                  <tr key={draft.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{draft.date}</td>
                    <td className="px-6 py-4 font-mono font-bold text-white">{draft.referenceNo}</td>
                    <td className="px-6 py-4 font-medium text-white">{draft.customer}</td>
                    <td className="px-6 py-4 text-xs text-surface-300">
                      <div>{draft.itemsDescription}</div>
                      <span className="text-[10px] text-brand-400 font-mono">({draft.itemsCount} items)</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-surface-400">{draft.location}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white">
                      ৳ {draft.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleConvert(draft)}
                          className="h-8 bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40 text-xs"
                          title="Convert to Active Sale"
                        >
                          Convert <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { playClick(); setViewingDraft(draft) }}
                          className="h-8 px-2 text-surface-400 hover:text-white hover:bg-surface-800 text-xs"
                          title="View Draft"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { playClick(); setDeletingId(draft.id) }}
                          className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Pro-Forma Draft Modal */}
      {viewingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-surface-700 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-brand-400" /> Draft Order: {viewingDraft.referenceNo}
              </h3>
              <button onClick={() => setViewingDraft(null)} className="text-surface-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white text-black p-5 rounded-xl space-y-4 text-xs font-sans shadow-inner">
              <div className="border-b pb-3 flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide text-brand-700">Rangpur Bike Parlour</h4>
                  <p className="text-gray-600">Station Road, Rangpur</p>
                  <p className="text-gray-600">Phone: +880 1700-000000</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                    DRAFT ESTIMATE
                  </span>
                  <p className="font-mono mt-1 font-bold">{viewingDraft.referenceNo}</p>
                  <p className="text-gray-500">{viewingDraft.date}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                <span className="text-gray-500 uppercase block font-semibold text-[10px]">Customer:</span>
                <span className="font-bold text-sm text-black">{viewingDraft.customer}</span>
              </div>

              <div className="py-2 border-y border-gray-200">
                <p className="font-semibold text-gray-700 mb-1">Items In Cart:</p>
                <p className="text-black font-medium">{viewingDraft.itemsDescription}</p>
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-base">
                <span>Estimated Total:</span>
                <span className="font-mono text-lg text-brand-700">৳ {viewingDraft.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setViewingDraft(null)} 
                className="border-surface-700 text-surface-300"
              >
                Close
              </Button>
              <Button 
                onClick={() => { playClick(); printCurrentWindow() }} 
                className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Estimate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-red-500/40 space-y-4 animate-scale-in">
            <h4 className="text-base font-bold text-white">Delete Draft Order?</h4>
            <p className="text-xs text-surface-300">
              Are you sure you want to discard this draft cart? Items will be released back to inventory.
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
                Discard Draft
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
