"use client"

import { useState } from "react"
import { Search, Download, UserCheck, Printer, Award, DollarSign, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

interface SalesRepData {
  id: string
  name: string
  role: string
  phone: string
  email: string
  totalSales: number
  totalRevenue: number
  commissionRate: number
  commission: number
  status: "Active" | "On Leave"
}

const MOCK_SALES_REPS: SalesRepData[] = [
  { 
    id: '1', 
    name: 'Rahim Ahmed', 
    role: 'Lead Technician & Engine Specialist',
    phone: '+880 1711-234567',
    email: 'rahim@rangpurbikeparlour.com', 
    totalSales: 28, 
    totalRevenue: 1560000, // ৳ 15,600.00 in paise
    commissionRate: 3.5, 
    commission: 54600, // ৳ 546.00 in paise
    status: 'Active'
  },
  { 
    id: '2', 
    name: 'Karim Hassan', 
    role: 'Spare Parts & Accessories Sales Rep',
    phone: '+880 1812-345678',
    email: 'karim@rangpurbikeparlour.com', 
    totalSales: 19, 
    totalRevenue: 956000, 
    commissionRate: 3.0, 
    commission: 28680, 
    status: 'Active'
  },
  { 
    id: '3', 
    name: 'Nadia Islam', 
    role: 'Workshop Service Advisor',
    phone: '+880 1913-456789',
    email: 'nadia@rangpurbikeparlour.com', 
    totalSales: 34, 
    totalRevenue: 1840000, 
    commissionRate: 4.0, 
    commission: 73600, 
    status: 'Active'
  },
  { 
    id: '4', 
    name: 'Salim Chowdhury', 
    role: 'Brake & Suspension Specialist',
    phone: '+880 1614-567890',
    email: 'salim@rangpurbikeparlour.com', 
    totalSales: 12, 
    totalRevenue: 520000, 
    commissionRate: 3.0, 
    commission: 15600, 
    status: 'Active'
  },
]

export default function SalesRepReportPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState("month")

  const filtered = MOCK_SALES_REPS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalCommission = MOCK_SALES_REPS.reduce((s, r) => s + r.commission, 0)
  const totalRevenue = MOCK_SALES_REPS.reduce((s, r) => s + r.totalRevenue, 0)
  const totalSalesCount = MOCK_SALES_REPS.reduce((s, r) => s + r.totalSales, 0)

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Sales_Representative_Report_Rangpur_Bike_Parlour", [
      { header: "Representative Name", key: "name" },
      { header: "Specialization / Role", key: "role" },
      { header: "Phone", key: "phone" },
      { header: "Email", key: "email" },
      { header: "Completed Invoices", key: "totalSales" },
      { header: "Total Revenue (Paise)", key: "totalRevenue" },
      { header: "Commission Rate (%)", key: "commissionRate" },
      { header: "Commission Earned (Paise)", key: "commission" },
      { header: "Status", key: "status" }
    ], filtered)
    toast({
      title: "Report Exported",
      description: "Sales representative performance downloaded as CSV."
    })
  }

  const handlePrint = () => {
    playClick()
    printCurrentWindow()
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Sales Representative Report</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Rangpur Bike Parlour
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Service technician commissions and parts sales rep performance tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-surface-900 border-surface-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-800 border-surface-700 text-white">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline"
            onClick={handleExportCSV} 
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2 text-brand-400" /> Export CSV
          </Button>

          <Button 
            variant="outline"
            onClick={handlePrint}
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <Printer className="w-4 h-4 mr-2 text-blue-400" /> Print
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl flex items-center gap-4 border border-surface-800">
          <div className="p-3 rounded-xl bg-brand-500/20"><UserCheck className="w-5 h-5 text-brand-400" /></div>
          <div>
            <p className="text-surface-400 text-xs uppercase font-semibold">Active Agents</p>
            <p className="text-2xl font-bold text-white mt-0.5">{MOCK_SALES_REPS.length}</p>
            <p className="text-[11px] text-surface-500">Rangpur Workshop & Sales</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <p className="text-surface-400 text-xs uppercase font-semibold">Total Invoices</p>
            <Award className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{totalSalesCount}</p>
          <p className="text-[11px] text-surface-500">Service jobs completed</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <p className="text-surface-400 text-xs uppercase font-semibold">Attributed Revenue</p>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-[11px] text-surface-500">Gross parts & labor billing</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-surface-800">
          <div className="flex items-center justify-between">
            <p className="text-surface-400 text-xs uppercase font-semibold">Total Commission</p>
            <DollarSign className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-yellow-400 mt-1">{formatCurrency(totalCommission)}</p>
          <p className="text-[11px] text-surface-500">Payable to staff</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="p-4 border-b border-surface-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              placeholder="Search representative by name, role, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 text-white placeholder-surface-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Representative</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4 text-right"># Jobs / Sales</th>
                <th className="px-6 py-4 text-right">Generated Revenue</th>
                <th className="px-6 py-4 text-right">Commission Rate</th>
                <th className="px-6 py-4 text-right">Commission Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="text-xs text-surface-400 font-mono">{r.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-surface-800 text-surface-300 text-xs border border-surface-700">
                      {r.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white font-medium">{r.totalSales}</td>
                  <td className="px-6 py-4 text-right font-mono text-emerald-400 font-bold">{formatCurrency(r.totalRevenue)}</td>
                  <td className="px-6 py-4 text-right text-surface-300 font-mono font-medium">{r.commissionRate}%</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-yellow-400">{formatCurrency(r.commission)}</td>
                </tr>
              ))}
              <tr className="bg-surface-900/90 font-bold border-t-2 border-surface-700">
                <td className="px-6 py-4 text-white" colSpan={2}>Grand Total</td>
                <td className="px-6 py-4 text-right text-white font-mono">{totalSalesCount}</td>
                <td className="px-6 py-4 text-right font-mono text-emerald-400">{formatCurrency(totalRevenue)}</td>
                <td className="px-6 py-4 text-right text-surface-400 font-mono">Avg 3.4%</td>
                <td className="px-6 py-4 text-right font-mono text-yellow-400">{formatCurrency(totalCommission)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
