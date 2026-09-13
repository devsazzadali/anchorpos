"use client"

import { useState } from "react"
import { Download, Filter, Receipt, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"

const MOCK_TAX_DATA = [
  { period: "September 2026", salesTax: 890000, purchaseTax: 540000, netTax: 350000 },
  { period: "August 2026", salesTax: 1200000, purchaseTax: 720000, netTax: 480000 },
  { period: "July 2026", salesTax: 950000, purchaseTax: 610000, netTax: 340000 },
  { period: "June 2026", salesTax: 780000, purchaseTax: 490000, netTax: 290000 },
]

export default function TaxReportPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("year")

  const totals = MOCK_TAX_DATA.reduce(
    (acc, r) => ({ salesTax: acc.salesTax + r.salesTax, purchaseTax: acc.purchaseTax + r.purchaseTax, netTax: acc.netTax + r.netTax }),
    { salesTax: 0, purchaseTax: 0, netTax: 0 }
  )

  const handleExportCsv = () => {
    playClick()
    const rows = MOCK_TAX_DATA.map(t => ({
      Period: t.period,
      "Sales VAT Collected (BDT)": t.salesTax,
      "Purchase VAT Paid (BDT)": t.purchaseTax,
      "Net Tax Payable (BDT)": t.netTax,
    }))
    exportToCsv("rangpur_bike_tax_report.csv", rows)
    toast({
      title: "Tax Report Exported",
      description: "NBR Tax & VAT breakdown downloaded to CSV.",
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Tax Report</h2>
          <p className="text-surface-400 mt-1">Tax collected on sales and paid on purchases for Rangpur Bike Parlour</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] bg-surface-900 border-surface-700 text-white">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-surface-800 border-surface-700 text-white">
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
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
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-blue-500">
          <p className="text-surface-400 text-sm font-medium">Tax Collected (Sales)</p>
          <p className="text-3xl font-display font-bold text-blue-400 mt-2">{formatCurrency(totals.salesTax)}</p>
          <p className="text-surface-400 text-xs mt-2">Liability — payable to authority</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-orange-500">
          <p className="text-surface-400 text-sm font-medium">Tax Paid (Purchases)</p>
          <p className="text-3xl font-display font-bold text-orange-400 mt-2">{formatCurrency(totals.purchaseTax)}</p>
          <p className="text-surface-400 text-xs mt-2">Input tax credit claimable</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-red-500">
          <p className="text-surface-400 text-sm font-medium">Net Tax Payable</p>
          <p className="text-3xl font-display font-bold text-red-400 mt-2">{formatCurrency(totals.netTax)}</p>
          <p className="text-surface-400 text-xs mt-2">Collected minus paid</p>
        </div>
      </div>

      {/* Tax Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b border-surface-800 flex items-center gap-3">
          <Receipt className="w-5 h-5 text-brand-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Monthly Tax Breakdown</h3>
            <p className="text-surface-400 text-sm">Period-by-period tax summary</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">Period</th>
                <th className="px-6 py-4 font-medium text-right">Tax on Sales</th>
                <th className="px-6 py-4 font-medium text-right">Tax on Purchases</th>
                <th className="px-6 py-4 font-medium text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {MOCK_TAX_DATA.map((row) => (
                <tr key={row.period} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{row.period}</td>
                  <td className="px-6 py-4 text-right font-mono text-blue-400">{formatCurrency(row.salesTax)}</td>
                  <td className="px-6 py-4 text-right font-mono text-orange-400">{formatCurrency(row.purchaseTax)}</td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-red-400">{formatCurrency(row.netTax)}</td>
                </tr>
              ))}
              <tr className="bg-surface-800/30 font-bold border-t-2 border-surface-700">
                <td className="px-6 py-4 text-white">Total</td>
                <td className="px-6 py-4 text-right font-mono text-blue-400">{formatCurrency(totals.salesTax)}</td>
                <td className="px-6 py-4 text-right font-mono text-orange-400">{formatCurrency(totals.purchaseTax)}</td>
                <td className="px-6 py-4 text-right font-mono text-red-400">{formatCurrency(totals.netTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
