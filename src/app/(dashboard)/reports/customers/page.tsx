"use client"

import { useState } from "react"
import { Search, Download, Users, AlertCircle, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/currency"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Rahim Enterprise', phone: '01711-123456', totalInvoiced: 12500000, totalPaid: 12500000, totalDue: 0, lastTransaction: '2026-09-12' },
  { id: '2', name: 'Karim Brothers Store', phone: '01812-654321', totalInvoiced: 8700000, totalPaid: 6000000, totalDue: 2700000, lastTransaction: '2026-09-10' },
  { id: '3', name: 'Dhaka Traders Co.', phone: '01911-999888', totalInvoiced: 5400000, totalPaid: 5400000, totalDue: 0, lastTransaction: '2026-09-08' },
  { id: '4', name: 'Walk-In Customer', phone: '—', totalInvoiced: 3200000, totalPaid: 3200000, totalDue: 0, lastTransaction: '2026-09-13' },
  { id: '5', name: 'Sultana Retailers', phone: '01612-111222', totalInvoiced: 9800000, totalPaid: 4500000, totalDue: 5300000, lastTransaction: '2026-08-31' },
]

export default function CustomerLedgerPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")

  const filtered = MOCK_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  const totalDue = MOCK_CUSTOMERS.reduce((s, c) => s + c.totalDue, 0)

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(c => ({
      "Customer Name": c.name,
      Phone: c.phone,
      "Total Invoiced (BDT)": c.totalInvoiced / 100,
      "Total Paid (BDT)": c.totalPaid / 100,
      "Outstanding Due (BDT)": c.totalDue / 100,
      "Last Transaction": c.lastTransaction,
    }))
    exportToCsv("rangpur_bike_customer_ledger.csv", rows)
    toast({
      title: "Customer Ledger Exported",
      description: `Exported ${filtered.length} customer records to CSV.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Customer Ledger</h2>
          <p className="text-surface-400 mt-1">Outstanding balances and transaction history per customer for Rangpur Bike Parlour</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { playClick(); window.print() }} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Printer className="w-4 h-4 mr-2" /> Print Ledger
          </Button>
          <Button onClick={handleExportCsv} className="bg-surface-800 border border-surface-700 hover:bg-surface-700 text-white">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Alert for total due */}
      {totalDue > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Total outstanding receivables: <span className="font-bold font-mono">{formatCurrency(totalDue)}</span></p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-500/20"><Users className="w-5 h-5 text-brand-400" /></div>
          <div>
            <p className="text-surface-400 text-xs">Total Customers</p>
            <p className="text-2xl font-bold text-white">{MOCK_CUSTOMERS.length}</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl">
          <p className="text-surface-400 text-xs">Total Invoiced</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(MOCK_CUSTOMERS.reduce((s, c) => s + c.totalInvoiced, 0))}</p>
        </div>
        <div className="glass-panel p-5 rounded-xl">
          <p className="text-surface-400 text-xs">Total Due</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalDue)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium text-right">Total Invoiced</th>
                <th className="px-6 py-4 font-medium text-right">Total Paid</th>
                <th className="px-6 py-4 font-medium text-right">Due Balance</th>
                <th className="px-6 py-4 font-medium">Last Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-surface-400">{c.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white">{formatCurrency(c.totalInvoiced)}</td>
                  <td className="px-6 py-4 text-right font-mono text-green-400">{formatCurrency(c.totalPaid)}</td>
                  <td className="px-6 py-4 text-right font-mono font-medium">
                    <span className={c.totalDue > 0 ? "text-red-400" : "text-surface-400"}>
                      {c.totalDue > 0 ? formatCurrency(c.totalDue) : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-surface-400 font-mono text-xs">{c.lastTransaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
