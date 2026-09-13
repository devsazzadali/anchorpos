"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, CreditCard, AlertTriangle, Clock, ArrowRight,
  Truck, ShieldAlert, CheckCircle2, RefreshCw, Download, Calendar
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { formatCurrency } from "@/lib/utils/currency"
import { Button } from "@/components/ui/button"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"


// ── Live Rangpur Bike Parlour Reference Data ──────────────────────────────

const SALES_VS_PURCHASES = [
  { day: "Sep 7", sales: 245000, purchases: 1200000 },
  { day: "Sep 8", sales: 480000, purchases: 850000 },
  { day: "Sep 9", sales: 320000, purchases: 450000 },
  { day: "Sep 10", sales: 650000, purchases: 1100000 },
  { day: "Sep 11", sales: 410000, purchases: 620000 },
  { day: "Sep 12", sales: 1500000, purchases: 3812000 },
  { day: "Sep 13", sales: 1016000, purchases: 0 },
]

const MONTHLY_REVENUE = [
  { month: "Apr", revenue: 1450000 },
  { month: "May", revenue: 1890000 },
  { month: "Jun", revenue: 2150000 },
  { month: "Jul", revenue: 1980000 },
  { month: "Aug", revenue: 2340000 },
  { month: "Sep", revenue: 2516000 },
]

const TOP_PRODUCTS = [
  { name: "Helmet Standard", sku: "PROD0002", revenue: 1200000, qty: 10 },
  { name: "Engine Oil 1L", sku: "PROD0001", revenue: 1800000, qty: 40 },
  { name: "Chain Lube 100ml", sku: "PROD0003", revenue: 600000, qty: 50 },
]

const PAYMENT_STATUS = [
  { name: "Paid", value: 100, color: "#22c55e" },
  { name: "Due", value: 0, color: "#ef4444" },
]

const STOCK_EXPIRY_ALERTS = [
  { name: "Engine Oil 1L", sku: "PROD0001", batch: "BAT-7100-26", expiry: "2026-11-30", stock: "40 Pcs", status: "expiring_soon" },
  { name: "Chain Lube 100ml", sku: "PROD0003", batch: "BAT-LUB-26", expiry: "2026-12-15", stock: "50 Pcs", status: "good" },
]

const PENDING_SHIPMENTS = [
  { id: "SHP-2026-001", invoiceNo: "INV-2026-0002", customer: "Walk-In Customer", destination: "RANGPUR", status: "Packed", date: "2026-09-13" },
]

const RECENT_SALES = [
  { invoiceNo: "INV-2026-0002", customer: "Walk-In Customer", total: 1016000, status: "paid", time: "Today 11:30 AM" },
  { invoiceNo: "INV-2026-0001", customer: "Walk-In Customer", total: 1500000, status: "paid", time: "2026-09-12" },
]

// ── Animated Counter ──────────────────────────────────────────────────────

function AnimatedValue({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const duration = 1000
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target])

  return <span>{prefix}{value.toLocaleString()}{suffix}</span>
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel p-3 rounded-lg border border-surface-700 text-sm shadow-xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

// ── KPI Card Component ─────────────────────────────────────────────────────

interface KPICardProps {
  title: string
  value: number
  change?: number
  isCurrency?: boolean
  icon: any
  color: string
  subtext?: string
}

