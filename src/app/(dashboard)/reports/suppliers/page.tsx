"use client"

import { useState } from "react"
import { Search, Download, Truck, AlertCircle, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/currency"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"

const MOCK_SUPPLIERS = [
  { id: '1', name: 'Motul Bangladesh Ltd (Alliance Lubricants)', phone: '02-9887766', totalPurchased: 28000000, totalPaid: 28000000, totalDue: 0, lastTransaction: '2026-09-11' },
  { id: '2', name: 'Yamaha Genuine Parts (ACI Motors Ltd)', phone: '01711-445566', totalPurchased: 15500000, totalPaid: 10000000, totalDue: 5500000, lastTransaction: '2026-09-09' },
  { id: '3', name: 'Brembo Racing BD Distributors', phone: '02-8833221', totalPurchased: 9200000, totalPaid: 9200000, totalDue: 0, lastTransaction: '2026-08-28' },
  { id: '4', name: 'KYT Helmets & Gear Bangladesh', phone: '01812-556677', totalPurchased: 6700000, totalPaid: 4000000, totalDue: 2700000, lastTransaction: '2026-09-05' },
  { id: '5', name: 'NGK Spark Plugs Official BD', phone: '01912-332211', totalPurchased: 4500000, totalPaid: 4500000, totalDue: 0, lastTransaction: '2026-09-01' },
]

export default function SupplierLedgerPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")

  const filtered = MOCK_SUPPLIERS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  )

  const totalDue = MOCK_SUPPLIERS.reduce((acc, s) => acc + s.totalDue, 0)

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(s => ({
      "Supplier Name": s.name,
      Phone: s.phone,
      "Total Purchased (BDT)": s.totalPurchased / 100,
      "Total Paid (BDT)": s.totalPaid / 100,
      "Outstanding Payable (BDT)": s.totalDue / 100,
      "Last Transaction": s.lastTransaction,
    }))
    exportToCsv("rangpur_bike_supplier_ledger.csv", rows)
    toast({
      title: "Supplier Ledger Exported",
      description: `Exported ${filtered.length} supplier vendor records to CSV.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Supplier Ledger</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Payables
            </span>
          </div>
          <p className="text-surface-400 mt-1">Outstanding payables and purchase history per OEM supplier for Rangpur Bike Parlour</p>
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

      {totalDue > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Total outstanding supplier payables: <span className="font-bold font-mono">{formatCurrency(totalDue)}</span></p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/20"><Truck className="w-5 h-5 text-orange-400" /></div>
          <div>
            <p className="text-surface-400 text-xs">Total Suppliers</p>
            <p className="text-2xl font-bold text-white">{MOCK_SUPPLIERS.length}</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl">
          <p className="text-surface-400 text-xs">Total Purchased</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(MOCK_SUPPLIERS.reduce((s, c) => s + c.totalPurchased, 0))}</p>
        </div>
        <div className="glass-panel p-5 rounded-xl">
          <p className="text-surface-400 text-xs">Total Payable</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{formatCurrency(totalDue)}</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="p-4 border-b border-surface-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 text-white focus-visible:ring-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Total Purchased</th>
                <th className="px-6 py-4 text-right">Total Paid</th>
                <th className="px-6 py-4 text-right">Outstanding Due</th>
                <th className="px-6 py-4 text-center">Last Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{s.name}</td>
                  <td className="px-6 py-4 text-surface-300 font-mono text-xs">{s.phone}</td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-white">{formatCurrency(s.totalPurchased)}</td>
                  <td className="px-6 py-4 text-right font-mono text-green-400 font-medium">{formatCurrency(s.totalPaid)}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold">
                    <span className={s.totalDue > 0 ? "text-orange-400" : "text-surface-400"}>
                      {formatCurrency(s.totalDue)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs text-surface-400">{s.lastTransaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
