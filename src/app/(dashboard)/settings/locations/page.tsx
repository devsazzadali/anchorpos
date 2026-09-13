"use client"

import { useState } from "react"
import { 
  Plus, MapPin, Phone, MoreHorizontal, FileEdit, Trash2, 
  Building2, CheckCircle, XCircle, Check 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export interface LocationItem {
  id: string
  name: string
  code: string
  city: string
  address: string
  phone: string
  active: boolean
  invoiceScheme: string
}

const INITIAL_LOCATIONS: LocationItem[] = [
  { id: '1', name: 'RANGPUR BIKE PARLOUR', code: 'BL0001', city: 'RANGPUR', address: 'Station Road, Rangpur', phone: '+8801700000000', active: true, invoiceScheme: 'Default' },
]

export default function LocationsPage() {
  const { toast } = useToast()
  const [locations, setLocations] = useState<LocationItem[]>(INITIAL_LOCATIONS)
  const [open, setOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState<LocationItem | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")

  const handleSaveLocation = () => {
    if (!name.trim() || !code.trim()) {
      toast({ title: "Required Fields", description: "Location name and code are mandatory.", variant: "destructive" })
      return
    }

    playClick()
    const newLoc: LocationItem = {
      id: `BL-${Date.now()}`,
      name,
      code,
      address: address || "City Center",
      city: city || "Rangpur",
      phone: phone || "+880 1700-000000",
      active: true,
      invoiceScheme: "Default",
    }

    setLocations(prev => [...prev, newLoc])
    setOpen(false)
    setName("")
    setCode("")
    setAddress("")
    setCity("")
    setPhone("")

    toast({
      title: "Location Added",
      description: `${newLoc.name} (${newLoc.code}) registered successfully.`,
    })
  }

  const handleOpenEdit = (loc: LocationItem) => {
    playClick()
    setSelectedLoc(loc)
    setName(loc.name)
    setCode(loc.code)
    setAddress(loc.address)
    setCity(loc.city)
    setPhone(loc.phone)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedLoc) return
    playClick()
    setLocations(prev => prev.map(l => {
      if (l.id === selectedLoc.id) {
        return {
          ...l,
          name,
          code,
          address,
          city,
          phone,
        }
      }
      return l
    }))

    setIsEditOpen(false)
    toast({ title: "Location Updated", description: "Changes saved successfully." })
  }

  const handleDelete = () => {
    if (!selectedLoc) return
    playClick()
    setLocations(prev => prev.filter(l => l.id !== selectedLoc.id))
    setIsDeleteOpen(false)
    toast({ title: "Location Removed", description: `${selectedLoc.name} deleted.` })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Business Locations</h2>
          <p className="text-surface-400 mt-1">Manage branches and physical outlets for your business</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => playClick()} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              <Plus className="w-4 h-4 mr-2" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-display">Add New Branch / Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-surface-200">Location Name *</Label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Modern Branch" 
                    className="bg-surface-800 border-surface-700 text-white" 
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-surface-200">Location Code *</Label>
                  <Input 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="BL0002" 
                    className="bg-surface-800 border-surface-700 text-white font-mono" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-surface-200">Street Address</Label>
                <Input 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Modern More, Rangpur" 
                  className="bg-surface-800 border-surface-700 text-white" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-surface-200">City</Label>
                  <Input 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Rangpur" 
                    className="bg-surface-800 border-surface-700 text-white" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-surface-200">Contact Phone</Label>
                  <Input 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17XXXXXXXX" 
                    className="bg-surface-800 border-surface-700 text-white" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)} className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-white">
                  Cancel
                </Button>
                <Button onClick={handleSaveLocation} className="bg-brand-600 hover:bg-brand-500 text-white">
                  Save Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => (
          <div key={loc.id} className={`glass-panel rounded-2xl p-5 space-y-4 relative border-t-4 ${loc.active ? 'border-t-brand-500' : 'border-t-surface-600'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${loc.active ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-700/50 text-surface-400'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{loc.name}</h3>
                  <p className="text-xs font-mono text-surface-400">{loc.code}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-surface-800 border-surface-700 text-surface-200 w-44">
                  <DropdownMenuItem onClick={() => handleOpenEdit(loc)} className="hover:bg-surface-700 cursor-pointer text-xs">
                    <FileEdit className="mr-2 h-4 w-4 text-blue-400" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-surface-700" />
                  <DropdownMenuItem onClick={() => { playClick(); setSelectedLoc(loc); setIsDeleteOpen(true) }} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer text-xs">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-surface-300">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-surface-500" />
                <span>{loc.address}, {loc.city}</span>
              </div>
              <div className="flex items-center gap-2 text-surface-300">
                <Phone className="w-4 h-4 shrink-0 text-surface-500" />
                <span>{loc.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-800 flex items-center justify-between">
              <span className="text-[11px] text-surface-400">Invoice: <span className="text-brand-400 font-mono font-semibold">{loc.invoiceScheme}</span></span>
              <div className="flex items-center gap-1.5">
                {loc.active
                  ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-medium">Active Branch</span></>
                  : <><XCircle className="w-3.5 h-3.5 text-surface-500" /><span className="text-xs text-surface-500">Inactive</span></>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Edit Location */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg bg-surface-900 border-surface-700 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Edit Branch Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Location Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-800 border-surface-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label>Location Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} className="bg-surface-800 border-surface-700 text-white font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Street Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-surface-800 border-surface-700 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-surface-800 border-surface-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-surface-800 border-surface-700 text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-white">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display text-red-400">Delete Location?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-surface-400 mt-2">
            Are you sure you want to remove <span className="text-white font-bold">{selectedLoc?.name}</span>?
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1 bg-surface-800 border-surface-700 text-white">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white">
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
