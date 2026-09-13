"use client"

import { useState } from "react"
import { ArrowUpRight, ArrowDownLeft, Printer, Download, Calendar, Activity, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"


export default function CashFlowPage() {
  const [period, setPeriod] = useState("2026-FY")

  // Live documented amounts:
  // Inflow from Sales: ৳ 25,160.00
  // Outflow for Purchases: ৳ 38,120.00
  // Outflow for Expenses: ৳ 500.00
  const salesInflow = 25160.00
  const purchasesOutflow = 38120.00
  const expensesOutflow = 500.00
  const netOperating = salesInflow - (purchasesOutflow + expensesOutflow)

  const ownerCapitalInjection = 38620.00 // Working capital provided by owner
  const toolingOutflow = 0.00
  const netFinancing = ownerCapitalInjection

  const openingBalance = 0.00
  const netChangeInCash = netOperating + netFinancing
  const closingBalance = openingBalance + netChangeInCash // Exactly ৳ 25,160.00

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Cash Flow Statement</h2>
          <p className="text-surface-400 mt-1">
            Cash inflows and outflows analysis for Rangpur Bike Parlour (BL0001)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-surface-900 border border-surface-700 text-surface-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="2026-FY">Current Fiscal Year (2026)</option>
            <option value="2026-09">September 2026</option>
          </select>

          <Button 
            variant="outline" 
            onClick={() => {
              playClick()
              exportToCsv("Cash_Flow_Rangpur_Bike_Parlour", [
                { header: "Activity Category", key: "category" },
                { header: "Description", key: "desc" },
                { header: "Amount (BDT)", key: "amount" },
              ], [
                { category: "Operating Inflows", desc: "Customer Receipts (Sales)", amount: salesInflow },
                { category: "Operating Outflows", desc: "Inventory Purchases", amount: -purchasesOutflow },
                { category: "Operating Outflows", desc: "Operating & Office Expenses", amount: -expensesOutflow },
                { category: "Financing Inflows", desc: "Owner Capital Contribution", amount: ownerCapitalInjection },
                { category: "Summary", desc: "Net Cash In Hand", amount: closingBalance },
              ])
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-surface-400">Total Cash Inflows</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            ৳ {(salesInflow + ownerCapitalInjection).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-surface-400 mt-1">Sales + Owner Working Capital</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-surface-400">Total Cash Outflows</span>
            <ArrowUpRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-2">
            ৳ {(purchasesOutflow + expensesOutflow).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-surface-400 mt-1">Inventory purchases & expenses</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-surface-400">Net Closing Cash</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            ৳ {closingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-brand-400 mt-1">Cash drawer balance</div>
        </div>
      </div>

      {/* Cash Flow Statement Details */}
      <div className="glass-panel p-6 rounded-xl border border-surface-800 space-y-6">
        {/* Section 1: Operating */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-surface-800 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400">
              1. Cash Flows from Operating Activities
            </h3>
            <span className="text-xs font-mono text-surface-400">BDT (৳)</span>
          </div>

          <div className="space-y-2 text-sm pl-3">
            <div className="flex justify-between items-center">
              <span className="text-surface-300">Cash Receipts from Customers (Sales Invoices)</span>
              <span className="font-mono text-emerald-400 font-semibold">+ ৳ {salesInflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-surface-300">Cash Paid to Suppliers (Purchase Order PO2026/0001)</span>
              <span className="font-mono text-red-400 font-semibold">- ৳ {purchasesOutflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-surface-300">Cash Paid for Operational Expenses (EXP2026/0001)</span>
              <span className="font-mono text-red-400 font-semibold">- ৳ {expensesOutflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-surface-800/60 font-semibold text-sm">
            <span className="text-surface-200">Net Cash from Operating Activities:</span>
            <span className="font-mono text-amber-400">
              - ৳ {Math.abs(netOperating).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Section 2: Financing */}
        <div className="space-y-3 pt-4 border-t border-surface-800">
          <div className="flex justify-between items-center border-b border-surface-800 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
              2. Cash Flows from Financing Activities
            </h3>
            <span className="text-xs font-mono text-surface-400">BDT (৳)</span>
          </div>

          <div className="space-y-2 text-sm pl-3">
            <div className="flex justify-between items-center">
              <span className="text-surface-300">Owner Working Capital Injection</span>
              <span className="font-mono text-emerald-400 font-semibold">+ ৳ {ownerCapitalInjection.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-surface-800/60 font-semibold text-sm">
            <span className="text-surface-200">Net Cash from Financing Activities:</span>
            <span className="font-mono text-emerald-400">
              + ৳ {netFinancing.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Summary Reconciliation */}
        <div className="pt-6 border-t-2 border-surface-700 space-y-2 bg-surface-900/50 p-4 rounded-xl">
          <div className="flex justify-between items-center text-sm">
            <span className="text-surface-400">Cash & Cash Equivalents at Beginning of Period:</span>
            <span className="font-mono text-white">৳ 0.00</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-surface-400">Net Increase in Cash:</span>
            <span className="font-mono text-emerald-400 font-semibold">+ ৳ {netChangeInCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-surface-800 text-base font-bold">
            <span className="text-white uppercase tracking-wider">Cash & Cash Equivalents at End of Period:</span>
            <span className="font-mono text-brand-400 text-lg">
              ৳ {closingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
