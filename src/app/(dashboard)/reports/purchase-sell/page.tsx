"use client"

import { useState } from "react"
import { Download, Filter, ShoppingCart, PackageOpen, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"

const MOCK_DATA = [
  { period: "Sep 7", purchases: 3200000, sales: 4800000 },
  { period: "Sep 8", purchases: 2800000, sales: 5200000 },
  { period: "Sep 9", purchases: 4100000, sales: 3900000 },
  { period: "Sep 10", purchases: 3500000, sales: 6100000 },
  { period: "Sep 11", purchases: 2900000, sales: 4700000 },
  { period: "Sep 12", purchases: 5200000, sales: 7300000 },
  { period: "Sep 13", purchases: 3700000, sales: 5800000 },
]

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-lg border border-surface-700 text-sm">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function PurchaseSellReportPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("week")

  const totals = MOCK_DATA.reduce(
    (acc, row) => ({ purchases: acc.purchases + row.purchases, sales: acc.sales + row.sales }),
    { purchases: 0, sales: 0 }
  )

  const handleExportCsv = () => {
    playClick()
    const rows = MOCK_DATA.map(d => ({
      Period: d.period,
      "Purchases (BDT)": d.purchases,
      "Sales (BDT)": d.sales,
      "Net Margin (BDT)": d.sales - d.purchases,
    }))
    exportToCsv("rangpur_bike_purchase_vs_sales.csv", rows)
    toast({
      title: "Report Exported",
      description: "Purchase vs Sales comparative data exported to CSV.",
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Purchase &amp; Sale Report</h2>
          <p className="text-surface-400 mt-1">Side-by-side comparison of purchases vs sales for Rangpur Bike Parlour</p>
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
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { playClick(); window.print() }} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={handleExportCsv} className="bg-surface-800 border border-surface-700 hover:bg-surface-700 text-white">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-orange-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><PackageOpen className="w-16 h-16" /></div>
          <p className="text-surface-400 text-sm font-medium">Total Purchases</p>
          <p className="text-3xl font-display font-bold text-orange-400 mt-2">{formatCurrency(totals.purchases)}</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-brand-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingCart className="w-16 h-16" /></div>
          <p className="text-surface-400 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-display font-bold text-brand-400 mt-2">{formatCurrency(totals.sales)}</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-green-500">
          <p className="text-surface-400 text-sm font-medium">Net Difference</p>
          <p className="text-3xl font-display font-bold text-green-400 mt-2">
            {formatCurrency(totals.sales - totals.purchases)}
          </p>
          <p className="text-green-400/70 text-sm mt-1">Sales over Purchases</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b border-surface-800">
          <h3 className="text-lg font-bold text-white">Daily Comparison</h3>
          <p className="text-surface-400 text-sm">Purchases vs Sales per day</p>
        </div>
        <div className="p-6" style={{ height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282c40" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: "#6b7190", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7190", fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `৳${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend wrapperStyle={{ color: "#9da2b8", fontSize: 13 }} />
              <Bar dataKey="purchases" name="Purchases" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sales" name="Sales" fill="#5a67f5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b border-surface-800">
          <h3 className="text-lg font-bold text-white">Period Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">Period</th>
                <th className="px-6 py-4 font-medium text-right">Purchases</th>
                <th className="px-6 py-4 font-medium text-right">Sales</th>
                <th className="px-6 py-4 font-medium text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {MOCK_DATA.map((row) => {
                const diff = row.sales - row.purchases
                return (
                  <tr key={row.period} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{row.period}</td>
                    <td className="px-6 py-4 text-right font-mono text-orange-400">{formatCurrency(row.purchases)}</td>
                    <td className="px-6 py-4 text-right font-mono text-brand-400">{formatCurrency(row.sales)}</td>
                    <td className={`px-6 py-4 text-right font-mono font-medium ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-surface-800/30 font-bold border-t-2 border-surface-700">
                <td className="px-6 py-4 text-white">Total</td>
                <td className="px-6 py-4 text-right font-mono text-orange-400">{formatCurrency(totals.purchases)}</td>
                <td className="px-6 py-4 text-right font-mono text-brand-400">{formatCurrency(totals.sales)}</td>
                <td className="px-6 py-4 text-right font-mono text-green-400">{formatCurrency(totals.sales - totals.purchases)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
