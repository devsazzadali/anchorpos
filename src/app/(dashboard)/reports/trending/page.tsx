"use client"

import { useState } from "react"
import { Download, TrendingUp, TrendingDown, Filter, Printer, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"

const TOP_SELLERS = [
  { rank: 1, name: 'Motul 7100 4T 10W40 (1L Synthetic)', sku: 'MOT-7100-10W40', qtySold: 148, revenue: 15540000, growth: 24.5 },
  { rank: 2, name: 'Yamaha FZ / R15 Genuine Disc Brake Pads', sku: 'YAM-2FB-F5805-00', qtySold: 92, revenue: 6900000, growth: 18.2 },
  { rank: 3, name: 'KYT TT-Course Aerodynamic Full Face Helmet', sku: 'KYT-TTC-BLK-L', qtySold: 34, revenue: 22100000, growth: 31.0 },
  { rank: 4, name: 'NGK Laser Iridium Spark Plug CR8EIX', sku: 'NGK-CR8EIX', qtySold: 88, revenue: 6160000, growth: 12.4 },
  { rank: 5, name: 'DID 428D Heavy Duty Drive Chain (120 Links)', sku: 'DID-428D-120', qtySold: 45, revenue: 7650000, growth: 8.9 },
]

const BOTTOM_SELLERS = [
  { rank: 1, name: 'Brembo RCS19 Corsa Corta Radial Master Cylinder', sku: 'BRM-110C74010', qtySold: 2, revenue: 5800000, growth: -42.0 },
  { rank: 2, name: '4-Cylinder Carburetor Synchronizer Vacuum Gauge', sku: 'TOOL-SYNC-4CYL', qtySold: 3, revenue: 1350000, growth: -35.0 },
  { rank: 3, name: 'Universal Track Racing Front Wheel Stand', sku: 'PDK-STND-FR', qtySold: 4, revenue: 1600000, growth: -18.5 },
]

export default function TrendingProductsPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("month")
  const [activeTab, setActiveTab] = useState("top")

  const handleExportCsv = () => {
    playClick()
    const dataset = activeTab === "top" ? TOP_SELLERS : BOTTOM_SELLERS
    const rows = dataset.map(p => ({
      Rank: p.rank,
      "Product Name": p.name,
      SKU: p.sku,
      "Units Sold": p.qtySold,
      "Revenue (BDT)": p.revenue / 100,
      "Growth Rate": `${p.growth}%`,
    }))
    exportToCsv(`rangpur_bike_${activeTab}_products.csv`, rows)
    toast({
      title: "Report Exported",
      description: `Trending product velocity summary downloaded to CSV.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Trending Products</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Velocity
            </span>
          </div>
          <p className="text-surface-400 mt-1">Top fast-moving motorbike consumables and inventory turnover analysis</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] bg-surface-900 border-surface-700 text-white">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-surface-800 border-surface-700 text-white">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-surface-800 border border-surface-700">
          <TabsTrigger value="top" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300">
            <TrendingUp className="w-4 h-4 mr-2" /> Top Fast Sellers
          </TabsTrigger>
          <TabsTrigger value="bottom" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-surface-300">
            <TrendingDown className="w-4 h-4 mr-2" /> Slow Moving Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top">
          <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-center">Rank</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 font-mono">SKU</th>
                    <th className="px-6 py-4 text-center">Units Sold</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                    <th className="px-6 py-4 text-right">Month Velocity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {TOP_SELLERS.map((p) => (
                    <tr key={p.sku} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4 text-center font-bold font-mono">
                        <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs ${
                          p.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          p.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                          p.rank === 3 ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                          'text-surface-400'
                        }`}>
                          #{p.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-surface-400">{p.sku}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-brand-400">{p.qtySold} pcs</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-white">{formatCurrency(p.revenue)}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-bold text-green-400">+{p.growth}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bottom">
          <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-center">Rank</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 font-mono">SKU</th>
                    <th className="px-6 py-4 text-center">Units Sold</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                    <th className="px-6 py-4 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {BOTTOM_SELLERS.map((p) => (
                    <tr key={p.sku} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4 text-center font-mono text-surface-400">#{p.rank}</td>
                      <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-surface-400">{p.sku}</td>
                      <td className="px-6 py-4 text-center font-mono text-surface-300">{p.qtySold} pcs</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-white">{formatCurrency(p.revenue)}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-bold text-red-400">{p.growth}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
