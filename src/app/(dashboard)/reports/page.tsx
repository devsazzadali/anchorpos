"use client"

import Link from "next/link"
import { BarChart2, TrendingUp, Receipt, Users, Truck, Package, Activity, UserCheck } from "lucide-react"

const REPORTS = [
  { name: "Profit & Loss", href: "/reports/profit-loss", icon: BarChart2, desc: "Revenue, COGS, expenses, and net profit", color: "brand" },
  { name: "Purchase & Sale", href: "/reports/purchase-sell", icon: TrendingUp, desc: "Side-by-side comparison of purchases vs sales", color: "orange" },
  { name: "Tax Report", href: "/reports/tax", icon: Receipt, desc: "VAT collected on sales and paid on purchases", color: "blue" },
  { name: "Customer Ledger", href: "/reports/customers", icon: Users, desc: "Invoiced, paid, and outstanding per customer", color: "green" },
  { name: "Supplier Ledger", href: "/reports/suppliers", icon: Truck, desc: "Purchased, paid, and payable per supplier", color: "yellow" },
  { name: "Stock Report", href: "/reports/stock", icon: Package, desc: "Inventory levels, valuations, and low-stock", color: "purple" },
  { name: "Trending Products", href: "/reports/trending", icon: TrendingUp, desc: "Top and bottom sellers by qty and revenue", color: "pink" },
  { name: "Sales Rep Report", href: "/reports/sales-rep", icon: UserCheck, desc: "Sales and commission per representative", color: "cyan" },
  { name: "Activity Log", href: "/reports/activity", icon: Activity, desc: "Full audit trail of all system actions", color: "red" },
]

const COLOR_MAP: Record<string, { bg: string; icon: string }> = {
  brand: { bg: "bg-brand-500/15", icon: "text-brand-400" },
  orange: { bg: "bg-orange-500/15", icon: "text-orange-400" },
  blue: { bg: "bg-blue-500/15", icon: "text-blue-400" },
  green: { bg: "bg-green-500/15", icon: "text-green-400" },
  yellow: { bg: "bg-yellow-500/15", icon: "text-yellow-400" },
  purple: { bg: "bg-purple-500/15", icon: "text-purple-400" },
  pink: { bg: "bg-pink-500/15", icon: "text-pink-400" },
  cyan: { bg: "bg-cyan-500/15", icon: "text-cyan-400" },
  red: { bg: "bg-red-500/15", icon: "text-red-400" },
}

export default function ReportsIndexPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">Reports & Analytics</h2>
        <p className="text-surface-400 mt-1">Comprehensive business intelligence and financial insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORTS.map((report) => {
          const Icon = report.icon
          const colors = COLOR_MAP[report.color] ?? COLOR_MAP.brand
          return (
            <Link
              key={report.name}
              href={report.href}
              className="glass-panel rounded-xl p-5 flex items-start gap-4 hover:bg-surface-800/50 transition-all group hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <div className={`p-3 rounded-xl ${colors.bg} shrink-0`}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">{report.name}</h3>
                <p className="text-surface-400 text-sm mt-1 leading-relaxed">{report.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
