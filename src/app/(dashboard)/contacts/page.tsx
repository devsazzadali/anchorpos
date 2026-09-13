"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { 
  Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, 
  Mail, Phone, Download, Users, Building, Check, UserCheck 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export interface ContactItem {
  id: string
  type: 'customer' | 'supplier'
  name: string
  contact_id: string
  mobile: string
  email: string
  due: number // paise
  status: 'active' | 'inactive'
}

const INITIAL_CONTACTS: ContactItem[] = [
  { id: '1', type: 'customer', name: 'Walk-In Customer', contact_id: 'CO0001', mobile: '-', email: '-', due: 0, status: 'active' },
  { id: '2', type: 'supplier', name: 'Standard Bike Supply', contact_id: 'CO0002', mobile: '+8801700000002', email: 'supply@standardbike.bd', due: 0, status: 'active' },
  { id: '3', type: 'customer', name: 'Rahim Chowdhury', contact_id: 'CO0003', mobile: '+8801711223344', email: 'rahim@example.com', due: 0, status: 'active' },
  { id: '4', type: 'customer', name: 'Karim Ullah (Bike Garage)', contact_id: 'CO0004', mobile: '+8801819556677', email: 'karim@garage.bd', due: 350000, status: 'active' },
  { id: '5', type: 'supplier', name: 'Motul Bangladesh Distributors', contact_id: 'CO0005', mobile: '+8801911998877', email: 'dist@motul.bd', due: 0, status: 'active' },
]

