"use client"

import { useState } from "react"
import { ShieldCheck, Plus, Edit2, Trash2, Search, Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface Warranty {
  id: string
  name: string
  duration: number
  period: "Days" | "Months" | "Years"
  description: string
  itemsCount: number
}

const INITIAL_WARRANTIES: Warranty[] = [
  { id: "1", name: "1 Year Official Manufacturer Warranty", duration: 1, period: "Years", description: "Manufacturer replacement warranty for electrical parts, ECU, and digital meters.", itemsCount: 14 },
  { id: "2", name: "6 Months Rangpur Bike Parlour Service Warranty", duration: 6, period: "Months", description: "Free labor, tuning, and diagnostic checkups at our Rangpur service workshop.", itemsCount: 22 },
  { id: "3", name: "3 Months Replacement Warranty", duration: 3, period: "Months", description: "Direct replacement warranty for motorbike 12V dry cell maintenance-free batteries.", itemsCount: 8 },
  { id: "4", name: "30 Days Fitment Guarantee", duration: 30, period: "Days", description: "Covers front suspension oil seals, bearings, and brake master cylinders.", itemsCount: 19 },
  { id: "5", name: "No Warranty (Consumables)", duration: 0, period: "Days", description: "Wear-and-tear items: engine lubricants, disc brake pads, and spark plugs.", itemsCount: 35 },
]

export default function WarrantiesPage() {
  const { toast } = useToast()
  const [warranties, setWarranties] = useState<Warranty[]>(INITIAL_WARRANTIES)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Warranty | null>(null)

  // Form
  const [name, setName] = useState("")
  const [duration, setDuration] = useState(6)
  const [period, setPeriod] = useState<"Days" | "Months" | "Years">("Months")
  const [description, setDescription] = useState("")

  const filtered = warranties.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setDuration(6)
    setPeriod("Months")
    setDescription("")
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter warranty scheme name.", variant: "destructive" })
      return
    }
    const newWarranty: Warranty = {
      id: String(Date.now()),
      name,
      duration: Number(duration),
      period,
      description: description || "Standard warranty coverage.",
      itemsCount: 0,
    }
    setWarranties([newWarranty, ...warranties])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Warranty Created",
      description: `Warranty "${name}" registered.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (w: Warranty) => {
    playClick()
    setEditingWarranty(w)
    setName(w.name)
    setDuration(w.duration)
    setPeriod(w.period)
    setDescription(w.description)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingWarranty || !name.trim()) return
    setWarranties(warranties.map(w => 
      w.id === editingWarranty.id ? { ...w, name, duration: Number(duration), period, description } : w
    ))
    setIsEditOpen(false)
    setEditingWarranty(null)
    playSuccess()
    toast({
      title: "Warranty Updated",
      description: `Warranty scheme updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setWarranties(warranties.filter(w => w.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Warranty Deleted",
      description: `Deleted "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(w => ({
      ID: w.id,
      "Warranty Name": w.name,
      Duration: w.duration > 0 ? `${w.duration} ${w.period}` : "None",
      Description: w.description,
      "Attached Products": w.itemsCount,
    }))
    exportToCsv("rangpur_bike_warranties.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} warranty definitions.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Warranties</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Guarantees
            </span>
          </div>
          <p className="text-surface-400 mt-1">Define product warranties, durations, and customer service terms</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Warranty
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search warranties by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> warranties
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-900/80 text-surface-400 text-xs uppercase border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Warranty Name</th>
                <th className="px-6 py-4">Coverage Duration</th>
                <th className="px-6 py-4">Terms &amp; Description</th>
                <th className="px-6 py-4 text-center">Attached Products</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="group-hover:text-brand-300 transition-colors">{w.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-200 font-mono font-semibold">
                    {w.duration > 0 ? (
                      <span className="px-2.5 py-1 rounded bg-brand-950/40 text-brand-400 border border-brand-800/40 text-xs">
                        {w.duration} {w.period}
                      </span>
                    ) : (
                      <span className="text-surface-500 text-xs italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-surface-300 text-xs max-w-md leading-relaxed">{w.description}</td>
                  <td className="px-6 py-4 text-center font-mono text-surface-200">{w.itemsCount}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(w)}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Edit Warranty"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { playClick(); setDeleteTarget(w) }}
                        className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Warranty"
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

      {/* Add Warranty Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">New Warranty Scheme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Warranty Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. 6 Months Free Service"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Duration (Number)</Label>
                <Input 
                  type="number" 
                  min={0}
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Period Unit</Label>
                <Select value={period} onValueChange={(v: "Days" | "Months" | "Years") => setPeriod(v)}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="Days">Days</SelectItem>
                    <SelectItem value="Months">Months</SelectItem>
                    <SelectItem value="Years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Description / Terms</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Details of what is covered vs excluded..."
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
              Save Warranty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Warranty Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Warranty Scheme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Warranty Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Duration (Number)</Label>
                <Input 
                  type="number" 
                  min={0}
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Period Unit</Label>
                <Select value={period} onValueChange={(v: "Days" | "Months" | "Years") => setPeriod(v)}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="Days">Days</SelectItem>
                    <SelectItem value="Months">Months</SelectItem>
                    <SelectItem value="Years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Description / Terms</Label>
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
              Update Warranty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Warranty?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete warranty scheme <strong className="text-white">{deleteTarget?.name}</strong>?
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
