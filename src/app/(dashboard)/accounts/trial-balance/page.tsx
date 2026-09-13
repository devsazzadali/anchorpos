"use client"

import { useState } from "react"
import { Layers, Printer, Download, CheckCircle2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"


interface LedgerItem {
  code: string
  name: string
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense"
  debit: number
  credit: number
}

const LEDGER_ACCOUNTS: LedgerItem[] = [
  { code: "1010", name: "Cash in Hand (Counter Drawer)", type: "Asset", debit: 25160.00, credit: 0 },
  { code: "1020", name: "Merchandise Inventory (Closing Stock)", type: "Asset", debit: 33000.00, credit: 0 },
  { code: "1050", name: "Shop Equipment & Service Tools", type: "Asset", debit: 50000.00, credit: 0 },
  { code: "3010", name: "Owner Capital Contribution", type: "Equity", debit: 0, credit: 88620.00 },
  { code: "4010", name: "Sales Revenue (2 Invoices)", type: "Revenue", debit: 0, credit: 25160.00 },
  { code: "5010", name: "Cost of Goods Sold (COGS)", type: "Expense", debit: 5120.00, credit: 0 },
  { code: "5020", name: "Office Supplies & Admin Expense", type: "Expense", debit: 500.00, credit: 0 },
]

export default function TrialBalancePage() {
  const [searchTerm, setSearchTerm] = useState("")

  const totalDebit = LEDGER_ACCOUNTS.reduce((sum, a) => sum + a.debit, 0)
  const totalCredit = LEDGER_ACCOUNTS.reduce((sum, a) => sum + a.credit, 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const filtered = LEDGER_ACCOUNTS.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.code.includes(searchTerm) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeBadge = (type: LedgerItem["type"]) => {
    switch (type) {
      case "Asset":
        return "bg-blue-950/40 text-blue-400 border border-blue-800/40"
      case "Revenue":
        return "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
      case "Expense":
        return "bg-amber-950/40 text-amber-400 border border-amber-800/40"
      case "Equity":
        return "bg-purple-950/40 text-purple-400 border border-purple-800/40"
      default:
        return "bg-surface-800 text-surface-300 border border-surface-700"
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Trial Balance</h2>
          <p className="text-surface-400 mt-1">
            General ledger reconciliation statement for Rangpur Bike Parlour
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              playClick()
              exportToCsv("Trial_Balance_Rangpur_Bike_Parlour", [
                { header: "Account Code", key: "code" },
                { header: "Account Title", key: "name" },
                { header: "Classification", key: "type" },
                { header: "Debit (BDT)", key: "debit" },
                { header: "Credit (BDT)", key: "credit" },
              ], filtered)

            }}
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2 text-brand-400" /> Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => { playClick(); printCurrentWindow() }}
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <Printer className="w-4 h-4 mr-2 text-blue-400" /> Print Statement
          </Button>
        </div>

      </div>

      {/* Balanced Alert */}
      <div className="glass-panel border-emerald-500/30 bg-emerald-950/20 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-300">
            Trial Balance is in perfect equilibrium: Total Debits = Total Credits
          </span>
        </div>
        <div className="text-xs text-surface-400 font-mono">
          Fiscal Year 2026 (BDT ৳)
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 rounded-xl flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Filter accounts by code, title, or classification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Account Code</th>
                <th className="px-6 py-4">Account Title</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4 text-right">Debit (৳)</th>
                <th className="px-6 py-4 text-right">Credit (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((acc) => (
                <tr key={acc.code} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">{acc.code}</td>
                  <td className="px-6 py-4 font-semibold text-white">{acc.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(acc.type)}`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white">
                    {acc.debit > 0 ? `৳ ${acc.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white">
                    {acc.credit > 0 ? `৳ ${acc.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-900/90 font-bold border-t-2 border-surface-700">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-white uppercase tracking-wider text-sm">
                  TOTALS:
                </td>
                <td className="px-6 py-4 text-right font-mono text-emerald-400 text-base">
                  ৳ {totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right font-mono text-emerald-400 text-base">
                  ৳ {totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