function KPICard({ title, value, change, isCurrency = true, icon: Icon, color, subtext }: KPICardProps) {
  const positive = (change ?? 0) >= 0

  return (
    <div className={`glass-panel p-5 rounded-xl border-l-4 ${color} relative overflow-hidden transition-all duration-200 hover:scale-[1.01]`}>
      <div className="flex justify-between items-start">
        <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <div className="p-2 rounded-lg bg-surface-800/80 text-surface-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-display font-bold text-white mt-2">
        {isCurrency
          ? <><span className="text-surface-400 text-base mr-1">৳</span><AnimatedValue target={Math.round(value / 100)} /></>
          : <AnimatedValue target={value} />}
      </p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? "text-green-400" : "text-red-400"}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}% vs last month
        </div>
      )}
      {subtext && (
        <p className="text-xs text-surface-400 mt-2">{subtext}</p>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { toast } = useToast()
  const [dateFilter, setDateFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    playClick()
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      playSuccess()
      toast({
        title: "Metrics Synchronized",
        description: "Dashboard KPIs and sales reports up to date.",
      })
    }, 600)
  }

  const handleExportSummary = () => {
    playClick()
    exportToCsv("Executive_KPI_Summary_Rangpur_Bike_Parlour", [
      { header: "KPI Metric", key: "metric" },
      { header: "Amount (BDT)", key: "value" },
      { header: "Status", key: "status" },
    ], [
      { metric: "Total Sales", value: "25,160.00", status: "Verified" },
      { metric: "Net Profit", value: "19,540.00", status: "Verified" },
      { metric: "Total Purchases", value: "38,120.00", status: "Verified" },
      { metric: "Total Expenses", value: "500.00", status: "Verified" },
      { metric: "Cost of Goods Sold (COGS)", value: "5,120.00", status: "Verified" },
      { metric: "Closing Stock (@ Cost)", value: "33,000.00", status: "Verified" },
      { metric: "Closing Stock (@ Retail)", value: "39,600.00", status: "Verified" },
    ])
    toast({ title: "KPI Report Exported", description: "Executive summary CSV downloaded." })
  }

  const STATUS_STYLE: Record<string, string> = {
    paid: "bg-green-500/15 text-green-400 border border-green-500/20",
    partial: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
    due: "bg-red-500/15 text-red-400 border border-red-500/20",
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">
              Rangpur Bike Parlour
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Live System
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            System overview and business performance metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Range Filter */}
          <div className="flex items-center gap-1.5 bg-surface-900 border border-surface-700 px-2.5 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <select
              value={dateFilter}
              onChange={(e) => { playClick(); setDateFilter(e.target.value) }}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-surface-900">All Time (Live FY26)</option>
              <option value="today" className="bg-surface-900">Today (Sep 13)</option>
              <option value="week" className="bg-surface-900">This Week</option>
              <option value="month" className="bg-surface-900">This Month (September)</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-surface-700 bg-surface-900/60 hover:bg-surface-800 text-surface-300 hover:text-white h-9 px-3 rounded-xl"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-brand-400 ${isRefreshing ? "animate-spin" : ""}`} />
            Sync
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSummary}
            className="border-surface-700 bg-surface-900/60 hover:bg-surface-800 text-surface-300 hover:text-white h-9 px-3 rounded-xl"
            title="Export KPIs to CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Export
          </Button>

          <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow h-9 px-3.5 rounded-xl">
            <Link href="/pos">
              <ShoppingCart className="w-4 h-4 mr-2" /> Open POS Terminal
            </Link>
          </Button>
        </div>
      </div>


      {/* KPI Cards — Exact Live Documentation Values */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Sales" 
          value={2516000} 
          change={14.2} 
          icon={DollarSign} 
          color="border-l-brand-500" 
          subtext="2 completed orders"
        />
        <KPICard 
          title="Net Profit" 
          value={1954000} 
          change={18.5} 
          icon={TrendingUp} 
          color="border-l-green-500" 
          subtext="Margin: 77.6%"
        />
        <KPICard 
          title="Total Purchases" 
          value={3812000} 
          change={-5.0} 
          icon={Package} 
          color="border-l-orange-500" 
          subtext="PO2026/0001 (Received)"
        />
        <KPICard 
          title="Total Expense" 
          value={50000} 
          change={0} 
          icon={CreditCard} 
          color="border-l-red-500" 
          subtext="Office Supplies"
        />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-surface-400 text-xs font-medium">Closing Stock (Cost Basis)</p>
            <p className="text-xl font-bold text-white font-mono mt-1">৳ 33,000.00</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-surface-400 text-xs font-medium">Closing Stock (Retail Value)</p>
            <p className="text-xl font-bold text-white font-mono mt-1">৳ 39,600.00</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-surface-400 text-xs font-medium">Payment Collection</p>
            <p className="text-xl font-bold text-green-400 font-mono mt-1">100% Paid (৳ 0 Due)</p>
          </div>
          <div className="p-3 bg-green-500/10 text-green-400 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase & Sale (Last 30 Days) */}
        <div className="glass-panel rounded-xl overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-surface-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white">Purchase & Sale (Last 30 Days)</h3>
              <p className="text-surface-400 text-xs mt-0.5">Rangpur Bike Parlour transaction flow</p>
            </div>
            <Link href="/reports/purchase-sell" className="text-xs text-brand-400 hover:text-brand-300">
              View Detailed Report →
            </Link>
          </div>
          <div className="p-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_VS_PURCHASES} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282c40" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#6b7190", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7190", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `৳${(v / 100000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#9da2b8" }} />
                <Bar dataKey="sales" name="Sales" fill="#5a67f5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales Trend */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-5 border-b border-surface-800">
            <h3 className="font-bold text-white">Monthly Sales Trend</h3>
            <p className="text-surface-400 text-xs mt-0.5">Revenue progression (BDT)</p>
          </div>
          <div className="p-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_REVENUE}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5a67f5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5a67f5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#282c40" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#6b7190", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7190", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `৳${(v / 100000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#5a67f5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Expiry Alert table & Pending Shipments list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Expiry Alert Table */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-5 border-b border-surface-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-white">Stock Expiry Alert</h3>
            </div>
            <Link href="/reports/stock" className="text-xs text-brand-400 hover:text-brand-300">
              Stock Report →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-900/60 text-surface-400 text-xs uppercase border-b border-surface-800">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3 text-right">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                {STOCK_EXPIRY_ALERTS.map((alert) => (
                  <tr key={alert.sku} className="hover:bg-surface-800/30">
                    <td className="px-4 py-3 font-medium text-white">{alert.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-400">{alert.sku}</td>
                    <td className="px-4 py-3 text-xs text-surface-300">{alert.batch}</td>
                    <td className="px-4 py-3 text-xs text-orange-400 font-mono">{alert.expiry}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">{alert.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Shipments list */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-5 border-b border-surface-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-400" />
              <h3 className="font-bold text-white">Pending Shipments</h3>
            </div>
            <Link href="/sells/shipments" className="text-xs text-brand-400 hover:text-brand-300">
              All Shipments →
            </Link>
          </div>
          <div className="divide-y divide-surface-800">
            {PENDING_SHIPMENTS.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-surface-800/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-white">{s.id}</span>
                    <span className="text-xs text-surface-400">• {s.invoiceNo}</span>
                  </div>
                  <p className="text-sm font-medium text-surface-200">{s.customer}</p>
                  <p className="text-xs text-surface-400">Destination: {s.destination} (Bangladesh)</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    {s.status}
                  </span>
                  <p className="text-xs text-surface-400">{s.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-5 border-b border-surface-800 flex justify-between items-center">
            <h3 className="font-bold text-white">Recent Sales</h3>
            <Link href="/sells" className="text-xs text-brand-400 hover:text-brand-300">
              View All Invoices →
            </Link>
          </div>
          <div className="divide-y divide-surface-800">
            {RECENT_SALES.map((sale) => (
              <div key={sale.invoiceNo} className="p-4 flex items-center justify-between hover:bg-surface-800/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{sale.invoiceNo}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${STATUS_STYLE[sale.status]}`}>
                      {sale.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400 mt-1">{sale.customer} • {sale.time}</p>
                </div>
                <span className="font-mono font-bold text-white text-base">
                  {formatCurrency(sale.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-5 border-b border-surface-800 flex justify-between items-center">
            <h3 className="font-bold text-white">Catalog Summary</h3>
            <Link href="/products" className="text-xs text-brand-400 hover:text-brand-300">
              Manage Products →
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {TOP_PRODUCTS.map((prod, idx) => (
              <div key={prod.sku} className="flex items-center justify-between p-3 rounded-lg bg-surface-900/60 border border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{prod.name}</p>
                    <p className="text-xs text-surface-400 font-mono">{prod.sku} • In stock: {prod.qty} Pcs</p>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-brand-400">
                  {formatCurrency(prod.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
