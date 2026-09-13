"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Search, Download, Award, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface Brand {
  id: string
  name: string
  origin: string
  desc: string
  status: "active" | "inactive"
  productsCount: number
}

const INITIAL_BRANDS: Brand[] = [
  { id: '1', name: 'Motul', origin: 'France', desc: '100% Synthetic 4T Engine Lubricants & Fork Oils', status: 'active', productsCount: 14 },
  { id: '2', name: 'Yamaha Genuine Parts', origin: 'Japan', desc: 'OEM Factory Replacement Parts, Cables & Filters', status: 'active', productsCount: 22 },
  { id: '3', name: 'Brembo', origin: 'Italy', desc: 'High Performance Braking Calipers, Rotors & Pads', status: 'active', productsCount: 9 },
  { id: '4', name: 'NGK Spark Plugs', origin: 'Japan', desc: 'Laser Iridium & Standard Motorcycle Spark Plugs', status: 'active', productsCount: 18 },
  { id: '5', name: 'DID Racing Chain', origin: 'Japan', desc: 'Heavy Duty Sealed X-Ring & O-Ring Drive Chains', status: 'active', productsCount: 11 },
  { id: '6', name: 'Castrol Power1', origin: 'United Kingdom', desc: 'Advanced 4-Stroke Motorcycle Engine Lubricants', status: 'active', productsCount: 8 },
  { id: '7', name: 'KYT Helmets', origin: 'Indonesia', desc: 'ECE 22.05 & DOT Certified Full Face Aerodynamic Helmets', status: 'active', productsCount: 15 },
  { id: '8', name: 'Michelin BD', origin: 'France', desc: 'Pilot Street 2 High Grip Tubeless Motorcycle Tyres', status: 'active', productsCount: 12 },
]

export default function BrandsPage() {
  const { toast } = useToast()
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)

  // Form
  const [name, setName] = useState("")
  const [origin, setOrigin] = useState("Japan")
  const [desc, setDesc] = useState("")
  const [status, setStatus] = useState<"active" | "inactive">("active")

  const filtered = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.origin.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setOrigin("Japan")
    setDesc("")
    setStatus("active")
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter brand name.", variant: "destructive" })
      return
    }
    const newBrand: Brand = {
      id: String(Date.now()),
      name,
      origin,
      desc: desc || "Authorized Manufacturer Brand",
      status,
      productsCount: 0,
    }
    setBrands([newBrand, ...brands])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Brand Added",
      description: `Brand "${name}" added to Rangpur Bike Parlour inventory.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (b: Brand) => {
    playClick()
    setEditingBrand(b)
    setName(b.name)
    setOrigin(b.origin)
    setDesc(b.desc)
    setStatus(b.status)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingBrand || !name.trim()) return
    setBrands(brands.map(b => 
      b.id === editingBrand.id ? { ...b, name, origin, desc, status } : b
    ))
    setIsEditOpen(false)
    setEditingBrand(null)
    playSuccess()
    toast({
      title: "Brand Updated",
      description: `Brand "${name}" has been updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setBrands(brands.filter(b => b.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Brand Removed",
      description: `Removed "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(b => ({
      ID: b.id,
      "Brand Name": b.name,
      Origin: b.origin,
      Description: b.desc,
      Status: b.status,
      "Active Products": b.productsCount,
    }))
    exportToCsv("rangpur_bike_brands.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} brands.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Brands</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Manufacturers
            </span>
          </div>
          <p className="text-surface-400 mt-1">Manage OEM brands, lubricant makers, and helmet suppliers</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Brand
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search brands by name, origin, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> brands
        </div>
      </div>

      {/* Grid of Luxury Brand Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(brand => (
          <div 
            key={brand.id} 
            className="glass-panel rounded-xl p-5 border border-surface-800 hover:border-brand-500/50 hover:shadow-glow transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/30 via-surface-800 to-surface-900 border border-brand-500/30 flex items-center justify-center text-xl font-display font-bold text-white shadow-inner group-hover:scale-105 transition-transform">
                  {brand.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleOpenEdit(brand)}
                    className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                    title="Edit Brand"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { playClick(); setDeleteTarget(brand) }}
                    className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete Brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">{brand.name}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-800 text-surface-300 border border-surface-700">
                  {brand.origin}
                </span>
              </div>
              <p className="text-xs text-surface-400 leading-relaxed mb-4 line-clamp-2">{brand.desc}</p>
            </div>

            <div className="pt-3 border-t border-surface-800/80 flex items-center justify-between text-xs">
              <span className="text-surface-400 font-medium">
                Catalog: <strong className="text-white font-mono">{brand.productsCount}</strong> SKUs
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                brand.status === 'active' 
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' 
                  : 'bg-surface-800 text-surface-400'
              }`}>
                {brand.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Brand Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Add Manufacturer Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Brand Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Michelin BD"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Country of Origin</Label>
              <Input 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)} 
                placeholder="e.g. France, Japan"
                className="bg-surface-800 border-surface-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Description</Label>
              <Input 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                placeholder="e.g. Performance Tyres and Tubes"
                className="bg-surface-800 border-surface-700 text-white"
              />
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
              Save Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Brand Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Country of Origin</Label>
              <Input 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Description</Label>
              <Input 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white"
              />
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
              Update Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Brand?</DialogTitle>
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
