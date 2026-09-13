"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, 
  Printer, Download, DollarSign, Tag, Check, Calendar 
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
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export interface ExpenseItem {
  id: string
  date: string
  ref_no: string
  category: string
  amount: number // paise
  account: string
  note: string
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: '1', date: '2026-09-12 02:00 PM', ref_no: 'EXP2026/0001', category: 'Office Supplies', amount: 50000, account: 'Cash in Hand', note: 'Shop stationery and supplies' },
  { id: '2', date: '2026-09-13 10:30 AM', ref_no: 'EXP2026/0002', category: 'Electricity & Utility', amount: 120000, account: 'Cash in Hand', note: 'Shop bulb replacement & fan repair' },
]

export default function ExpensesPage() {
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES)
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedExp, setSelectedExp] = useState<ExpenseItem | null>(null)

  // Form State
  const [category, setCategory] = useState("Office Supplies")
  const [amountTaka, setAmountTaka] = useState("")
  const [note, setNote] = useState("")
  const [account, setAccount] = useState("Cash in Hand")

  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.category)))
  }, [expenses])

  const filtered = useMemo(() => {
    return expenses.filter((exp) => {
      const matchSearch =
        !search ||
        exp.ref_no.toLowerCase().includes(search.toLowerCase()) ||
        exp.category.toLowerCase().includes(search.toLowerCase()) ||
        exp.note.toLowerCase().includes(search.toLowerCase())

      const matchCategory = categoryFilter === "all" || exp.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [expenses, search, categoryFilter])

  const totalExpensePaise = expenses.reduce((s, e) => s + e.amount, 0)

  const handleExport = () => {
    playClick()
    exportToCsv("Business_Expenses_Rangpur_Bike_Parlour", [
      { header: "Expense Ref", key: "ref_no" },
      { header: "Date & Time", key: "date" },
      { header: "Expense Category", key: "category" },
      { header: "Payment Account", key: "account" },
      { header: "Amount (Paise)", key: "amount" },
      { header: "Remarks / Notes", key: "note" },
    ], filtered)
    toast({ title: "Expenses Exported", description: "CSV file downloaded." })
  }

  const handleSaveExpense = () => {
    if (!amountTaka || Number(amountTaka) <= 0) {
      toast({ title: "Amount Required", description: "Please enter a valid expense amount.", variant: "destructive" })
      return
    }

    playClick()
    const newExp: ExpenseItem = {
      id: `EXP-${Date.now()}`,
      ref_no: `EXP2026/000${expenses.length + 1}`,
      date: new Date().toLocaleString("en-BD", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      category: category || "Office Supplies",
      amount: Math.round(Number(amountTaka) * 100),
      account: account || "Cash in Hand",
      note: note || "Operational expense",
    }

    setExpenses(prev => [newExp, ...prev])
    setIsAddOpen(false)
    setAmountTaka("")
    setNote("")
    toast({ title: "Expense Recorded", description: `${formatCurrency(newExp.amount)} logged.` })
  }

  const handleOpenEdit = (exp: ExpenseItem) => {
    playClick()
    setSelectedExp(exp)
    setCategory(exp.category)
    setAmountTaka(String(exp.amount / 100))
    setAccount(exp.account)
    setNote(exp.note)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedExp) return
    playClick()
    setExpenses(prev => prev.map(e => {
      if (e.id === selectedExp.id) {
        return {
          ...e,
          category,
          amount: Math.round(Number(amountTaka) * 100),
          account,
          note,
        }
      }
      return e
    }))

    setIsEditOpen(false)
    toast({ title: "Expense Updated", description: "Changes saved successfully." })
  }

  const handleDelete = () => {
    if (!selectedExp) return
    playClick()
    setExpenses(prev => prev.filter(e => e.id !== selectedExp.id))
    setIsDeleteOpen(false)
    toast({ title: "Expense Removed", description: `${selectedExp.ref_no} deleted.` })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Expenses Ledger</h2>
          <p className="text-surface-400 mt-1">Track petty cash expenses, utilities, and store maintenance</p>
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

          <Button onClick={() => { playClick(); setIsAddOpen(true) }} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-surface-400 text-xs">Total Expenses (Current Period)</p>
            <p className="text-xl font-bold font-mono text-red-400 mt-0.5">{formatCurrency(totalExpensePaise)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-surface-400 text-xs">Expense Categories</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">{categories.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400">
            <Tag className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-surface-400 text-xs">Payment Method</p>
            <p className="text-xl font-bold text-white mt-0.5">Counter Cash</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-brand-500/20 animate-fade-in text-xs">
          <span className="text-surface-400 font-medium">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {categoryFilter !== "all" && (
            <button onClick={() => setCategoryFilter("all")} className="text-xs text-brand-400 hover:underline ml-auto">
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
              placeholder="Search by Ref No, category or note..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-900 border-surface-700 focus-visible:ring-brand-500 h-10 w-full text-white"
            />
          </div>
          <div className="text-xs text-surface-400">
            Showing <span className="font-bold text-white">{filtered.length}</span> expenses
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-400 uppercase bg-surface-800/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Ref No</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Payment Account</th>
                <th className="px-6 py-4 font-medium">Note</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{exp.date}</div>
                      <div className="text-xs text-brand-400 mt-0.5 font-mono">{exp.ref_no}</div>
                    </td>
                    <td className="px-6 py-4 text-surface-200 text-xs font-semibold">{exp.category}</td>
                    <td className="px-6 py-4 text-surface-300 text-xs">{exp.account}</td>
                    <td className="px-6 py-4 text-surface-400 text-xs italic line-clamp-1">{exp.note}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-red-400">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface-800 border-surface-700 text-surface-200 w-44 shadow-xl">
                          <DropdownMenuItem onClick={() => { playClick(); printCurrentWindow() }} className="hover:bg-surface-700 cursor-pointer text-xs">
                            <Printer className="mr-2 h-4 w-4 text-blue-400" /> Print Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(exp)} className="hover:bg-surface-700 cursor-pointer text-xs">
                            <FileEdit className="mr-2 h-4 w-4 text-brand-400" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-surface-700" />
                          <DropdownMenuItem onClick={() => { playClick(); setSelectedExp(exp); setIsDeleteOpen(true) }} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer text-xs">
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

      {/* Modal: Add Expense */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Record Business Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 text-xs">
            <div>
              <Label className="text-surface-300">Expense Category *</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 text-white rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-brand-500"
              >
                <option value="Office Supplies">Office Supplies</option>
                <option value="Electricity & Utility">Electricity & Utility</option>
                <option value="Shop Maintenance">Shop Maintenance</option>
                <option value="Staff Refreshment">Staff Refreshment</option>
                <option value="Transportation & Courier">Transportation & Courier</option>
              </select>
            </div>
            <div>
              <Label className="text-surface-300">Expense Amount (৳) *</Label>
              <Input
                type="number"
                value={amountTaka}
                onChange={(e) => setAmountTaka(e.target.value)}
                placeholder="500.00"
                className="bg-surface-800 border-surface-700 text-white font-mono text-lg font-bold mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-surface-300">Payment Account</Label>
              <Input value={account} onChange={(e) => setAccount(e.target.value)} className="bg-surface-800 border-surface-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-surface-300">Remarks / Note</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Description of expense" className="bg-surface-800 border-surface-700 text-white mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-surface-700 bg-surface-800 text-white">
                Cancel
              </Button>
              <Button onClick={handleSaveExpense} className="bg-brand-600 hover:bg-brand-500 text-white">
                Save Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Expense */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-display">Edit Expense Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 text-xs">
            <div>
              <Label className="text-surface-300">Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} className="bg-surface-800 border-surface-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-surface-300">Amount (৳)</Label>
              <Input type="number" value={amountTaka} onChange={(e) => setAmountTaka(e.target.value)} className="bg-surface-800 border-surface-700 text-white font-mono mt-1" />
            </div>
            <div>
              <Label className="text-surface-300">Note</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} className="bg-surface-800 border-surface-700 text-white mt-1" />
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
            <DialogTitle className="text-base font-display text-red-400">Delete Expense?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-surface-400 mt-2">
            Are you sure you want to remove entry <span className="text-white font-bold">{selectedExp?.ref_no}</span>?
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
