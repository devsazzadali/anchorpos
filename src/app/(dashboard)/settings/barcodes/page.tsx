"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Printer, Barcode, Download, Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface BarcodeTemplate {
  id: string
  name: string
  type: string
  width: number
  height: number
  labels_per_row: number
  is_default: boolean
}

const INITIAL_TEMPLATES: BarcodeTemplate[] = [
  { id: '1', name: 'Standard Shelf Sticker (Code 128)', type: 'C128', width: 38, height: 25, labels_per_row: 2, is_default: true },
  { id: '2', name: 'Small Parts Label (EAN-13)', type: 'EAN13', width: 20, height: 15, labels_per_row: 3, is_default: false },
  { id: '3', name: 'Continuous Thermal Roll (58mm)', type: 'C128', width: 50, height: 30, labels_per_row: 1, is_default: false },
  { id: '4', name: 'A4 Sheet 24-Up Laser Sticker', type: 'Code 39', width: 70, height: 37, labels_per_row: 3, is_default: false },
]

export default function BarcodeSettingsPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<BarcodeTemplate[]>(INITIAL_TEMPLATES)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BarcodeTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BarcodeTemplate | null>(null)

  // Form
  const [name, setName] = useState("")
  const [type, setType] = useState("C128")
  const [width, setWidth] = useState(38)
  const [height, setHeight] = useState(25)
  const [labelsPerRow, setLabelsPerRow] = useState(2)
  const [isDefault, setIsDefault] = useState(false)

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setType("C128")
    setWidth(38)
    setHeight(25)
    setLabelsPerRow(2)
    setIsDefault(false)
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter template name.", variant: "destructive" })
      return
    }
    const newTpl: BarcodeTemplate = {
      id: String(Date.now()),
      name,
      type,
      width: Number(width) || 38,
      height: Number(height) || 25,
      labels_per_row: Number(labelsPerRow) || 2,
      is_default: isDefault,
    }

    if (isDefault) {
      setTemplates([newTpl, ...templates.map(t => ({ ...t, is_default: false }))])
    } else {
      setTemplates([...templates, newTpl])
    }

    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Template Saved",
      description: `Barcode layout "${name}" created.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (t: BarcodeTemplate) => {
    playClick()
    setEditingTemplate(t)
    setName(t.name)
    setType(t.type)
    setWidth(t.width)
    setHeight(t.height)
    setLabelsPerRow(t.labels_per_row)
    setIsDefault(t.is_default)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingTemplate || !name.trim()) return
    setTemplates(templates.map(t => {
      if (t.id === editingTemplate.id) {
        return { ...t, name, type, width: Number(width) || 38, height: Number(height) || 25, labels_per_row: Number(labelsPerRow) || 2, is_default: isDefault }
      }
      return isDefault ? { ...t, is_default: false } : t
    }))
    setIsEditOpen(false)
    setEditingTemplate(null)
    playSuccess()
    toast({
      title: "Template Updated",
      description: `Barcode layout updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setTemplates(templates.filter(t => t.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Template Deleted",
      description: `Removed "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handlePrintTest = (t: BarcodeTemplate) => {
    playClick()
    toast({
      title: "Printing Test Sticker",
      description: `Generating test calibration sticker for ${t.name} (${t.width}x${t.height}mm)...`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(t => ({
      ID: t.id,
      "Template Name": t.name,
      "Barcode Type": t.type,
      "Width (mm)": t.width,
      "Height (mm)": t.height,
      "Labels Per Row": t.labels_per_row,
      "Is Default": t.is_default ? "Yes" : "No",
    }))
    exportToCsv("rangpur_bike_barcode_templates.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} barcode templates.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Barcode Settings</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Labels &amp; Stickers
            </span>
          </div>
          <p className="text-surface-400 mt-1">Configure barcode sticker templates, page dimensions, and printer layouts</p>
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
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search barcode templates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> templates
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Template Name</th>
                <th className="px-6 py-4">Barcode Symbology</th>
                <th className="px-6 py-4 text-center">Dimensions (W x H mm)</th>
                <th className="px-6 py-4 text-center">Labels/Row</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map(tpl => (
                <tr key={tpl.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        <Barcode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-brand-300 transition-colors flex items-center gap-2">
                          {tpl.name}
                          {tpl.is_default && (
                            <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[10px]">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-brand-400 font-bold">{tpl.type}</td>
                  <td className="px-6 py-4 text-center text-surface-200 font-mono">
                    {tpl.width} x {tpl.height} mm
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-surface-300">{tpl.labels_per_row}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handlePrintTest(tpl)}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Print Sample Calibration Sheet"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(tpl)}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Edit Template"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!tpl.is_default && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { playClick(); setDeleteTarget(tpl) }}
                          className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Template"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <DialogTitle className="text-xl font-display font-bold">New Barcode Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Template Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. 50x30mm Shelf Label" 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Barcode Symbology</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-surface-800 border-surface-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-surface-800 border-surface-700 text-white">
                  <SelectItem value="C128">Code 128 (Standard Alpha-numeric)</SelectItem>
                  <SelectItem value="EAN13">EAN-13 (Standard Retail)</SelectItem>
                  <SelectItem value="Code 39">Code 39</SelectItem>
                  <SelectItem value="QR">QR Code (2D Matrix)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Width (mm)</Label>
                <Input 
                  type="number" 
                  value={width} 
                  onChange={(e) => setWidth(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Height (mm)</Label>
                <Input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Labels/Row</Label>
                <Input 
                  type="number" 
                  value={labelsPerRow} 
                  onChange={(e) => setLabelsPerRow(Number(e.target.value))} 
                  min={1} 
                  max={5} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 border border-surface-700/60">
              <div>
                <p className="text-sm font-medium text-white">Default Template</p>
                <p className="text-xs text-surface-400">Pre-select when printing labels</p>
              </div>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} className="data-[state=checked]:bg-brand-600" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Barcode Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Template Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Barcode Symbology</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-surface-800 border-surface-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-surface-800 border-surface-700 text-white">
                  <SelectItem value="C128">Code 128</SelectItem>
                  <SelectItem value="EAN13">EAN-13</SelectItem>
                  <SelectItem value="Code 39">Code 39</SelectItem>
                  <SelectItem value="QR">QR Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Width (mm)</Label>
                <Input 
                  type="number" 
                  value={width} 
                  onChange={(e) => setWidth(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Height (mm)</Label>
                <Input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Labels/Row</Label>
                <Input 
                  type="number" 
                  value={labelsPerRow} 
                  onChange={(e) => setLabelsPerRow(Number(e.target.value))} 
                  min={1} 
                  max={5} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 border border-surface-700/60">
              <div>
                <p className="text-sm font-medium text-white">Default Template</p>
                <p className="text-xs text-surface-400">Pre-select when printing labels</p>
              </div>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} className="data-[state=checked]:bg-brand-600" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Barcode Template?</DialogTitle>
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
