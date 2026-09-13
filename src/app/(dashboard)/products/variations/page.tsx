"use client"

import { useState } from "react"
import { Layers, Plus, Edit2, Trash2, Search, Download, CheckCircle2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface VariationTemplate {
  id: string
  name: string
  values: string[]
}

const INITIAL_TEMPLATES: VariationTemplate[] = [
  { id: "1", name: "Helmet Size", values: ["Small (S)", "Medium (M)", "Large (L)", "XL", "XXL"] },
  { id: "2", name: "Visor Tint & Finish", values: ["Clear", "Smoke", "Rainbow Mirror", "Iridium Silver"] },
  { id: "3", name: "Lubricant Bottle Volume", values: ["800ml", "1 Liter", "1.2 Liter", "4 Liters"] },
  { id: "4", name: "Drive Chain Link Count", values: ["118 Links", "120 Links", "122 Links", "128 Links"] },
  { id: "5", name: "Tyre Size (Rim/Width)", values: ["90/90-17", "100/90-17", "130/70-17", "140/70-17"] },
  { id: "6", name: "Brake Lever Color", values: ["Matte Black", "Titanium Gray", "Racing Red", "Gold"] },
]

export default function VariationsPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<VariationTemplate[]>(INITIAL_TEMPLATES)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTmpl, setEditingTmpl] = useState<VariationTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<VariationTemplate | null>(null)

  // Form
  const [name, setName] = useState("")
  const [valuesInput, setValuesInput] = useState("")

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.values.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setValuesInput("")
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter template name.", variant: "destructive" })
      return
    }
    const parsedValues = valuesInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)

    if (parsedValues.length === 0) {
      toast({ title: "Values Required", description: "Please enter at least one variation value separated by comma.", variant: "destructive" })
      return
    }

    const newTmpl: VariationTemplate = {
      id: String(Date.now()),
      name,
      values: parsedValues,
    }
    setTemplates([newTmpl, ...templates])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Template Created",
      description: `Variation template "${name}" added.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (tmpl: VariationTemplate) => {
    playClick()
    setEditingTmpl(tmpl)
    setName(tmpl.name)
    setValuesInput(tmpl.values.join(", "))
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingTmpl || !name.trim()) return
    const parsedValues = valuesInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)

    setTemplates(templates.map(t =>
      t.id === editingTmpl.id ? { ...t, name, values: parsedValues } : t
    ))
    setIsEditOpen(false)
    setEditingTmpl(null)
    playSuccess()
    toast({
      title: "Template Updated",
      description: `Variation template updated.`,
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

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(t => ({
      ID: t.id,
      "Template Name": t.name,
      "Variation Values": t.values.join(" | "),
      "Values Count": t.values.length,
    }))
    exportToCsv("rangpur_bike_variations.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} variation templates.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Variation Templates</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Attributes
            </span>
          </div>
          <p className="text-surface-400 mt-1">Reusable attributes for variable products (sizes, visor tints, volumes, link lengths)</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Variation Template
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search templates or attributes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> templates
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tmpl) => (
          <div key={tmpl.id} className="glass-panel p-5 rounded-xl space-y-4 border border-surface-800 hover:border-brand-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white group-hover:text-brand-300 transition-colors">{tmpl.name}</h4>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleOpenEdit(tmpl)}
                    className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                    title="Edit Template"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { playClick(); setDeleteTarget(tmpl) }}
                    className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {tmpl.values.map((val) => (
                  <span key={val} className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-800/80 text-surface-200 border border-surface-700">
                    {val}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-surface-800/80 text-xs text-surface-400 flex items-center justify-between">
              <span>{tmpl.values.length} variant options</span>
              <Tag className="w-3.5 h-3.5 text-brand-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">New Variation Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Template Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Tyre Width & Profile"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Variation Values (Comma-Separated) *</Label>
              <Input 
                value={valuesInput} 
                onChange={(e) => setValuesInput(e.target.value)} 
                placeholder="e.g. 90/90-17, 100/90-17, 130/70-17"
                className="bg-surface-800 border-surface-700 text-white"
              />
              <p className="text-xs text-surface-400">Separate multiple options with commas</p>
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
            <DialogTitle className="text-xl font-display font-bold">Edit Variation Template</DialogTitle>
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
              <Label className="text-surface-200">Variation Values (Comma-Separated) *</Label>
              <Input 
                value={valuesInput} 
                onChange={(e) => setValuesInput(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white"
              />
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
            <DialogTitle className="text-lg font-display text-red-400">Delete Template?</DialogTitle>
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