export default function ContactsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const initialTab = typeParam === 'supplier' ? 'suppliers' : typeParam === 'customer' ? 'customers' : 'all'
  
  const [contacts, setContacts] = useState<ContactItem[]>(INITIAL_CONTACTS)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [search, setSearch] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null)

  // Form State
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<'customer' | 'supplier'>('customer')
  const [formMobile, setFormMobile] = useState("")
  const [formEmail, setFormEmail] = useState("")

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchTab =
        activeTab === "all" ||
        (activeTab === "customers" && c.type === "customer") ||
        (activeTab === "suppliers" && c.type === "supplier")

      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contact_id.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.toLowerCase().includes(search.toLowerCase())

      return matchTab && matchSearch
    })
  }, [contacts, activeTab, search])

  const handleExport = () => {
    playClick()
    exportToCsv("Contacts_List_Rangpur_Bike_Parlour", [
      { header: "Contact ID", key: "contact_id" },
      { header: "Contact Type", key: "type" },
      { header: "Name / Company", key: "name" },
      { header: "Mobile", key: "mobile" },
      { header: "Email", key: "email" },
      { header: "Outstanding Due (Paise)", key: "due" },
      { header: "Status", key: "status" },
    ], filtered)
    toast({ title: "Exported Contacts", description: "CSV file downloaded." })
  }

  const handleSaveContact = () => {
    if (!formName.trim()) {
      toast({ title: "Name Required", description: "Please enter a contact name.", variant: "destructive" })
      return
    }

    playClick()
    const newContact: ContactItem = {
      id: `CO-${Date.now()}`,
      type: formType,
      name: formName,
      contact_id: `CO000${contacts.length + 1}`,
      mobile: formMobile || "-",
      email: formEmail || "-",
      due: 0,
      status: "active",
    }

    setContacts(prev => [newContact, ...prev])
    setIsAddOpen(false)
    setFormName("")
    setFormMobile("")
    setFormEmail("")
    toast({ title: "Contact Created", description: `${newContact.name} saved successfully.` })
  }

  const handleOpenEdit = (contact: ContactItem) => {
    playClick()
    setSelectedContact(contact)
    setFormName(contact.name)
    setFormType(contact.type)
    setFormMobile(contact.mobile === "-" ? "" : contact.mobile)
    setFormEmail(contact.email === "-" ? "" : contact.email)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedContact) return
    playClick()
    setContacts(prev => prev.map(c => {
      if (c.id === selectedContact.id) {
        return {
          ...c,
          name: formName,
          type: formType,
          mobile: formMobile || "-",
          email: formEmail || "-",
        }
      }
      return c
    }))

    setIsEditOpen(false)
    toast({ title: "Contact Updated", description: "Changes saved successfully." })
  }

  const handleDelete = () => {
    if (!selectedContact) return
    playClick()
    setContacts(prev => prev.filter(c => c.id !== selectedContact.id))
    setIsDeleteOpen(false)
    toast({ title: "Contact Removed", description: `${selectedContact.name} deleted.` })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Contacts Directory</h2>
          <p className="text-surface-400 mt-1">Manage retail customers, wholesale garages, and distributors</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700">
            <Download className="w-4 h-4 mr-2 text-brand-400" /> Export CSV
          </Button>
          <Button onClick={() => { playClick(); setIsAddOpen(true) }} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-4 border-b border-surface-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <TabsList className="bg-surface-900 border border-surface-800 p-1 rounded-xl shrink-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white text-surface-400 text-xs">
                All Contacts ({contacts.length})
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white text-surface-400 text-xs">
                Customers ({contacts.filter(c => c.type === 'customer').length})
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white text-surface-400 text-xs">
                Suppliers ({contacts.filter(c => c.type === 'supplier').length})
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <Input 
                placeholder="Search by contact name, ID or phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 h-10 w-full text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Contact ID & Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Mobile Phone</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium text-right">Outstanding Balance</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
                      No contacts found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white group-hover:text-brand-300 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-xs font-mono text-surface-400 mt-0.5">{c.contact_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          c.type === 'customer' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-surface-300">{c.mobile}</td>
                      <td className="px-6 py-4 text-xs text-surface-400">{c.email}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs">
                        <span className={c.due > 0 ? "text-red-400 font-bold" : "text-surface-500"}>
                          {c.due > 0 ? formatCurrency(c.due) : "৳ 0.00"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-surface-800 border-surface-700 text-surface-200 w-40 shadow-xl">
                            <DropdownMenuItem onClick={() => handleOpenEdit(c)} className="hover:bg-surface-700 cursor-pointer text-xs">
                              <FileEdit className="mr-2 h-4 w-4 text-blue-400" /> Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-surface-700" />
                            <DropdownMenuItem 
                              onClick={() => { playClick(); setSelectedContact(c); setIsDeleteOpen(true) }}
                              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer text-xs"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Tabs>
      </div>

      {/* Modal: Add Contact */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 text-xs">
            <div>
              <Label className="text-surface-300">Contact Classification *</Label>
              <div className="flex gap-3 mt-1.5">
                <Button
                  type="button"
                  variant={formType === 'customer' ? 'default' : 'outline'}
                  onClick={() => setFormType('customer')}
                  className={`flex-1 ${formType === 'customer' ? 'bg-brand-600' : 'border-surface-700 bg-surface-800 text-white'}`}
                >
                  Customer (Buyer)
                </Button>
                <Button
                  type="button"
                  variant={formType === 'supplier' ? 'default' : 'outline'}
                  onClick={() => setFormType('supplier')}
                  className={`flex-1 ${formType === 'supplier' ? 'bg-brand-600' : 'border-surface-700 bg-surface-800 text-white'}`}
                >
                  Supplier (Vendor)
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-surface-300">Name / Business Entity *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Master Motors Rangpur"
                className="bg-surface-800 border-surface-700 text-white mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-surface-300">Mobile Phone</Label>
              <Input
                value={formMobile}
                onChange={(e) => setFormMobile(e.target.value)}
                placeholder="+880 17XXXXXXXX"
                className="bg-surface-800 border-surface-700 text-white mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-surface-300">Email Address (Optional)</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="contact@domain.com"
                className="bg-surface-800 border-surface-700 text-white mt-1"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-white">
                Cancel
              </Button>
              <Button onClick={handleSaveContact} className="bg-brand-600 hover:bg-brand-500 text-white">
                Save Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Contact */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 text-xs">
            <div>
              <Label className="text-surface-300">Name / Company</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-surface-800 border-surface-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-surface-300">Mobile</Label>
              <Input
                value={formMobile}
                onChange={(e) => setFormMobile(e.target.value)}
                className="bg-surface-800 border-surface-700 text-white mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-surface-300">Email</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="bg-surface-800 border-surface-700 text-white mt-1"
              />
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
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-display text-red-400">Delete Contact?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-surface-400 mt-2">
            Are you sure you want to remove <span className="text-white font-bold">{selectedContact?.name}</span>?
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
