"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, FileEdit, Trash2, Landmark, Wallet, Banknote, Download, Eye, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface PaymentAccount {
  id: string
  name: string
  type: "cash" | "bank" | "mobile"
  acc_no: string
  balance: number
  status: "active" | "inactive"
}

const INITIAL_ACCOUNTS: PaymentAccount[] = [
  { id: '1', name: 'Main POS Cash Register', type: 'cash', acc_no: 'CASH-DRAWER-01', balance: 14500000, status: 'active' },
  { id: '2', name: 'Dutch-Bangla Bank (Current A/C)', type: 'bank', acc_no: '123.456.7890', balance: 500000000, status: 'active' },
  { id: '3', name: 'bKash Merchant Payment Gateway', type: 'mobile', acc_no: '01711-223344', balance: 4500000, status: 'active' },
  { id: '4', name: 'Nagad Business Wallet', type: 'mobile', acc_no: '01819-556677', balance: 2800000, status: 'active' },
  { id: '5', name: 'City Bank Corporate A/C', type: 'bank', acc_no: '310.298.1122', balance: 120000000, status: 'active' },
]

export default function AccountsPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<PaymentAccount[]>(INITIAL_ACCOUNTS)
  const [search, setSearch] = useState("")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedLedger, setSelectedLedger] = useState<PaymentAccount | null>(null)
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentAccount | null>(null)

  // Form
  const [name, setName] = useState("")
  const [type, setType] = useState<"cash" | "bank" | "mobile">("cash")
  const [accNo, setAccNo] = useState("")
  const [balance, setBalance] = useState(0)

  const getIcon = (t: string) => {
    switch (t) {
      case 'cash': return <Banknote className="w-5 h-5 text-green-400" />
      case 'bank': return <Landmark className="w-5 h-5 text-blue-400" />
      case 'mobile': return <Wallet className="w-5 h-5 text-purple-400" />
      default: return <Landmark className="w-5 h-5 text-brand-400" />
    }
  }

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0)
  }

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.acc_no.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenAdd = () => {
    playClick()
    setName("")
    setType("bank")
    setAccNo("")
    setBalance(0)
    setIsAddOpen(true)
  }

  const handleSaveAdd = () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter account name.", variant: "destructive" })
      return
    }
    const newAcc: PaymentAccount = {
      id: String(Date.now()),
      name,
      type,
      acc_no: accNo || "—",
      balance: Math.round(balance * 100),
      status: "active",
    }
    setAccounts([newAcc, ...accounts])
    setIsAddOpen(false)
    playSuccess()
    toast({
      title: "Account Created",
      description: `Account "${name}" registered with initial balance.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleOpenEdit = (acc: PaymentAccount) => {
    playClick()
    setEditingAccount(acc)
    setName(acc.name)
    setType(acc.type)
    setAccNo(acc.acc_no)
    setBalance(acc.balance / 100)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingAccount || !name.trim()) return
    setAccounts(accounts.map(a =>
      a.id === editingAccount.id ? { ...a, name, type, acc_no: accNo || "—", balance: Math.round(balance * 100) } : a
    ))
    setIsEditOpen(false)
    setEditingAccount(null)
    playSuccess()
    toast({
      title: "Account Updated",
      description: `Account details saved.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setAccounts(accounts.filter(a => a.id !== deleteTarget.id))
    playClick()
    toast({
      title: "Account Deleted",
      description: `Removed account "${deleteTarget.name}".`,
      className: "bg-surface-900 text-white border-red-500/50",
    })
    setDeleteTarget(null)
  }

  const handleExportCsv = () => {
    playClick()
    const rows = filtered.map(a => ({
      ID: a.id,
      "Account Name": a.name,
      Type: a.type,
      "Account Number": a.acc_no,
      "Current Balance (BDT)": a.balance / 100,
      Status: a.status,
    }))
    exportToCsv("rangpur_bike_payment_accounts.csv", rows)
    toast({
      title: "CSV Exported",
      description: `Exported ${filtered.length} financial accounts.`,
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Payment Accounts</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Treasury
            </span>
          </div>
          <p className="text-surface-400 mt-1">Manage cash drawers, corporate bank accounts, and mobile wallets for Rangpur Bike Parlour</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleExportCsv}
            className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button 
            onClick={handleOpenAdd}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Account
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-brand-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Landmark className="w-16 h-16" />
          </div>
          <p className="text-surface-400 text-sm font-medium">Total Liquid Balance</p>
          <p className="text-3xl font-display font-bold text-white mt-2">{formatCurrency(getTotalBalance())}</p>
          <p className="text-xs text-brand-400 mt-2 font-mono">Across {accounts.length} active channels</p>
        </div>

        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-green-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Banknote className="w-16 h-16" />
          </div>
          <p className="text-surface-400 text-sm font-medium">Cash in Hand</p>
          <p className="text-3xl font-display font-bold text-green-400 mt-2">
            {formatCurrency(accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.balance, 0))}
          </p>
          <p className="text-xs text-surface-400 mt-2">Counter Register Drawer</p>
        </div>

        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-purple-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-16 h-16" />
          </div>
          <p className="text-surface-400 text-sm font-medium">Mobile MFS (bKash/Nagad)</p>
          <p className="text-3xl font-display font-bold text-purple-400 mt-2">
            {formatCurrency(accounts.filter(a => a.type === 'mobile').reduce((sum, a) => sum + a.balance, 0))}
          </p>
          <p className="text-xs text-surface-400 mt-2">Instant Merchant Wallets</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-xl flex flex-col border border-surface-800">
        <div className="p-4 border-b border-surface-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input 
              placeholder="Search accounts by name or account number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 h-10 w-full text-white"
            />
          </div>
          <div className="text-xs text-surface-400">
            Showing <span className="text-white font-bold">{filtered.length}</span> accounts
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-900/80 border-b border-surface-800 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Account Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Account Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Current Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((acc) => (
                <tr key={acc.id} className="hover:bg-surface-800/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-800/90 border border-surface-700 flex items-center justify-center shrink-0">
                        {getIcon(acc.type)}
                      </div>
                      <span className="group-hover:text-brand-300 transition-colors">{acc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-xs font-mono px-2.5 py-1 rounded bg-surface-800 text-surface-300 border border-surface-700">
                      {acc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-surface-300 text-xs font-bold">{acc.acc_no}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                      {acc.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-white text-base">
                    {formatCurrency(acc.balance)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-surface-800 border-surface-700 text-surface-200 w-48">
                        <DropdownMenuItem 
                          onClick={() => { playClick(); setSelectedLedger(acc) }}
                          className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Ledger History
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleOpenEdit(acc)}
                          className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer"
                        >
                          <FileEdit className="mr-2 h-4 w-4" /> Edit Account
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-surface-700" />
                        <DropdownMenuItem 
                          onClick={() => { playClick(); setDeleteTarget(acc) }}
                          className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Channel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">New Payment Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Account Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. BRAC Bank Corporate" 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Account Type</Label>
                <Select value={type} onValueChange={(v: "cash" | "bank" | "mobile") => setType(v)}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="cash">Cash in Hand</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="mobile">Mobile MFS (bKash/Nagad)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Initial Balance (৳)</Label>
                <Input 
                  type="number" 
                  value={balance} 
                  onChange={(e) => setBalance(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Account / IBAN / Wallet Number</Label>
              <Input 
                value={accNo} 
                onChange={(e) => setAccNo(e.target.value)} 
                placeholder="e.g. 150.110.45678" 
                className="bg-surface-800 border-surface-700 text-white font-mono" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Save Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Edit Payment Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Account Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white focus-visible:ring-brand-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Account Type</Label>
                <Select value={type} onValueChange={(v: "cash" | "bank" | "mobile") => setType(v)}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="cash">Cash in Hand</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="mobile">Mobile MFS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Current Balance (৳)</Label>
                <Input 
                  type="number" 
                  value={balance} 
                  onChange={(e) => setBalance(Number(e.target.value))} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Account Number</Label>
              <Input 
                value={accNo} 
                onChange={(e) => setAccNo(e.target.value)} 
                className="bg-surface-800 border-surface-700 text-white font-mono" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Update Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ledger History Modal */}
      <Dialog open={!!selectedLedger} onOpenChange={(open) => !open && setSelectedLedger(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold flex items-center justify-between">
              <span>{selectedLedger?.name}</span>
              <span className="font-mono text-emerald-400 font-bold">{formatCurrency(selectedLedger?.balance || 0)}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="text-xs text-surface-400">
              Account No: <strong className="text-white font-mono">{selectedLedger?.acc_no}</strong> • Channel: <span className="uppercase text-brand-400 font-bold">{selectedLedger?.type}</span>
            </div>
            <div className="border border-surface-700 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-800 text-surface-400 uppercase">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Ref / Transaction</th>
                    <th className="p-2.5 text-right">Debit</th>
                    <th className="p-2.5 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/60 font-mono">
                  <tr>
                    <td className="p-2.5 text-surface-400">2026-09-13</td>
                    <td className="p-2.5 text-white">POS Cash Sale (INV-2026-0002)</td>
                    <td className="p-2.5 text-right text-emerald-400">+৳ 1,200</td>
                    <td className="p-2.5 text-right text-surface-500">—</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-surface-400">2026-09-12</td>
                    <td className="p-2.5 text-white">Stationery Receipt Rolls (EXP-2026-0001)</td>
                    <td className="p-2.5 text-right text-surface-500">—</td>
                    <td className="p-2.5 text-right text-red-400">-৳ 500</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-surface-400">2026-09-10</td>
                    <td className="p-2.5 text-white">Consignment Inflow (PO-2026-0001)</td>
                    <td className="p-2.5 text-right text-surface-500">—</td>
                    <td className="p-2.5 text-right text-red-400">-৳ 1,05,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedLedger(null)} className="bg-brand-600 hover:bg-brand-500 text-white">
              Close Ledger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-red-400">Delete Payment Account?</DialogTitle>
          </DialogHeader>
          <p className="text-surface-300 text-sm">
            Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>? Linked transaction records will be retained in audit ledger.
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
