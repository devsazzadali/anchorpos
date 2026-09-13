"use client"

import { useState } from "react"
import { Tag, Plus, Search, CheckCircle2, Clock, Trash2, Edit2, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

interface DiscountItem {
  id: string
  name: string
  startsAt: string
  endsAt: string
  discountType: "Percentage" | "Fixed"
  discountValue: number
  applicableTo: string
  status: "Active" | "Inactive"
}

const INITIAL_DISCOUNTS: DiscountItem[] = [
  {
    id: "DSC-001",
    name: "Eid-ul-Adha Bike Care Offer",
    startsAt: "2026-06-01",
    endsAt: "2026-06-25",
    discountType: "Percentage",
    discountValue: 10,
    applicableTo: "All Parts (Engine Oil 1L)",
    status: "Active"
  },
  {
    id: "DSC-002",
    name: "Helmet Clearance Discount",
    startsAt: "2026-09-01",
    endsAt: "2026-09-30",
    discountType: "Fixed",
    discountValue: 150.00,
    applicableTo: "Helmet Standard",
    status: "Active"
  },
  {
    id: "DSC-003",
    name: "Winter Monsoon Flash Sale",
    startsAt: "2026-01-01",
    endsAt: "2026-01-15",
    discountType: "Percentage",
    discountValue: 5,
    applicableTo: "All Products",
    status: "Inactive"
  }
]

export default function DiscountsPage() {
  const { toast } = useToast()
  const [discounts, setDiscounts] = useState<DiscountItem[]>(INITIAL_DISCOUNTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [startsAt, setStartsAt] = useState("2026-09-15")
  const [endsAt, setEndsAt] = useState("2026-10-15")
  const [discountType, setDiscountType] = useState<"Percentage" | "Fixed">("Percentage")
  const [discountValue, setDiscountValue] = useState(10)
  const [applicableTo, setApplicableTo] = useState("Parts")

  const handleOpenCreate = () => {
    playClick()
    setName("")
    setStartsAt("2026-09-15")
    setEndsAt("2026-10-15")
    setDiscountType("Percentage")
    setDiscountValue(10)
    setApplicableTo("Parts")
    setEditingDiscount(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (d: DiscountItem) => {
    playClick()
    setEditingDiscount(d)
    setName(d.name)
    setStartsAt(d.startsAt)
    setEndsAt(d.endsAt)
    setDiscountType(d.discountType)
    setDiscountValue(d.discountValue)
    setApplicableTo(d.applicableTo)
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    if (editingDiscount) {
      setDiscounts(prev => prev.map(d => d.id === editingDiscount.id ? {
        ...d,
        name,
        startsAt,
        endsAt,
        discountType,
        discountValue,
        applicableTo
      } : d))
      toast({
        title: "Campaign Updated",
        description: `Discount campaign "${name}" saved successfully.`
      })
    } else {
      const newRecord: DiscountItem = {
        id: `DSC-00${discounts.length + 1}`,
        name,
        startsAt,
        endsAt,
        discountType,
        discountValue,
        applicableTo,
        status: "Active"
      }
      setDiscounts([newRecord, ...discounts])
      toast({
        title: "Campaign Created",
        description: `New campaign "${name}" launched successfully.`
      })
    }
    setIsModalOpen(false)
  }

  const handleToggleStatus = (id: string) => {
    playClick()
    setDiscounts(prev => prev.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === "Active" ? "Inactive" : "Active"
        toast({
          title: `Campaign ${nextStatus}`,
          description: `"${d.name}" is now ${nextStatus.toLowerCase()}.`
        })
        return { ...d, status: nextStatus }
      }
      return d
    }))
  }

  const handleDelete = (id: string) => {
    playClick()
    setDiscounts(prev => prev.filter(d => d.id !== id))
    setDeletingId(null)
    toast({
      title: "Campaign Removed",
      description: "Discount campaign deleted from system.",
      variant: "destructive"
    })
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Discount_Campaigns_Rangpur_Bike_Parlour", [
      { header: "Campaign Name", key: "name" },
      { header: "Discount Type", key: "discountType" },
      { header: "Discount Value", key: "discountValue" },
      { header: "Applicable Scope", key: "applicableTo" },
      { header: "Starts At", key: "startsAt" },
      { header: "Ends At", key: "endsAt" },
      { header: "Status", key: "status" }
    ], filtered)
    toast({
      title: "Export Completed",
      description: "Discounts and campaigns exported to CSV."
    })
  }

  const filtered = discounts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.applicableTo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Discounts & Promotions</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Rangpur Bike Parlour
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Manage promotional campaigns, coupon rules, and percentage discounts
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

          <Button onClick={handleOpenCreate} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> Add Discount Campaign
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search campaigns by name or applicable product/category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="text-xs text-surface-400">
          Active Campaigns: <span className="text-emerald-400 font-bold">{discounts.filter(d => d.status === "Active").length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Discount Value</th>
                <th className="px-6 py-4">Applicable To</th>
                <th className="px-6 py-4">Starts At</th>
                <th className="px-6 py-4">Ends At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-brand-400" />
                      {d.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                    {d.discountType === "Percentage" ? `${d.discountValue}% OFF` : `৳ ${d.discountValue.toFixed(2)} OFF`}
                  </td>
                  <td className="px-6 py-4 text-xs text-surface-200">
                    <span className="px-2 py-0.5 rounded bg-surface-800 border border-surface-700">
                      {d.applicableTo}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{d.startsAt}</td>
                  <td className="px-6 py-4 font-mono text-xs">{d.endsAt}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(d.id)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                        d.status === "Active"
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40"
                          : "bg-surface-800 text-surface-400 border-surface-700 hover:text-white"
                      }`}
                    >
                      {d.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(d)}
                        className="h-8 w-8 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10"
                        title="Edit Campaign"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { playClick(); setDeletingId(d.id) }}
                        className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Campaign"
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
                <Tag className="w-5 h-5 text-brand-400" />
                {editingDiscount ? "Edit Discount Campaign" : "Create Discount Campaign"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Special 10% Off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Starts At</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Ends At</label>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Applicable Scope</label>
                <select
                  value={applicableTo}
                  onChange={(e) => setApplicableTo(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="All Products">All Products</option>
                  <option value="Parts">Category: Parts</option>
                  <option value="Accessories">Category: Accessories</option>
                  <option value="Engine Oil 1L">Single: Engine Oil 1L</option>
                  <option value="Helmet Standard">Single: Helmet Standard</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-surface-700 text-surface-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
                  {editingDiscount ? "Update Campaign" : "Save Campaign"}
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
            <h4 className="text-base font-bold text-white">Delete Discount Campaign?</h4>
            <p className="text-xs text-surface-300">
              Are you sure you want to delete this promotional campaign? Customers will no longer receive this discount at checkout.
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
