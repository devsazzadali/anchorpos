"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Plus, Search, Printer, ArrowRight, CheckCircle2, Clock, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface QuotationRecord {
  id: string
  date: string
  quotationNo: string
  customer: string
  location: string
  validUntil: string
  status: "Sent" | "Accepted" | "Expired"
  totalAmount: number
}

const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: "QT-001",
    date: "2026-09-11",
    quotationNo: "QT2026/0001",
    customer: "Standard Bike Supply",
    location: "RANGPUR BIKE PARLOUR",
    validUntil: "2026-09-25",
    status: "Sent",
    totalAmount: 4500.00 // Bulk 10 pcs Engine Oil quote
  },
  {
    id: "QT-002",
    date: "2026-09-12",
    quotationNo: "QT2026/0002",
    customer: "Walk-In Customer",
    location: "RANGPUR BIKE PARLOUR",
    validUntil: "2026-09-19",
    status: "Accepted",
    totalAmount: 1320.00 // 1 Helmet + 1 Chain Lube
  },
  {
    id: "QT-003",
    date: "2026-09-13",
    quotationNo: "QT2026/0003",
    customer: "Rangpur Bikers Club",
    location: "RANGPUR BIKE PARLOUR",
    validUntil: "2026-09-30",
    status: "Sent",
    totalAmount: 8500.00 // 5 KYT helmets & gloves quote
  }
]

export default function QuotationsPage() {
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<QuotationRecord[]>(INITIAL_QUOTATIONS)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionAlert, setActionAlert] = useState<string | null>(null)

  const handleConvert = (quote: QuotationRecord) => {
    playSuccess()
    setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: "Accepted" } : q))
    setActionAlert(`Quotation ${quote.quotationNo} successfully accepted and converted into confirmed sale!`)
    setTimeout(() => setActionAlert(null), 3500)
    toast({
      title: "Quotation Converted",
      description: `${quote.quotationNo} is now queued for invoice generation.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = (quote: QuotationRecord) => {
    playClick()
    setQuotes(quotes.filter(q => q.id !== quote.id))
    toast({
      title: "Quotation Deleted",
      description: `Removed quotation ${quote.quotationNo}.`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(q => ({
      "Quotation No": q.quotationNo,
      Date: q.date,
      Customer: q.customer,
      Location: q.location,
      "Valid Until": q.validUntil,
      Status: q.status,
      "Total Amount (BDT)": q.totalAmount,
    }))
    exportToCsv("rangpur_bike_quotations.csv", rows)
    toast({
      title: "Quotations Exported",
      description: `Exported ${filtered.length} quotations to CSV.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const filtered = quotes.filter(q => 
    q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Quotations</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Estimates
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Formal price estimates and customer quotations for Rangpur Bike Parlour
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleExportCsv}
            className="border-surface-700 bg-surface-800/80 hover:bg-surface-700 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Link href="/sells/create">
            <Button className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              <Plus className="w-4 h-4 mr-2" /> Add Quotation
            </Button>
          </Link>
        </div>
      </div>

      {actionAlert && (
        <div className="glass-panel border-emerald-500/30 bg-emerald-950/30 p-4 rounded-xl flex items-center gap-3 text-emerald-300 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{actionAlert}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search quotation by number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/80 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> of {quotes.length} quotes
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Quotation No</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total (৳)</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((quote) => (
                <tr key={quote.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs">{quote.date}</td>
                  <td className="px-6 py-4 font-mono font-bold text-white group-hover:text-brand-300 transition-colors">{quote.quotationNo}</td>
                  <td className="px-6 py-4 font-medium text-white">{quote.customer}</td>
                  <td className="px-6 py-4 font-mono text-xs text-surface-400">{quote.validUntil}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quote.status === "Accepted"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                        : "bg-brand-950/40 text-brand-400 border border-brand-800/40"
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-white">
                    ৳ {quote.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConvert(quote)}
                        className="h-8 bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40 text-xs"
                      >
                        Convert <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { playClick(); window.print() }}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Print Quote"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(quote)}
                        className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
