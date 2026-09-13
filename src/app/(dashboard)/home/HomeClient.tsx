"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, CreditCard, AlertTriangle, Clock, ArrowRight,
  Truck, ShieldAlert, CheckCircle2, RefreshCw, Download, Calendar, Sparkles
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


export interface DashboardData {
  SALES_VS_PURCHASES: { day: string; sales: number; purchases: number }[]
  MONTHLY_REVENUE: { month: string; revenue: number }[]
  TOP_PRODUCTS: { name: string; sku: string; revenue: number; qty: number }[]
  STOCK_EXPIRY_ALERTS: { name: string; sku: string; batch: string; expiry: string; stock: string; status: string }[]
  PENDING_SHIPMENTS: { id: string; invoiceNo: string; customer: string; destination: string; status: string; date: string }[]
  RECENT_SALES: { invoiceNo: string; customer: string; total: number; status: string; time: string }[]
  KPIs: {
    totalSales: number
    netProfit: number
    totalPurchases: number
    totalExpense: number
    closingStockCost: number
    closingStockRetail: number
    salesChange: number
    profitChange: number
    purchasesChange: number
    expenseChange: number
  }
}

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
    <div className={`bento-card p-6 ${color} border-l-4 group`}>
      <div className="flex justify-between items-start">
        <div className="p-2.5 rounded-xl bg-surface-800/80 text-surface-200 group-hover:scale-110 group-hover:bg-brand-500/20 group-hover:text-brand-300 transition-all duration-500 shadow-inner">
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${positive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-surface-400">
          {isCurrency
            ? <><span className="text-surface-500 text-lg mr-1">৳</span><AnimatedValue target={Math.round(value / 100)} /></>
            : <AnimatedValue target={value} />}
        </p>
        {subtext && (
          <p className="text-xs text-surface-500 mt-2 font-medium">{subtext}</p>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function HomeClient({ data }: { data: DashboardData }) {
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
    paid: "bg-green-500/10 text-green-400 border border-green-500/20",
    partial: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    due: "bg-red-500/10 text-red-400 border border-red-500/20",
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 bg-surface-900/20 p-6 rounded-[2rem] border border-white/5 shadow-inner">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 shadow-glow">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <h2 className="text-4xl font-display font-black text-white tracking-tight">
              Dashboard
            </h2>
          </div>
          <p className="text-surface-400 ml-14 font-medium">
            Welcome back to Rangpur Bike Parlour
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Range Filter */}
          <div className="flex items-center gap-2 bg-surface-950/60 border border-surface-700/50 px-3 py-2 rounded-xl text-sm shadow-inner">
            <Calendar className="w-4 h-4 text-brand-400" />
            <select
              value={dateFilter}
              onChange={(e) => { playClick(); setDateFilter(e.target.value) }}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="all" className="bg-surface-900">All Time (Live FY26)</option>
              <option value="today" className="bg-surface-900">Today (Sep 13)</option>
              <option value="week" className="bg-surface-900">This Week</option>
              <option value="month" className="bg-surface-900">This Month (September)</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-surface-700 bg-surface-950/60 hover:bg-surface-800 text-surface-300 hover:text-white h-10 px-4 rounded-xl shadow-inner"
          >
            <RefreshCw className={`w-4 h-4 mr-2 text-brand-400 ${isRefreshing ? "animate-spin" : ""}`} />
            Sync
          </Button>

          <Button asChild className="bg-white text-black hover:bg-surface-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] h-10 px-5 rounded-xl font-bold transition-all hover:scale-105">
            <Link href="/pos">
              <ShoppingCart className="w-4 h-4 mr-2" /> POS Terminal
            </Link>
          </Button>
        </div>
      </div>


      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI Row 1 */}
        <KPICard 
          title="Total Revenue" 
          value={data.KPIs.totalSales} 
          change={data.KPIs.salesChange} 
          icon={DollarSign} 
          color="border-l-brand-500" 
        />
        <KPICard 
          title="Net Profit" 
          value={data.KPIs.netProfit} 
          change={data.KPIs.profitChange} 
          icon={TrendingUp} 
          color="border-l-emerald-500" 
        />
        <KPICard 
          title="Total Purchases" 
          value={data.KPIs.totalPurchases} 
          change={data.KPIs.purchasesChange} 
          icon={Package} 
          color="border-l-orange-500" 
        />
        <KPICard 
          title="Operating Expenses" 
          value={data.KPIs.totalExpense} 
          change={data.KPIs.expenseChange} 
          icon={CreditCard} 
          color="border-l-rose-500" 
        />

        {/* Large Chart Area - Spans 3 columns */}
        <div className="bento-card lg:col-span-3 lg:row-span-2 flex flex-col p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-brand-500/20 transition-colors duration-1000" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h3 className="text-xl font-display font-bold text-white">Revenue vs Procurement</h3>
              <p className="text-surface-400 text-sm mt-1">30-day cash flow analysis</p>
            </div>
            <Link href="/reports/purchase-sell" className="px-4 py-2 rounded-lg bg-surface-800/50 text-xs font-semibold text-brand-400 hover:bg-surface-800 hover:text-brand-300 transition-colors">
              Detailed Report
            </Link>
          </div>
          <div className="flex-1 min-h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.SALES_VS_PURCHASES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5a67f5" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#5a67f5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#6b7190", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#6b7190", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#5a67f5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Metrics Stacked in 1 column */}
        <div className="bento-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-purple-500/30 transition-colors duration-1000" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-surface-400 text-sm font-semibold mb-1">Inventory Valuation</p>
            <p className="text-3xl font-mono font-bold text-white tracking-tight">৳{(data.KPIs.closingStockRetail/1000).toFixed(1)}k</p>
            <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4.2% retail margin
            </p>
          </div>
        </div>
        
        <div className="bento-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-1000" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-surface-400 text-sm font-semibold mb-1">Payment Collection</p>
            <p className="text-3xl font-mono font-bold text-white tracking-tight">100%</p>
            <p className="text-xs text-surface-500 mt-2 font-medium">All invoices settled.</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bento-card lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Live Transactions</h3>
            <Link href="/sells" className="text-sm font-medium text-brand-400 hover:text-brand-300">View All</Link>
          </div>
          <div className="space-y-4">
            {data.RECENT_SALES.map((sale) => (
              <div key={sale.invoiceNo} className="flex items-center justify-between p-3 rounded-xl bg-surface-950/50 border border-surface-800 hover:bg-surface-800/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{sale.invoiceNo}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${STATUS_STYLE[sale.status]}`}>
                        {sale.status}
                      </span>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">{sale.customer} • {sale.time}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-white text-lg">
                  {formatCurrency(sale.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products / Catalog Summary */}
        <div className="bento-card lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Trending Catalog</h3>
            <Link href="/products" className="text-sm font-medium text-brand-400 hover:text-brand-300">Manage Catalog</Link>
          </div>
          <div className="space-y-4">
            {data.TOP_PRODUCTS.map((prod, idx) => (
              <div key={prod.sku} className="flex items-center justify-between p-3 rounded-xl bg-surface-950/50 border border-surface-800 hover:bg-surface-800/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-glow">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{prod.name}</p>
                    <p className="text-xs text-surface-400 font-mono mt-0.5">{prod.sku} • In stock: {prod.qty}</p>
                  </div>
                </div>
                <span className="text-base font-bold font-mono text-brand-400">
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

