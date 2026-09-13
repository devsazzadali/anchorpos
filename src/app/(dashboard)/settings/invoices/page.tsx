"use client"

import { useState } from "react"
import { Plus, Receipt, MoreHorizontal, FileEdit, Trash2, Eye, Download, Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface InvoiceScheme {
  id: string
  name: string
  prefix: string
  startNumber: number
  totalDigits: number
  preview: string
  count: number
  isDefault: boolean
}

function buildPreview(prefix: string, startNumber: number, digits: number) {
  const num = String(startNumber).padStart(digits, '0')
  return `${prefix}${prefix ? '-' : ''}${num}`
}

const INITIAL_SCHEMES: InvoiceScheme[] = [
  { id: '1', name: 'Default POS Counter', prefix: 'INV-2026', startNumber: 1, totalDigits: 4, preview: 'INV-2026-0001', count: 42, isDefault: true },
  { id: '2', name: 'Workshop Job Cards', prefix: 'WRK-2026', startNumber: 101, totalDigits: 4, preview: 'WRK-2026-0101', count: 18, isDefault: false },
  { id: '3', name: 'Commercial Quotations', prefix: 'QT', startNumber: 1, totalDigits: 5, preview: 'QT-00001', count: 9, isDefault: false },
]

export default function InvoiceSchemesPage() {
  const { toast } = useToast()
  const [schemes, setSchemes] = useState<InvoiceScheme[]>(INITIAL_SCHEMES)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingScheme, setEditingScheme] = useState<InvoiceScheme | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InvoiceScheme | null>(null)

  // Form
  const [name, setName] = useState("")
  const [prefix, setPrefix] = useState("INV")
  const [start, setStart] = useState(1)
  const [digits, setDigits] = useState(4)

  const filtered = schemes.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prefix.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setPrefix("INV-2026")
    setStart(1)
    setDigits(4)
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter invoice scheme name.", variant: "destructive" })
      return
    }
    const newScheme: InvoiceScheme = {
      id: String(Date.now()),
      name,
      prefix,
      startNumber: Number(start) || 1,
      totalDigits: Number(digits) || 4,
      preview: buildPreview(prefix, Number(start) || 1, Number(digits) || 4),
      count: 0,
      isDefault: false,
    }
    setSchemes([...schemes, newScheme])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Scheme Created",
      description: `Invoice format "${name}" (${newScheme.preview}) created.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (s: InvoiceScheme) => {
    playClick()
    setEditingScheme(s)
    setName(s.name)
    setPrefix(s.prefix)
    setStart(s.startNumber)
    setDigits(s.totalDigits)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingScheme || !name.trim()) return
    setSchemes(schemes.map(s =>
      s.id === editingScheme.id ? {
        ...s,
        name,
        prefix,
        startNumber: Number(start) || 1,
        totalDigits: Number(digits) || 4,
        preview: buildPreview(prefix, Number(start) || 1, Number(digits) || 4),
      } : s
    ))
    setIsEditOpen(false)
    setEditingScheme(null)
    playSuccess()
    toast({
      title: "Scheme Updated",
      description: `Invoice numbering updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setSchemes(schemes.filter(s => s.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Scheme Deleted",
      description: `Removed "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleSetDefault = (s: InvoiceScheme) => {
    playClick()
    setSchemes(schemes.map(item => ({
      ...item,
      isDefault: item.id === s.id
    })))
    toast({
      title: "Default Scheme Set",
      description: `"${s.name}" is now the default numbering scheme for counter sales.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(s => ({
      ID: s.id,
      "Scheme Name": s.name,
      Prefix: s.prefix,
      "Start Number": s.startNumber,
      "Total Digits": s.totalDigits,
      "Live Sample Preview": s.preview,
      "Invoices Generated": s.count,
      "Is Default": s.isDefault ? "Yes" : "No",
    }))
    exportToCsv("rangpur_bike_invoice_schemes.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} invoice schemes.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Invoice Schemes</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Numbering
            </span>
          </div>
          <p className="text-surface-400 mt-1">Configure serial number formats, prefixes, and pad digits for POS receipts and invoices</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Scheme
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search invoice schemes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> schemes
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Scheme Name</th>
                <th className="px-6 py-4">Prefix</th>
                <th className="px-6 py-4 text-center">Start No.</th>
                <th className="px-6 py-4">Sample Preview</th>
                <th className="px-6 py-4 text-center">Default</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-brand-400 font-bold">{s.prefix || "—"}</td>
                  <td className="px-6 py-4 text-center font-mono text-surface-200">{s.startNumber}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded bg-surface-800 text-emerald-400 border border-surface-700 font-mono text-xs font-bold">
                      {s.preview}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {s.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Default
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(s)}
                        className="text-xs text-surface-400 hover:text-white h-7"
                      >
                        Set Default
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(s)}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Edit Scheme"
                      >
                        <FileEdit className="w-4 h-4" />
                      </Button>
                      {!s.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { playClick(); setDeleteTarget(s) }}
                          className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Scheme"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
            <DialogTitle className="text-xl font-display font-bold">New Invoice Scheme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Scheme Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Counter Sales Scheme" 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500" 
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Prefix</Label>
                <Input 
                  value={prefix} 
                  onChange={(e) => setPrefix(e.target.value)} 
                  placeholder="INV" 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Start No.</Label>
                <Input 
                  type="number" 
                  value={start} 
                  onChange={(e) => setStart(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Pad Digits</Label>
                <Input 
                  type="number" 
                  value={digits} 
                  onChange={(e) => setDigits(Number(e.target.value))} 
                  min={3} 
                  max={8} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-800/60 border border-surface-700 flex items-center justify-between">
              <span className="text-xs text-surface-400">Live Preview:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {buildPreview(prefix, Number(start) || 1, Number(digits) || 4)}
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Scheme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Invoice Scheme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Scheme Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500" 
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Prefix</Label>
                <Input 
                  value={prefix} 
                  onChange={(e) => setPrefix(e.target.value)} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Start No.</Label>
                <Input 
                  type="number" 
                  value={start} 
                  onChange={(e) => setStart(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Pad Digits</Label>
                <Input 
                  type="number" 
                  value={digits} 
                  onChange={(e) => setDigits(Number(e.target.value))} 
                  min={3} 
                  max={8} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-800/60 border border-surface-700 flex items-center justify-between">
              <span className="text-xs text-surface-400">Live Preview:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {buildPreview(prefix, Number(start) || 1, Number(digits) || 4)}
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Scheme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Invoice Scheme?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete scheme <strong className="text-white">{deleteTarget?.name}</strong>?
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
