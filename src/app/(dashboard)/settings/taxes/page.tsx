"use client"

import { useState } from "react"
import { Plus, Percent, MoreHorizontal, FileEdit, Trash2, CheckCircle2, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface TaxRate {
  id: string
  name: string
  rate: number
  type: "percentage" | "fixed"
  isDefault: boolean
}

const INITIAL_TAX_RATES: TaxRate[] = [
  { id: '1', name: 'Standard Bangladesh VAT', rate: 15, type: 'percentage', isDefault: true },
  { id: '2', name: 'Reduced Workshop Service VAT', rate: 5, type: 'percentage', isDefault: false },
  { id: '3', name: 'Zero Rated / Exempted Items', rate: 0, type: 'percentage', isDefault: false },
  { id: '4', name: 'Automotive Supplementary Duty', rate: 20, type: 'percentage', isDefault: false },
]

export default function TaxRatesPage() {
  const { toast } = useToast()
  const [taxes, setTaxes] = useState<TaxRate[]>(INITIAL_TAX_RATES)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaxRate | null>(null)

  // Form
  const [name, setName] = useState("")
  const [rate, setRate] = useState<number>(15)
  const [type, setType] = useState<"percentage" | "fixed">("percentage")
  const [isDefault, setIsDefault] = useState(false)

  const filtered = taxes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setRate(15)
    setType("percentage")
    setIsDefault(false)
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter tax name.", variant: "destructive" })
      return
    }
    const newTax: TaxRate = {
      id: String(Date.now()),
      name,
      rate: Number(rate) || 0,
      type,
      isDefault,
    }

    if (isDefault) {
      setTaxes([newTax, ...taxes.map(t => ({ ...t, isDefault: false }))])
    } else {
      setTaxes([newTax, ...taxes])
    }

    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Tax Rate Created",
      description: `Tax rate "${name}" (${rate}%) created.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (tax: TaxRate) => {
    playClick()
    setEditingTax(tax)
    setName(tax.name)
    setRate(tax.rate)
    setType(tax.type)
    setIsDefault(tax.isDefault)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingTax || !name.trim()) return
    setTaxes(taxes.map(t => {
      if (t.id === editingTax.id) {
        return { ...t, name, rate: Number(rate) || 0, type, isDefault }
      }
      return isDefault ? { ...t, isDefault: false } : t
    }))
    setIsEditOpen(false)
    setEditingTax(null)
    playSuccess()
    toast({
      title: "Tax Rate Updated",
      description: `Tax rate updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setTaxes(taxes.filter(t => t.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Tax Rate Deleted",
      description: `Removed "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleSetDefault = (tax: TaxRate) => {
    playClick()
    setTaxes(taxes.map(t => ({
      ...t,
      isDefault: t.id === tax.id
    })))
    toast({
      title: "Default Tax Updated",
      description: `"${tax.name}" is now default tax applied to new products.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(t => ({
      ID: t.id,
      "Tax Name": t.name,
      "Rate Value": t.type === 'percentage' ? `${t.rate}%` : `৳ ${t.rate}`,
      Type: t.type,
      "Is Default": t.isDefault ? "Yes" : "No",
    }))
    exportToCsv("rangpur_bike_tax_rates.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} tax rates.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Tax Rates</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              NBR Bangladesh
            </span>
          </div>
          <p className="text-surface-400 mt-1">Configure VAT, SD, and tax schemes applied to POS sales and product purchases</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Tax Rate
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search tax rates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> tax rates
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tax Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Rate</th>
                <th className="px-6 py-4 text-center">Default</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((tax) => (
                <tr key={tax.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        <Percent className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {tax.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 rounded bg-surface-800 text-surface-300 font-mono capitalize border border-surface-700">
                      {tax.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-xl font-bold text-white">
                      {tax.rate}<span className="text-sm text-surface-400 ml-0.5">{tax.type === 'percentage' ? '%' : '৳'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {tax.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Default
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(tax)}
                        className="text-xs text-surface-400 hover:text-white h-7"
                      >
                        Set Default
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-surface-800 border-surface-700 text-surface-200 w-44">
                        <DropdownMenuItem 
                          onClick={() => handleOpenEdit(tax)}
                          className="hover:bg-surface-700 cursor-pointer"
                        >
                          <FileEdit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {!tax.isDefault && (
                          <>
                            <DropdownMenuSeparator className="bg-surface-700" />
                            <DropdownMenuItem 
                              onClick={() => { playClick(); setDeleteTarget(tax) }}
                              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">New Tax Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Tax Scheme Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Standard VAT" 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Rate</Label>
                <Input 
                  type="number" 
                  value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))} 
                  min={0} 
                  max={100} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Type</Label>
                <Select value={type} onValueChange={(v: "percentage" | "fixed") => setType(v)}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed BDT (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 border border-surface-700/60">
              <div>
                <p className="text-sm font-medium text-white">Set as Default</p>
                <p className="text-xs text-surface-400">Auto-apply to newly created items</p>
              </div>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} className="data-[state=checked]:bg-brand-600" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Tax Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Tax Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Tax Scheme Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Rate</Label>
                <Input 
                  type="number" 
                  value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))} 
                  min={0} 
                  max={100} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Type</Label>
                <Select value={type} onValueChange={(v: "percentage" | "fixed") => setType(v)}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed BDT (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 border border-surface-700/60">
              <div>
                <p className="text-sm font-medium text-white">Set as Default</p>
                <p className="text-xs text-surface-400">Auto-apply to newly created items</p>
              </div>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} className="data-[state=checked]:bg-brand-600" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Tax Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Tax Scheme?</DialogTitle>
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
