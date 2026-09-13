"use client"

import { useState } from "react"
import { Search, Filter, Activity, Clock, Download, Trash2, ShieldCheck, CheckCircle2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

const INITIAL_LOGS = [
  { id: '1', user: 'Admin#1 (Superadmin)', module: 'Sales', action: 'CREATE', record: 'INV-2026-0002', detail: 'Completed POS cash sale ৳1,200.00 (Walk-In Customer)', timestamp: '2026-09-13 11:58 AM', ip: '192.168.1.5' },
  { id: '2', user: 'Admin#1 (Superadmin)', module: 'Products', action: 'UPDATE', record: 'MOT-7100-10W40', detail: 'Updated retail price from ৳1,000 to ৳1,050', timestamp: '2026-09-13 10:32 AM', ip: '192.168.1.8' },
  { id: '3', user: 'Store Manager', module: 'Purchases', action: 'CREATE', record: 'PO-2026-0001', detail: 'Received consignment ৳1,05,000 from Motul Bangladesh Ltd', timestamp: '2026-09-13 09:15 AM', ip: '192.168.1.6' },
  { id: '4', user: 'Admin#1 (Superadmin)', module: 'Users', action: 'UPDATE', record: 'cashier@rangpurbikeparlour.com', detail: 'Assigned POS cashier register privileges', timestamp: '2026-09-12 05:44 PM', ip: '192.168.1.1' },
  { id: '5', user: 'Store Manager', module: 'Expenses', action: 'CREATE', record: 'EXP-2026-0001', detail: 'Recorded receipt paper roll expense ৳500.00', timestamp: '2026-09-12 02:12 PM', ip: '192.168.1.9' },
  { id: '6', user: 'Admin#1 (Superadmin)', module: 'Contacts', action: 'CREATE', record: 'Rangpur Bikers Club', detail: 'Registered customer group with 5% discount tier', timestamp: '2026-09-12 11:00 AM', ip: '192.168.1.5' },
]

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-500/20 text-green-400 border-green-500/30',
  UPDATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  VIEW: 'bg-surface-700/50 text-surface-300 border-surface-600',
}

export default function ActivityLogPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [search, setSearch] = useState("")
  const [module, setModule] = useState("all")
  const [action, setAction] = useState("all")

  const filtered = logs.filter((log) => {
    const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.record.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase())
    const matchModule = module === "all" || log.module === module
    const matchAction = action === "all" || log.action === action
    return matchSearch && matchModule && matchAction
  })

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(l => ({
      Timestamp: l.timestamp,
      User: l.user,
      Module: l.module,
      Action: l.action,
      "Record Ref": l.record,
      Details: l.detail,
      "Client IP": l.ip,
    }))
    exportToCsv("rangpur_bike_activity_audit_log.csv", rows)
    toast({
      title: "Audit Log Exported",
      description: `Exported ${filtered.length} audit events to CSV.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleClearLogs = () => {
    playClick()
    setLogs([])
    toast({
      title: "Audit Trail Cleared",
      description: "Archived historical logs from memory buffer.",
      className: "bg-surface-900 text-white border-red-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Activity Log</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Audit Trail
            </span>
          </div>
          <p className="text-surface-400 mt-1">Immutable security log and user event trail for Rangpur Bike Parlour</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear Old Logs
          </Button>
          <Button 
            onClick={() => { playClick(); printCurrentWindow() }} 
            className="bg-surface-800 border border-surface-700 hover:bg-surface-700 text-white"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button 
            onClick={handleExportCsv} 
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            <Download className="w-4 h-4 mr-2" /> Export Audit CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row gap-3 border border-surface-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input
            placeholder="Search by user, record, or detail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 text-white"
          />
        </div>
        <Select value={module} onValueChange={setModule}>
          <SelectTrigger className="w-[160px] bg-surface-900 border-surface-700 text-white">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent className="bg-surface-800 border-surface-700 text-white">
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="Sales">Sales &amp; POS</SelectItem>
            <SelectItem value="Products">Products</SelectItem>
            <SelectItem value="Purchases">Purchases</SelectItem>
            <SelectItem value="Users">Users</SelectItem>
            <SelectItem value="Expenses">Expenses</SelectItem>
            <SelectItem value="Contacts">Contacts</SelectItem>
          </SelectContent>
        </Select>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[140px] bg-surface-900 border-surface-700 text-white">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="bg-surface-800 border-surface-700 text-white">
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">CREATE</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Record</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-400">
                    No activity records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-surface-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-surface-500" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{log.user}</td>
                    <td className="px-6 py-4 text-surface-300">{log.module}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded border font-mono font-bold ${ACTION_COLORS[log.action] || ''}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-brand-400 font-bold">{log.record}</td>
                    <td className="px-6 py-4 text-surface-200 text-xs max-w-sm">{log.detail}</td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-500">{log.ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
