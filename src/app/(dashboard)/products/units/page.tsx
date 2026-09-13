"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Search, Download, Scale, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface Unit {
  id: string
  name: string
  short: string
  decimals: boolean
  usageCount: number
}

const INITIAL_UNITS: Unit[] = [
  { id: '1', name: 'Pieces', short: 'pcs', decimals: false, usageCount: 45 },
  { id: '2', name: 'Liters', short: 'L', decimals: true, usageCount: 18 },
  { id: '3', name: 'Milliliters', short: 'ml', decimals: false, usageCount: 12 },
  { id: '4', name: 'Sets', short: 'set', decimals: false, usageCount: 24 },
  { id: '5', name: 'Box / Carton', short: 'box', decimals: false, usageCount: 8 },
  { id: '6', name: 'Meters', short: 'm', decimals: true, usageCount: 6 },
  { id: '7', name: 'Service Hours', short: 'hrs', decimals: true, usageCount: 15 },
]

export default function UnitsPage() {
  const { toast } = useToast()
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null)

  // Form
  const [name, setName] = useState("")
  const [short, setShort] = useState("")
  const [decimals, setDecimals] = useState(false)

  const filtered = units.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.short.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setShort("")
    setDecimals(false)
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim() || !short.trim()) {
      toast({ title: "Fields Required", description: "Please enter unit name and short code.", variant: "destructive" })
      return
    }
    const newUnit: Unit = {
      id: String(Date.now()),
      name,
      short,
      decimals,
      usageCount: 0,
    }
    setUnits([newUnit, ...units])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Unit Created",
      description: `Measurement unit "${name} (${short})" added.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (u: Unit) => {
    playClick()
    setEditingUnit(u)
    setName(u.name)
    setShort(u.short)
    setDecimals(u.decimals)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingUnit || !name.trim() || !short.trim()) return
    setUnits(units.map(u => 
      u.id === editingUnit.id ? { ...u, name, short, decimals } : u
    ))
    setIsEditOpen(false)
    setEditingUnit(null)
    playSuccess()
    toast({
      title: "Unit Updated",
      description: `Measurement unit updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setUnits(units.filter(u => u.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Unit Deleted",
      description: `Deleted unit "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(u => ({
      ID: u.id,
      "Unit Name": u.name,
      "Short Code": u.short,
      "Allow Decimals": u.decimals ? "Yes" : "No",
      "Products Count": u.usageCount,
    }))
    exportToCsv("rangpur_bike_units.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} measurement units.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Units</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Measurement
            </span>
          </div>
          <p className="text-surface-400 mt-1">Manage units of measurement (e.g. pcs, Liters, sets, meters)</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Unit
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search units by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> units
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Unit Name</th>
                <th className="px-6 py-4 font-mono">Short Code</th>
                <th className="px-6 py-4 text-center">Allow Decimals</th>
                <th className="px-6 py-4 text-center">Products Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map(unit => (
                <tr key={unit.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        <Scale className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {unit.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-brand-400 font-bold">{unit.short}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      unit.decimals 
                        ? 'bg-blue-950/40 text-blue-400 border border-blue-800/40' 
                        : 'bg-surface-800 text-surface-400'
                    }`}>
                      {unit.decimals ? 'Yes (e.g. 1.25 L)' : 'No (Whole items)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-surface-300">
                    {unit.usageCount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(unit)}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Edit Unit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { playClick(); setDeleteTarget(unit) }}
                        className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Unit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Unit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">New Measurement Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Unit Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Liters, Pieces, Sets"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Short Code *</Label>
              <Input 
                value={short} 
                onChange={(e) => setShort(e.target.value)} 
                placeholder="e.g. L, pcs, set"
                className="bg-surface-800 border-surface-700 text-white font-mono"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 border border-surface-700/60">
              <div>
                <p className="text-sm font-medium text-white">Allow Fractional Decimals</p>
                <p className="text-xs text-surface-400">Permit 0.5 or 1.25 quantities in POS and inventory</p>
              </div>
              <Switch checked={decimals} onCheckedChange={setDecimals} className="data-[state=checked]:bg-brand-600" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Measurement Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Unit Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Short Code *</Label>
              <Input 
                value={short} 
                onChange={(e) => setShort(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white font-mono"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 border border-surface-700/60">
              <div>
                <p className="text-sm font-medium text-white">Allow Fractional Decimals</p>
                <p className="text-xs text-surface-400">Permit 0.5 or 1.25 quantities in POS and inventory</p>
              </div>
              <Switch checked={decimals} onCheckedChange={setDecimals} className="data-[state=checked]:bg-brand-600" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Unit?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete unit <strong className="text-white">{deleteTarget?.name}</strong>?
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
