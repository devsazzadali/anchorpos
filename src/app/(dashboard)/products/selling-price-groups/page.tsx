"use client"

import { useState } from "react"
import { DollarSign, Plus, Edit2, Trash2, Search, Download, CheckCircle2, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface PriceGroup {
  id: string
  name: string
  description: string
  discountPct: number
  membersCount: number
}

const INITIAL_GROUPS: PriceGroup[] = [
  { id: "1", name: "Default Retail Counter Price", description: "Standard walk-in customer retail prices in BDT (৳)", discountPct: 0, membersCount: 150 },
  { id: "2", name: "Registered Bike Workshop Wholesale", description: "Special trade prices for verified mechanics & garage owners in Rangpur division", discountPct: 8, membersCount: 24 },
  { id: "3", name: "Courier & Fleet Rider Special", description: "Discounted parts and engine oils for Pathao, Foodpanda & delivery bike fleets", discountPct: 5, membersCount: 38 },
  { id: "4", name: "VIP Touring Club Members", description: "Exclusive discounts for Rangpur Motorcycle Riders Club members", discountPct: 6, membersCount: 12 },
]

export default function SellingPriceGroupsPage() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<PriceGroup[]>(INITIAL_GROUPS)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<PriceGroup | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PriceGroup | null>(null)

  // Form
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [discountPct, setDiscountPct] = useState(5)

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setDescription("")
    setDiscountPct(5)
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter price group name.", variant: "destructive" })
      return
    }
    const newGroup: PriceGroup = {
      id: String(Date.now()),
      name,
      description: description || "Selling price tier",
      discountPct: Number(discountPct) || 0,
      membersCount: 0,
    }
    setGroups([newGroup, ...groups])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Price Group Created",
      description: `Selling price group "${name}" added.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (g: PriceGroup) => {
    playClick()
    setEditingGroup(g)
    setName(g.name)
    setDescription(g.description)
    setDiscountPct(g.discountPct)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingGroup || !name.trim()) return
    setGroups(groups.map(g =>
      g.id === editingGroup.id ? { ...g, name, description, discountPct: Number(discountPct) || 0 } : g
    ))
    setIsEditOpen(false)
    setEditingGroup(null)
    playSuccess()
    toast({
      title: "Price Group Updated",
      description: `Selling price group updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setGroups(groups.filter(g => g.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Group Deleted",
      description: `Deleted price group "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(g => ({
      ID: g.id,
      "Group Name": g.name,
      Description: g.description,
      "Discount / Markup %": `${g.discountPct}%`,
      "Active Contacts": g.membersCount,
    }))
    exportToCsv("rangpur_bike_price_groups.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} price groups.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Selling Price Groups</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Pricing Tiers
            </span>
          </div>
          <p className="text-surface-400 mt-1">Configure wholesale rates, garage mechanics tiers, and fleet discounts</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Price Group
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search price groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> price groups
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-900/80 text-surface-400 text-xs uppercase border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Group Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Discount / Markup</th>
                <th className="px-6 py-4 text-center">Linked Customers</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="group-hover:text-brand-300 transition-colors">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-300 text-xs max-w-md leading-relaxed">{g.description}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 rounded bg-brand-950/40 text-brand-400 border border-brand-800/40 font-mono text-xs font-bold">
                      {g.discountPct > 0 ? `-${g.discountPct}% OFF` : 'Base 0%'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-surface-200">{g.membersCount}</td>
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
            <DialogTitle className="text-xl font-display font-bold">New Selling Price Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Group Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Courier Fleet Rate"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Default Group Discount (%)</Label>
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
              <Label className="text-surface-200">Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Who qualifies for this price tier..."
                className="bg-surface-800 border-surface-700 text-white"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Price Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Price Group</DialogTitle>
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
            <div className="space-y-2">
              <Label className="text-surface-200">Default Group Discount (%)</Label>
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
              <Label className="text-surface-200">Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Price Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Price Group?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>?
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
