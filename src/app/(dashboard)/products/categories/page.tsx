"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Search, Download, FolderTree, CheckCircle2, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface Category {
  id: string
  name: string
  code: string
  status: "active" | "inactive"
  parent: string | null
  itemCount: number
}

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Engine Oil & Lubricants', code: 'LUB-01', status: 'active', parent: null, itemCount: 14 },
  { id: '2', name: 'Synthetic Oil', code: 'LUB-SYN', status: 'active', parent: 'Engine Oil & Lubricants', itemCount: 8 },
  { id: '3', name: 'Spare Parts & Consumables', code: 'SP-01', status: 'active', parent: null, itemCount: 28 },
  { id: '4', name: 'Brake Systems & Fluids', code: 'BRK-01', status: 'active', parent: 'Spare Parts & Consumables', itemCount: 12 },
  { id: '5', name: 'Drive Chains & Sprockets', code: 'CHN-01', status: 'active', parent: 'Spare Parts & Consumables', itemCount: 9 },
  { id: '6', name: 'Rider Gear & Helmets', code: 'RGR-01', status: 'active', parent: null, itemCount: 16 },
  { id: '7', name: 'Electrical & Spark Plugs', code: 'ELC-01', status: 'active', parent: null, itemCount: 11 },
]

export default function CategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [parent, setParent] = useState<string>("none")
  const [status, setStatus] = useState<"active" | "inactive">("active")

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setCode(`CAT-0${categories.length + 1}`)
    setParent("none")
    setStatus("active")
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter category name.", variant: "destructive" })
      return
    }
    const newCat: Category = {
      id: String(Date.now()),
      name,
      code: code || `CAT-${Date.now().toString().slice(-4)}`,
      status,
      parent: parent === "none" ? null : parent,
      itemCount: 0,
    }
    setCategories([newCat, ...categories])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Category Created",
      description: `Category "${name}" added to Rangpur Bike Parlour catalog.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (cat: Category) => {
    playClick()
    setEditingCategory(cat)
    setName(cat.name)
    setCode(cat.code)
    setParent(cat.parent || "none")
    setStatus(cat.status)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingCategory || !name.trim()) return
    setCategories(categories.map(c => 
      c.id === editingCategory.id ? { ...c, name, code, parent: parent === "none" ? null : parent, status } : c
    ))
    setIsEditOpen(false)
    setEditingCategory(null)
    playSuccess()
    toast({
      title: "Category Updated",
      description: `Category "${name}" has been updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setCategories(categories.filter(c => c.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Category Deleted",
      description: `Removed "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(c => ({
      ID: c.id,
      "Category Name": c.name,
      "Category Code": c.code,
      "Parent Category": c.parent || "None (Root)",
      Status: c.status,
      "Item Count": c.itemCount,
    }))
    exportToCsv("rangpur_bike_categories.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} categories.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const parentOptions = categories.filter(c => !c.parent)

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Categories</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Catalog
            </span>
          </div>
          <p className="text-surface-400 mt-1">Manage product hierarchy, sub-categories, and organization</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search categories by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> of {categories.length} categories
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Category Code</th>
                <th className="px-6 py-4">Parent Category</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-400">
                    No categories found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(cat => (
                  <tr key={cat.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${cat.parent ? 'bg-surface-800 text-surface-400 ml-4' : 'bg-brand-500/15 text-brand-400'}`}>
                          {cat.parent ? <Layers className="w-4 h-4" /> : <FolderTree className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-white font-semibold flex items-center gap-2">
                            {cat.name}
                          </div>
                          {cat.parent && (
                            <span className="text-xs text-surface-500">Sub-category of {cat.parent}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-surface-300 text-xs font-semibold">{cat.code}</td>
                    <td className="px-6 py-4 text-surface-300 text-sm">{cat.parent || "—"}</td>
                    <td className="px-6 py-4 text-center font-mono text-surface-200">{cat.itemCount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cat.status === 'active' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' 
                          : 'bg-surface-800 text-surface-400'
                      }`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEdit(cat)}
                          className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                          title="Edit Category"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { playClick(); setDeleteTarget(cat) }}
                          className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Category Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Braking Systems"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Category Code</Label>
              <Input 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="e.g. BRK-01"
                className="bg-surface-800 border-surface-700 text-white font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Parent Category</Label>
              <Select value={parent} onValueChange={setParent}>
                <SelectTrigger className="bg-surface-800 border-surface-700 text-white">
                  <SelectValue placeholder="Select Parent Category" />
                </SelectTrigger>
                <SelectContent className="bg-surface-800 border-surface-700 text-white">
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {parentOptions.map(p => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Status</Label>
              <Select value={status} onValueChange={(v: "active" | "inactive") => setStatus(v)}>
                <SelectTrigger className="bg-surface-800 border-surface-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-800 border-surface-700 text-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Category Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Category Code</Label>
              <Input 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Parent Category</Label>
              <Select value={parent} onValueChange={setParent}>
                <SelectTrigger className="bg-surface-800 border-surface-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-800 border-surface-700 text-white">
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {parentOptions.filter(p => p.id !== editingCategory?.id).map(p => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Status</Label>
              <Select value={status} onValueChange={(v: "active" | "inactive") => setStatus(v)}>
                <SelectTrigger className="bg-surface-800 border-surface-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-800 border-surface-700 text-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Category?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>? This action cannot be undone.
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
