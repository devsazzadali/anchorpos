"use client"

import { useState } from "react"
import { Users, Plus, Search, Edit2, Trash2, Download, CheckCircle2, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface CustomerGroup {
  id: string
  name: string
  discountPct: number
  calculation: "Percentage (%)" | "Fixed BDT (৳)"
  membersCount: number
}

const INITIAL_GROUPS: CustomerGroup[] = [
  { id: "1", name: "Standard Retail Customers", discountPct: 0, calculation: "Percentage (%)", membersCount: 312 },
  { id: "2", name: "Rangpur Biker Club Members", discountPct: 5, calculation: "Percentage (%)", membersCount: 48 },
  { id: "3", name: "Wholesale Workshop Mechanics", discountPct: 10, calculation: "Percentage (%)", membersCount: 19 },
  { id: "4", name: "Delivery Courier Fleet (Pathao/Foodpanda)", discountPct: 7.5, calculation: "Percentage (%)", membersCount: 27 },
]

export default function CustomerGroupsPage() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<CustomerGroup[]>(INITIAL_GROUPS)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerGroup | null>(null)

  // Form
  const [name, setName] = useState("")
  const [discountPct, setDiscountPct] = useState(5)
  const [calculation, setCalculation] = useState<"Percentage (%)" | "Fixed BDT (৳)">("Percentage (%)")

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setDiscountPct(5)
    setCalculation("Percentage (%)")
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter group name.", variant: "destructive" })
      return
    }
    const newGroup: CustomerGroup = {
      id: String(Date.now()),
      name,
      discountPct: Number(discountPct) || 0,
      calculation,
      membersCount: 0,
    }
    setGroups([newGroup, ...groups])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Customer Group Created",
      description: `Customer group "${name}" registered.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (g: CustomerGroup) => {
    playClick()
    setEditingGroup(g)
    setName(g.name)
    setDiscountPct(g.discountPct)
    setCalculation(g.calculation)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingGroup || !name.trim()) return
    setGroups(groups.map(g =>
      g.id === editingGroup.id ? { ...g, name, discountPct: Number(discountPct) || 0, calculation } : g
    ))
    setIsEditOpen(false)
    setEditingGroup(null)
    playSuccess()
    toast({
      title: "Customer Group Updated",
      description: `Customer group "${name}" updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setGroups(groups.filter(g => g.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Group Deleted",
      description: `Deleted "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(g => ({
      ID: g.id,
      "Group Name": g.name,
      "Discount Value": `${g.discountPct}%`,
      "Calculation Mode": g.calculation,
      "Members Count": g.membersCount,
    }))
    exportToCsv("rangpur_bike_customer_groups.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} customer groups.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Customer Groups</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Segmentation
            </span>
          </div>
          <p className="text-surface-400 mt-1">Configure tiered pricing and loyalty discounts for customer segments</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Customer Group
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search customer groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> groups
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-900/80 text-surface-400 text-xs uppercase border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Group Name</th>
                <th className="px-6 py-4 text-center">Discount Calculation</th>
                <th className="px-6 py-4 text-center">Active Customers</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="group-hover:text-brand-300 transition-colors">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    <span className="px-3 py-1 rounded bg-brand-950/40 text-brand-400 border border-brand-800/40 text-xs font-bold">
                      {g.discountPct > 0 ? `${g.discountPct}% Discount` : "0.00% (Regular Price)"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-white">{g.membersCount}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(g)}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Edit Group"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { playClick(); setDeleteTarget(g) }}
                        className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Group"
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
            <DialogTitle className="text-xl font-display font-bold">New Customer Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Group Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Biker Club Members"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Discount Amount</Label>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct} 
                  onChange={(e) => setDiscountPct(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Calculation Type</Label>
                <Select value={calculation} onValueChange={(v: "Percentage (%)" | "Fixed BDT (৳)") => setCalculation(v)}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="Percentage (%)">Percentage (%)</SelectItem>
                    <SelectItem value="Fixed BDT (৳)">Fixed BDT (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Customer Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Group Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Discount Amount</Label>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct} 
                  onChange={(e) => setDiscountPct(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Calculation Type</Label>
                <Select value={calculation} onValueChange={(v: "Percentage (%)" | "Fixed BDT (৳)") => setCalculation(v)}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="Percentage (%)">Percentage (%)</SelectItem>
                    <SelectItem value="Fixed BDT (৳)">Fixed BDT (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Group?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete customer group <strong className="text-white">{deleteTarget?.name}</strong>?
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
