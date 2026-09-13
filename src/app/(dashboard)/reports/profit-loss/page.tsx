"use client"

import { useState } from "react"
import { Printer, Download, Filter, TrendingUp, TrendingDown, DollarSign, Activity, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"

export default function ProfitLossReportPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("all")

  // Exact live data from Rangpur Bike Parlour (databyte_pos_documentation.md)
  const summary = {
    totalSales: 2516000,
    totalReturns: 0,
    netSales: 2516000,
    cogs: 512000,
    grossProfit: 2004000,
    totalExpenses: 50000,
    netProfit: 1954000,
    closingStockCost: 3300000,
    closingStockSell: 3960000,
    marginPct: 77.6,
  }

  const handleExportCsv = () => {
    playClick()
    const rows = [
      { Metric: "Total Gross Sales (BDT)", Value: summary.totalSales },
      { Metric: "Total Returns (BDT)", Value: summary.totalReturns },
      { Metric: "Net Sales (BDT)", Value: summary.netSales },
      { Metric: "Cost of Goods Sold (COGS)", Value: summary.cogs },
      { Metric: "Gross Profit (BDT)", Value: summary.grossProfit },
      { Metric: "Operating Expenses (BDT)", Value: summary.totalExpenses },
      { Metric: "Net Operating Profit (BDT)", Value: summary.netProfit },
      { Metric: "Closing Stock at Cost (BDT)", Value: summary.closingStockCost },
      { Metric: "Closing Stock at Sell (BDT)", Value: summary.closingStockSell },
      { Metric: "Gross Margin %", Value: `${summary.marginPct}%` },
    ]
    exportToCsv("rangpur_bike_profit_loss_report.csv", rows)
    toast({
      title: "P&L Report Exported",
      description: "Financial summary downloaded as CSV.",
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Profit &amp; Loss Report</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Rangpur Bike Parlour
            </span>
          </div>
          <p className="text-surface-400 mt-1">Live financial performance and ledger audit</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] bg-surface-900 border-surface-700 text-white">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-surface-800 border-surface-700 text-white">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => { playClick(); window.print() }} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={handleExportCsv} className="bg-surface-800 border-surface-700 hover:bg-surface-700 text-white">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-blue-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-16 h-16" /></div>
          <p className="text-surface-400 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-display font-bold text-white mt-2">{formatCurrency(summary.netSales)}</p>
          <p className="text-surface-400 text-xs mt-1">2 invoices (All Paid)</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-orange-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown className="w-16 h-16" /></div>
          <p className="text-surface-400 text-sm font-medium">Cost of Goods Sold (COGS)</p>
          <p className="text-3xl font-display font-bold text-white mt-2">{formatCurrency(summary.cogs)}</p>
          <p className="text-surface-400 text-xs mt-1">Direct inventory cost</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-brand-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-16 h-16" /></div>
          <p className="text-surface-400 text-sm font-medium">Gross Profit</p>
          <p className="text-3xl font-display font-bold text-white mt-2">{formatCurrency(summary.grossProfit)}</p>
          <p className="text-brand-400 text-sm mt-1 font-medium">{summary.marginPct}% Gross Margin</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-green-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16" /></div>
          <p className="text-surface-400 text-sm font-medium">Net Profit</p>
          <p className="text-3xl font-display font-bold text-green-400 mt-2">{formatCurrency(summary.netProfit)}</p>
          <p className="text-green-400 text-xs mt-1">After ৳500.00 expenses</p>
        </div>
      </div>

      {/* Stock Valuation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <p className="text-surface-400 text-sm font-medium">Closing Stock (@ purchase price)</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">{formatCurrency(summary.closingStockCost)}</p>
            <p className="text-xs text-surface-400 mt-0.5">Asset balance basis</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-surface-400 text-sm font-medium">Closing Stock (@ selling price)</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">{formatCurrency(summary.closingStockSell)}</p>
            <p className="text-xs text-surface-400 mt-0.5">Estimated realization</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Detailed P&L Statement */}
      <div className="glass-panel rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-surface-800 bg-surface-800/30">
          <h3 className="text-xl font-bold text-white">Profit &amp; Loss Statement</h3>
          <p className="text-surface-400 text-sm">Rangpur Bike Parlour • BDT Currency</p>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-surface-800/50">
              {/* Sales Section */}
              <tr className="bg-surface-900/40">
                <td className="px-6 py-4 font-bold text-white uppercase text-xs tracking-wider" colSpan={2}>Revenue</td>
              </tr>
              <tr className="hover:bg-surface-800/30">
                <td className="px-6 py-3 text-surface-200 pl-10">Total Sales</td>
                <td className="px-6 py-3 text-right font-mono text-white">{formatCurrency(summary.totalSales)}</td>
              </tr>
              <tr className="hover:bg-surface-800/30">
                <td className="px-6 py-3 text-surface-200 pl-10">Less: Sales Returns</td>
                <td className="px-6 py-3 text-right font-mono text-surface-400">৳ 0.00</td>
              </tr>
              <tr className="bg-surface-800/20 font-medium">
                <td className="px-6 py-4 text-white">Net Sales</td>
                <td className="px-6 py-4 text-right font-mono text-white text-base">{formatCurrency(summary.netSales)}</td>
              </tr>

              {/* COGS Section */}
              <tr className="bg-surface-900/40">
                <td className="px-6 py-4 font-bold text-white uppercase text-xs tracking-wider" colSpan={2}>Cost of Goods Sold (COGS)</td>
              </tr>
              <tr className="hover:bg-surface-800/30">
                <td className="px-6 py-3 text-surface-200 pl-10">Opening Stock</td>
                <td className="px-6 py-3 text-right font-mono text-surface-300">৳ 0.00</td>
              </tr>
              <tr className="hover:bg-surface-800/30">
                <td className="px-6 py-3 text-surface-200 pl-10">Total Purchases (PO2026/0001)</td>
                <td className="px-6 py-3 text-right font-mono text-surface-300">৳ 38,120.00</td>
              </tr>
              <tr className="hover:bg-surface-800/30">
                <td className="px-6 py-3 text-surface-200 pl-10">Less: Closing Stock (@ purchase price)</td>
                <td className="px-6 py-3 text-right font-mono text-surface-300">(৳ 33,000.00)</td>
              </tr>
              <tr className="bg-surface-800/20 font-medium">
                <td className="px-6 py-4 text-white">Cost of Goods Sold (COGS)</td>
                <td className="px-6 py-4 text-right font-mono text-orange-400 text-base">{formatCurrency(summary.cogs)}</td>
              </tr>

              {/* Gross Profit */}
              <tr className="bg-surface-800/40 font-bold border-t border-b border-surface-700">
                <td className="px-6 py-4 text-brand-400 text-base">Gross Profit</td>
                <td className="px-6 py-4 text-right font-mono text-brand-400 text-xl">{formatCurrency(summary.grossProfit)}</td>
              </tr>

              {/* Expenses Section */}
              <tr className="bg-surface-900/40">
                <td className="px-6 py-4 font-bold text-white uppercase text-xs tracking-wider" colSpan={2}>Operating Expenses</td>
              </tr>
              <tr className="hover:bg-surface-800/30">
                <td className="px-6 py-3 text-surface-200 pl-10">Office Supplies (EXP2026/0001)</td>
                <td className="px-6 py-3 text-right font-mono text-surface-300">{formatCurrency(50000)}</td>
              </tr>
              <tr className="bg-surface-800/20 font-medium">
                <td className="px-6 py-4 text-white pl-10">Total Expenses</td>
                <td className="px-6 py-4 text-right font-mono text-red-400 border-t border-surface-700">{formatCurrency(summary.totalExpenses)}</td>
              </tr>

              {/* Net Profit Section */}
              <tr className="bg-green-500/10 border-t-2 border-green-500/40">
                <td className="px-6 py-6 font-bold text-green-400 text-xl uppercase tracking-wider">Net Profit</td>
                <td className="px-6 py-6 text-right font-mono font-bold text-green-400 text-3xl">{formatCurrency(summary.netProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
