"use client"

import { useState } from "react"
import { ShieldCheck, Plus, Search, MoreHorizontal, Edit2, Trash2, Download, CheckCircle2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface Role {
  id: string
  name: string
  description: string
  usersCount: number
  isSystem: boolean
  permissions: string[]
}

const INITIAL_ROLES: Role[] = [
  { 
    id: "1", 
    name: "Admin#1", 
    description: "Super Administrator with full permissions across all 10 modules, financial statements, and configuration", 
    usersCount: 1, 
    isSystem: true,
    permissions: ["POS", "Products", "Purchases", "Sales", "Expenses", "Accounts", "Reports", "Settings", "Users"]
  },
  { 
    id: "2", 
    name: "Store Manager", 
    description: "Full operational access to sales, purchasing, inventory receiving, and customer ledgers", 
    usersCount: 2, 
    isSystem: false,
    permissions: ["POS", "Products", "Purchases", "Sales", "Expenses", "Reports"]
  },
  { 
    id: "3", 
    name: "Cashier", 
    description: "POS terminal checkout, barcode scanning, cash register opening/closing, and thermal receipt print", 
    usersCount: 3, 
    isSystem: false,
    permissions: ["POS", "Sales"]
  },
  { 
    id: "4", 
    name: "Service Workshop Mechanic", 
    description: "Workshop job cards, spare parts requisition, bike servicing diagnostic entries", 
    usersCount: 2, 
    isSystem: false,
    permissions: ["Products", "Sales"]
  },
]

const ALL_MODULES = [
  "POS Terminal",
  "Product Catalog",
  "Purchases & Stock In",
  "Sales & Quotations",
  "Expenses & Bills",
  "Double-Entry Accounting",
  "Financial Reports",
  "User Management",
  "System Settings",
]

export default function RolesPage() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES)
  const [search, setSearch] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)

  // Form
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["POS Terminal", "Sales & Quotations"])

  const filtered = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    role.description.toLowerCase().includes(search.toLowerCase())
  )

  const togglePermission = (mod: string) => {
    playClick()
    if (selectedPermissions.includes(mod)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== mod))
    } else {
      setSelectedPermissions([...selectedPermissions, mod])
    }
  }

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setDescription("")
    setSelectedPermissions(["POS Terminal", "Sales & Quotations"])
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter role title.", variant: "destructive" })
      return
    }
    const newRole: Role = {
      id: String(Date.now()),
      name,
      description: description || "Custom user role",
      usersCount: 0,
      isSystem: false,
      permissions: selectedPermissions,
    }
    setRoles([...roles, newRole])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Role Created",
      description: `Role "${name}" created with ${selectedPermissions.length} permissions.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (r: Role) => {
    playClick()
    setEditingRole(r)
    setName(r.name)
    setDescription(r.description)
    setSelectedPermissions(r.permissions)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingRole || !name.trim()) return
    setRoles(roles.map(r =>
      r.id === editingRole.id ? { ...r, name, description, permissions: selectedPermissions } : r
    ))
    setIsEditOpen(false)
    setEditingRole(null)
    playSuccess()
    toast({
      title: "Role Updated",
      description: `Role permissions updated.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.isSystem) {
      toast({ title: "Protected Role", description: "System roles cannot be deleted.", variant: "destructive" })
      setDeleteTarget(null)
      return
    }
    setRoles(roles.filter(r => r.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Role Deleted",
      description: `Deleted role "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(r => ({
      ID: r.id,
      "Role Name": r.name,
      Description: r.description,
      "Users Assigned": r.usersCount,
      "System Protected": r.isSystem ? "Yes" : "No",
      Permissions: r.permissions.join(", "),
    }))
    exportToCsv("rangpur_bike_roles.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} roles.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">User Roles &amp; Permissions</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              RBAC Security
            </span>
          </div>
          <p className="text-surface-400 mt-1">Configure role-based access control and fine-grained module privileges</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Role
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center border border-surface-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input 
            placeholder="Search roles or permissions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-900/80 border-surface-700 text-white focus-visible:ring-brand-500 h-10"
          />
        </div>
        <div className="text-xs text-surface-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> roles
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-900/80 text-surface-400 text-xs uppercase border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Role Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Assigned Users</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((role) => (
                <tr key={role.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/15 text-brand-400">
                        {role.isSystem ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-brand-300 transition-colors">{role.name}</span>
                          {role.isSystem && (
                            <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded border border-brand-500/20 font-mono">
                              System
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-surface-400 mt-1">
                          {role.permissions.length} module permissions
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-300 text-xs max-w-md leading-relaxed">{role.description}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-white">{role.usersCount}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(role)}
                        className="h-8 w-8 text-surface-400 hover:text-white hover:bg-surface-800"
                        title="Edit Permissions"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { playClick(); setDeleteTarget(role) }}
                          className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Role"
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
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">New Role &amp; Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Role Title *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Inventory Controller"
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Responsibilities and operational scope..."
                className="bg-surface-800 border-surface-700 text-white"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Module Access Privileges</Label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-800/40 border border-surface-700 max-h-48 overflow-y-auto">
                {ALL_MODULES.map(mod => (
                  <label 
                    key={mod} 
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-700/50 cursor-pointer text-xs"
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedPermissions.includes(mod)}
                      onChange={() => togglePermission(mod)}
                      className="rounded bg-surface-900 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span className="text-white">{mod}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Role &amp; Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Role Title *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={editingRole?.isSystem}
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Module Access Privileges</Label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-800/40 border border-surface-700 max-h-48 overflow-y-auto">
                {ALL_MODULES.map(mod => (
                  <label 
                    key={mod} 
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-700/50 cursor-pointer text-xs"
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedPermissions.includes(mod)}
                      onChange={() => togglePermission(mod)}
                      disabled={editingRole?.isSystem}
                      className="rounded bg-surface-900 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span className="text-white">{mod}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Role?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete role <strong className="text-white">{deleteTarget?.name}</strong>?
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
