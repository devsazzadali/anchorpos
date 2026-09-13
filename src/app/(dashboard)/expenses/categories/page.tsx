"use client"

import { useState } from "react"
import { FolderTree, Plus, Search, Edit2, Trash2, CheckCircle2, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

interface ExpenseCategory {
  id: string
  name: string
  code: string
  description: string
  totalSpent: number
}

const INITIAL_CATEGORIES: ExpenseCategory[] = [
  {
    id: "CAT-001",
    name: "Office Supplies",
    code: "EXP-CAT-01",
    description: "Stationery, POS receipt rolls, printer ribbons, packaging tape",
    totalSpent: 500.00
  },
  {
    id: "CAT-002",
    name: "Utilities & Electricity",
    code: "EXP-CAT-02",
    description: "Shop electricity bill, internet, drinking water dispenser",
    totalSpent: 1200.00
  },
  {
    id: "CAT-003",
    name: "Workshop Maintenance",
    code: "EXP-CAT-03",
    description: "Bike lift maintenance, compressor oil, tool servicing",
    totalSpent: 0.00
  },
  {
    id: "CAT-004",
    name: "Staff Welfare",
    code: "EXP-CAT-04",
    description: "Tea, refreshments, technician emergency medical allowance",
    totalSpent: 0.00
  }
]

export default function ExpenseCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<ExpenseCategory[]>(INITIAL_CATEGORIES)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")

  const handleOpenAdd = () => {
    playClick()
    setEditingCategory(null)
    setName("")
    setCode(`EXP-CAT-0${categories.length + 1}`)
    setDescription("")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat: ExpenseCategory) => {
    playClick()
    setEditingCategory(cat)
    setName(cat.name)
    setCode(cat.code)
    setDescription(cat.description)
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    playClick()

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? {
        ...c,
        name,
        code,
        description
      } : c))
      toast({
        title: "Category Updated",
        description: `Expense category "${name}" updated.`
      })
    } else {
      const newCat: ExpenseCategory = {
        id: `CAT-00${categories.length + 1}`,
        name,
        code: code || `EXP-CAT-0${categories.length + 1}`,
        description,
        totalSpent: 0.00
      }
      setCategories([...categories, newCat])
      toast({
        title: "Category Created",
        description: `Expense category "${name}" created.`
      })
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    playClick()
    setCategories(prev => prev.filter(c => c.id !== id))
    setDeletingId(null)
    toast({
      title: "Category Deleted",
      description: "Expense classification removed.",
      variant: "destructive"
    })
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Expense_Categories_Rangpur_Bike_Parlour", [
      { header: "Category Code", key: "code" },
      { header: "Category Name", key: "name" },
      { header: "Description", key: "description" },
      { header: "Total Spent (BDT)", key: "totalSpent" }
    ], filtered)
    toast({
      title: "Export Completed",
      description: "Expense categories exported to CSV."
    })
  }

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Expense Categories</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Rangpur Bike Parlour
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Organize operational expenditures and overhead accounts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            className="border-surface-700 bg-surface-900/50 hover:bg-surface-800 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2 text-brand-400" /> Export CSV
          </Button>

          <Button onClick={handleOpenAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search category by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="text-xs text-surface-400">
          Total Categories: <span className="text-white font-bold">{categories.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Total Spent (৳)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-brand-400" />
                      {cat.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-brand-400">{cat.code}</td>
                  <td className="px-6 py-4 text-xs text-surface-400 max-w-sm">{cat.description}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-white">
                    ৳ {cat.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(cat)}
                        className="h-8 w-8 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { playClick(); setDeletingId(cat.id) }}
                        className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-surface-700 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-brand-400" />
                {editingCategory ? "Edit Expense Category" : "Add Expense Category"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Workshop Tooling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Category Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe items covered under this category..."
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-surface-700 text-surface-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
                  {editingCategory ? "Update Category" : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-red-500/40 space-y-4 animate-scale-in">
            <h4 className="text-base font-bold text-white">Delete Expense Category?</h4>
            <p className="text-xs text-surface-300">
              Are you sure you want to delete this category? Past recorded expenses will remain logged under general accounts.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setDeletingId(null)}
                className="border-surface-700 text-surface-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleDelete(deletingId)}
                className="bg-red-600 hover:bg-red-500 text-white shadow-glow"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
