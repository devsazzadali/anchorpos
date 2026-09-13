"use client"

import { useState } from "react"
import { Users, Plus, Search, Edit2, Trash2, Download, CheckCircle2, Percent, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface CommissionAgent {
  id: string
  name: string
  email: string
  contact: string
  commissionPct: number
  salesCount: number
  totalCommissionPaid: number
}

const INITIAL_AGENTS: CommissionAgent[] = [
  { id: "1", name: "Rahim Uddin", email: "rahim.sales@rangpurbikeparlour.com", contact: "+880 1712-000001", commissionPct: 5.0, salesCount: 38, totalCommissionPaid: 125000 },
  { id: "2", name: "Kamal Hossain", email: "kamal@rangpurbikeparlour.com", contact: "+880 1712-000002", commissionPct: 3.5, salesCount: 22, totalCommissionPaid: 68000 },
  { id: "3", name: "Sajjad Hossain", email: "sajjad.rep@rangpurbikeparlour.com", contact: "+880 1712-000003", commissionPct: 4.0, salesCount: 19, totalCommissionPaid: 54000 },
  { id: "4", name: "Tariqul Islam", email: "tariqul@rangpurbikeparlour.com", contact: "+880 1712-000004", commissionPct: 5.0, salesCount: 42, totalCommissionPaid: 145000 },
]

export default function CommissionAgentsPage() {
  const { toast } = useToast()
  const [agents, setAgents] = useState<CommissionAgent[]>(INITIAL_AGENTS)
  const [search, setSearch] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<CommissionAgent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CommissionAgent | null>(null)

  // Form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [contact, setContact] = useState("")
  const [commissionPct, setCommissionPct] = useState(5.0)

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.contact.includes(search)
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setEmail("")
    setContact("+880 17")
    setCommissionPct(5.0)
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim() || !contact.trim()) {
      toast({ title: "Fields Required", description: "Please enter agent name and phone contact.", variant: "destructive" })
      return
    }
    const newAgent: CommissionAgent = {
      id: String(Date.now()),
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@rangpurbikeparlour.com`,
      contact,
      commissionPct: Number(commissionPct) || 0,
      salesCount: 0,
      totalCommissionPaid: 0,
    }
    setAgents([...agents, newAgent])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Agent Registered",
      description: `Sales agent "${name}" enrolled with ${commissionPct}% commission.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (a: CommissionAgent) => {
    playClick()
    setEditingAgent(a)
    setName(a.name)
    setEmail(a.email)
    setContact(a.contact)
    setCommissionPct(a.commissionPct)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingAgent || !name.trim()) return
    setAgents(agents.map(a =>
      a.id === editingAgent.id ? { ...a, name, email, contact, commissionPct: Number(commissionPct) || 0 } : a
    ))
    setIsEditOpen(false)
    setEditingAgent(null)
    playSuccess()
    toast({
      title: "Agent Updated",
      description: `Agent profile updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setAgents(agents.filter(a => a.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Agent Removed",
      description: `Removed "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(a => ({
      ID: a.id,
      "Agent Name": a.name,
      Email: a.email,
      Contact: a.contact,
      "Commission Rate": `${a.commissionPct}%`,
      "Deals Closed": a.salesCount,
      "Total Commission Earned (BDT)": a.totalCommissionPaid,
    }))
    exportToCsv("rangpur_bike_commission_agents.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} commission agents.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Sales Commission Agents</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Incentives
            </span>
          </div>
          <p className="text-surface-400 mt-1">Manage sales representatives, field dealers, and automated commission tiers</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleExportCsv}
            className="border-surface-700 bg-surface-800/80 hover:bg-surface-700 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button 
            onClick={handleOpenAdd}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Agent
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search agents by name, email, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> sales agents
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-900/80 text-surface-400 text-xs uppercase border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Agent Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4 text-center">Commission (%)</th>
                <th className="px-6 py-4 text-center">Sales Closed</th>
                <th className="px-6 py-4 text-right">Commission Earned</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((agent) => (
                <tr key={agent.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="group-hover:text-brand-300 transition-colors">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs space-y-0.5">
                    <div className="text-surface-300 flex items-center gap-1.5 font-mono">
                      <Phone className="w-3 h-3 text-surface-500" /> {agent.contact}
                    </div>
                    <div className="text-surface-400 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-surface-500" /> {agent.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    <span className="px-2.5 py-1 rounded bg-brand-950/40 text-brand-400 border border-brand-800/40 text-xs font-bold">
                      {agent.commissionPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-white">{agent.salesCount}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
                    ৳ {agent.totalCommissionPaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(agent)}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Edit Agent"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { playClick(); setDeleteTarget(agent) }}
                        className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Register Commission Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Agent Full Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Mahfuzur Rahman"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Phone Number *</Label>
                <Input 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  placeholder="+880 17..."
                  className="bg-surface-800 border-surface-700 text-white font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Commission Rate (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  min={0}
                  max={50}
                  value={commissionPct} 
                  onChange={(e) => setCommissionPct(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Email Address</Label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="agent@example.com"
                className="bg-surface-800 border-surface-700 text-white"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Register Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Commission Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Agent Full Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Phone Number *</Label>
                <Input 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  className="bg-surface-800 border-surface-700 text-white font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Commission Rate (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  min={0}
                  max={50}
                  value={commissionPct} 
                  onChange={(e) => setCommissionPct(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Email Address</Label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Agent?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete agent <strong className="text-white">{deleteTarget?.name}</strong>?
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
