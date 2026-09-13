"use client"

import { useState } from "react"
import { FileText, Printer, Download, Search, Filter, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"


interface AccountTransaction {
  id: string
  date: string
  type: "Sale" | "Purchase" | "Expense" | "Deposit"
  reference: string
  description: string
  debit: number
  credit: number
  balance: number
}

const TRANSACTIONS: AccountTransaction[] = [
  {
    id: "TX-01",
    date: "2026-09-10",
    type: "Deposit",
    reference: "CAP-001",
    description: "Owner Working Capital Contribution",
    debit: 38620.00,
    credit: 0,
    balance: 38620.00
  },
  {
    id: "TX-02",
    date: "2026-09-10",
    type: "Purchase",
    reference: "PO2026/0001",
    description: "Inventory purchase from Standard Bike Supply",
    debit: 0,
    credit: 38120.00,
    balance: 500.00
  },
  {
    id: "TX-03",
    date: "2026-09-11",
    type: "Expense",
    reference: "EXP2026/0001",
    description: "Office Supplies and consumables",
    debit: 0,
    credit: 500.00,
    balance: 0.00
  },
  {
    id: "TX-04",
    date: "2026-09-12",
    type: "Sale",
    reference: "INV-2026-0001",
    description: "Counter sale to Walk-In Customer",
    debit: 15000.00,
    credit: 0,
    balance: 15000.00
  },
  {
    id: "TX-05",
    date: "2026-09-13",
    type: "Sale",
    reference: "INV-2026-0002",
    description: "Counter sale to Walk-In Customer",
    debit: 10160.00,
    credit: 0,
    balance: 25160.00
  }
]

export default function PaymentAccountReportPage() {
  const [selectedAccount, setSelectedAccount] = useState("Cash in Hand (Counter)")
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = TRANSACTIONS.filter(t => 
    t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalDebit = TRANSACTIONS.reduce((sum, t) => sum + t.debit, 0)
  const totalCredit = TRANSACTIONS.reduce((sum, t) => sum + t.credit, 0)

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Payment Account Report</h2>
          <p className="text-surface-400 mt-1">
            Transaction history and running balance statement for Rangpur Bike Parlour
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              playClick()
              exportToCsv("Account_Transactions_Rangpur_Bike_Parlour", [
                { header: "Transaction ID", key: "id" },
                { header: "Date", key: "date" },
                { header: "Type", key: "type" },
                { header: "Reference", key: "reference" },
                { header: "Description", key: "description" },
                { header: "Debit (BDT)", key: "debit" },
                { header: "Credit (BDT)", key: "credit" },
                { header: "Running Balance (BDT)", key: "balance" },
              ], TRANSACTIONS)
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

      {/* Account Selector Card */}
      <div className="glass-panel p-6 rounded-xl border border-surface-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-surface-400 tracking-wider">Active Account</span>
          <div className="flex items-center gap-3">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-surface-900 border border-surface-700 text-white font-bold rounded-lg px-3 py-2 text-base focus:outline-none focus:border-brand-500"
            >
              <option value="Cash in Hand (Counter)">Cash in Hand (Counter Drawer)</option>
              <option value="City Bank Current A/C">City Bank A/C: 1102938475</option>
              <option value="bKash Merchant">bKash Merchant: 01711-000000</option>
            </select>
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-semibold">
              Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-surface-400 font-medium">Total Inflow (Debit)</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              ৳ {totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-xs text-surface-400 font-medium">Total Outflow (Credit)</div>
            <div className="text-lg font-bold font-mono text-red-400">
              ৳ {totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-xs text-surface-400 font-medium">Current Balance</div>
            <div className="text-xl font-bold font-mono text-brand-400">
              ৳ 25,160.00
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 rounded-xl flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by reference, description, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Transaction Type</th>
                <th className="px-6 py-4">Reference No</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Debit / In (৳)</th>
                <th className="px-6 py-4 text-right">Credit / Out (৳)</th>
                <th className="px-6 py-4 text-right">Running Balance (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      tx.type === "Sale" || tx.type === "Deposit"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                        : "bg-red-950/40 text-red-400 border border-red-800/40"
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-white">{tx.reference}</td>
                  <td className="px-6 py-4 text-xs text-surface-300">{tx.description}</td>
                  <td className="px-6 py-4 text-right font-mono text-emerald-400">
                    {tx.debit > 0 ? `৳ ${tx.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-red-400">
                    {tx.credit > 0 ? `৳ ${tx.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-white">
                    ৳ {tx.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
