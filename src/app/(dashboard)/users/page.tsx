"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, 
  KeyRound, Download, ShieldCheck, UserCheck, CheckCircle2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export interface UserItem {
  id: string
  name: string
  email: string
  role: string
  location: string
  status: 'active' | 'inactive'
  avatar: string
}

const INITIAL_USERS: UserItem[] = [
  { id: '1', name: 'Admin (Owner)', email: 'admin@example.com', role: 'Admin#1', location: 'RANGPUR BIKE PARLOUR', status: 'active', avatar: 'A' },
  { id: '2', name: 'Manager Hasan', email: 'hasan@bikeparlour.bd', role: 'Store Manager', location: 'RANGPUR BIKE PARLOUR', status: 'active', avatar: 'H' },
  { id: '3', name: 'Cashier Rahim', email: 'rahim@bikeparlour.bd', role: 'Cashier', location: 'RANGPUR BIKE PARLOUR', status: 'active', avatar: 'R' },
]

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS)
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [roleFilter, setRoleFilter] = useState("all")

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Cashier")

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())

      const matchRole = roleFilter === "all" || u.role.toLowerCase().includes(roleFilter.toLowerCase())
      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  const handleExport = () => {
    playClick()
    exportToCsv("Users_List_Rangpur_Bike_Parlour", [
      { header: "User Name", key: "name" },
      { header: "Email Address", key: "email" },
      { header: "System Role", key: "role" },
      { header: "Assigned Location", key: "location" },
      { header: "Account Status", key: "status" },
    ], filtered)
    toast({ title: "Users Exported", description: "CSV file downloaded." })
  }

  const handleOpenEdit = (user: UserItem) => {
    playClick()
    setSelectedUser(user)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedUser) return
    playClick()
    setUsers(prev => prev.map(u => {
      if (u.id === selectedUser.id) {
        return { ...u, name, email, role }
      }
      return u
    }))
    setIsEditOpen(false)
    toast({ title: "User Updated", description: "User credentials and role saved." })
  }

  const handleDelete = () => {
    if (!selectedUser) return
    if (selectedUser.id === '1') {
      toast({ title: "Action Forbidden", description: "Cannot delete the Superadmin account.", variant: "destructive" })
      setIsDeleteOpen(false)
      return
    }
    playClick()
    setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
    setIsDeleteOpen(false)
    toast({ title: "User Deleted", description: `${selectedUser.name} removed from system.` })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">User Management</h2>
          <p className="text-surface-400 mt-1">Manage system operators, role privileges, and branch access</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => { playClick(); setShowFilters(prev => !prev) }}
            className={`border-surface-700 bg-surface-800 text-surface-200 ${
              showFilters ? 'bg-surface-700 text-white border-brand-500' : 'hover:bg-surface-700'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters {showFilters ? "(Active)" : ""}
          </Button>

          <Button variant="outline" onClick={handleExport} className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200">
            <Download className="w-4 h-4 mr-2 text-brand-400" /> Export CSV
          </Button>

          <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Link href="/users/create">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-brand-500/20 animate-fade-in text-xs">
          <span className="text-surface-400 font-medium">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="manager">Managers</option>
            <option value="cashier">Cashiers</option>
          </select>
          {roleFilter !== "all" && (
            <button onClick={() => setRoleFilter("all")} className="text-xs text-brand-400 hover:underline ml-auto">
              Reset
            </button>
          )}
        </div>
      )}

      <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input 
              placeholder="Search users by name, email, or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 h-10 w-full text-white"
            />
          </div>
          <div className="text-xs text-surface-400">
            Showing <span className="font-bold text-white">{filtered.length}</span> active staff accounts
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">User Profile</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Assigned Location</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center font-bold text-brand-400 text-xs">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-brand-300 transition-colors text-xs">{user.name}</div>
                          <div className="text-[11px] text-surface-400 font-mono mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.role.includes('Admin') ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        user.role.includes('Manager') ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-surface-300 text-xs">{user.location}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                        {user.status}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(user)} className="hover:bg-surface-700 cursor-pointer text-xs">
                            <FileEdit className="mr-2 h-4 w-4 text-blue-400" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-surface-700" />
                          <DropdownMenuItem onClick={() => { playClick(); setSelectedUser(user); setIsDeleteOpen(true) }} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer text-xs">
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
      </div>

      {/* Modal: Edit User */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Edit User Privileges</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 text-xs">
            <div>
              <Label className="text-surface-300">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-800 border-surface-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-surface-300">Email Address</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-800 border-surface-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-surface-300">System Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 text-white rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-brand-500"
              >
                <option value="Cashier">Cashier</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Admin#1">Admin</option>
              </select>
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
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display text-red-400">Delete User Account?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-surface-400 mt-2">
            Are you sure you want to remove <span className="text-white font-bold">{selectedUser?.name}</span>?
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
