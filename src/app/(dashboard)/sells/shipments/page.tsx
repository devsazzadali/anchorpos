"use client"

import { useState } from "react"
import { 
  Truck, Search, Filter, CheckCircle2, Clock, Package, 
  MapPin, Download, Printer, Plus, Eye, X, Phone 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv, printCurrentWindow } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

interface ShipmentItem {
  id: string
  date: string
  trackingNo: string
  invoiceNo: string
  customer: string
  phone: string
  shippingAddress: string
  courier: string
  status: "Ordered" | "Packed" | "Shipped" | "Delivered"
}

const INITIAL_SHIPMENTS: ShipmentItem[] = [
  {
    id: "SHP-001",
    date: "2026-09-12",
    trackingNo: "TRK-98214-BD",
    invoiceNo: "INV-2026-0001",
    customer: "Walk-In Customer (R15 V3)",
    phone: "+880 1711-000000",
    shippingAddress: "House 14, Road 3, Central Road, Rangpur",
    courier: "Steadfast Courier",
    status: "Delivered"
  },
  {
    id: "SHP-002",
    date: "2026-09-13",
    trackingNo: "TRK-98255-BD",
    invoiceNo: "INV-2026-0002",
    customer: "Walk-In Customer (Yamaha FZ)",
    phone: "+880 1711-000000",
    shippingAddress: "Station Road, Rangpur",
    courier: "Pathao Parcel",
    status: "Shipped"
  },
  {
    id: "SHP-003",
    date: "2026-09-13",
    trackingNo: "TRK-98301-BD",
    invoiceNo: "INV-2026-0003",
    customer: "Biplob Bike Modification Club",
    phone: "+880 1819-223344",
    shippingAddress: "Modern Mor, Rangpur Sadar",
    courier: "Shop Rider",
    status: "Packed"
  }
]

export default function ShipmentsPage() {
  const { toast } = useToast()
  const [shipments, setShipments] = useState<ShipmentItem[]>(INITIAL_SHIPMENTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingLabel, setViewingLabel] = useState<ShipmentItem | null>(null)

  // New shipment form
  const [trackingNo, setTrackingNo] = useState(`TRK-${Math.floor(10000 + Math.random() * 90000)}-BD`)
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-0002")
  const [customer, setCustomer] = useState("Sazzad Workshop Client")
  const [phone, setPhone] = useState("+880 1712-345678")
  const [shippingAddress, setShippingAddress] = useState("Jahaj Company Mor, Rangpur")
  const [courier, setCourier] = useState("Steadfast Courier")

  const handleUpdateStatus = (id: string, newStatus: ShipmentItem["status"]) => {
    playClick()
    setShipments(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    toast({
      title: "Shipment Status Updated",
      description: `Consignment is now marked as "${newStatus}".`
    })
  }

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    const newRecord: ShipmentItem = {
      id: `SHP-00${shipments.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      trackingNo,
      invoiceNo,
      customer,
      phone,
      shippingAddress,
      courier,
      status: "Packed"
    }
    setShipments([newRecord, ...shipments])
    setIsModalOpen(false)
    setTrackingNo(`TRK-${Math.floor(10000 + Math.random() * 90000)}-BD`)
    toast({
      title: "Shipment Created",
      description: `Waybill generated for ${newRecord.trackingNo}.`
    })
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Shipments_Dispatch_Rangpur_Bike_Parlour", [
      { header: "Dispatch Date", key: "date" },
      { header: "Tracking No", key: "trackingNo" },
      { header: "Invoice No", key: "invoiceNo" },
      { header: "Recipient Name", key: "customer" },
      { header: "Contact Phone", key: "phone" },
      { header: "Destination Address", key: "shippingAddress" },
      { header: "Courier Service", key: "courier" },
      { header: "Fulfillment Status", key: "status" }
    ], filtered)
    toast({
      title: "Export Completed",
      description: "Shipments exported to CSV."
    })
  }

  const filtered = shipments.filter(s => {
    const matchesSearch = s.trackingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: ShipmentItem["status"]) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
      case "Shipped":
        return "bg-blue-950/40 text-blue-400 border border-blue-800/40"
      case "Packed":
        return "bg-amber-950/40 text-amber-400 border border-amber-800/40"
      default:
        return "bg-surface-800 text-surface-300 border border-surface-700"
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Shipments & Delivery</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Parcel Tracking
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Track courier fulfillment, dispatches, and delivery status for Rangpur Bike Parlour
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

          <Button 
            onClick={() => { playClick(); setIsModalOpen(true) }} 
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Dispatch
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-surface-800">
          <div className="text-xs font-semibold uppercase text-surface-400">Ordered</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {shipments.filter(s => s.status === "Ordered").length}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-surface-800">
          <div className="text-xs font-semibold uppercase text-surface-400">Packed & Ready</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {shipments.filter(s => s.status === "Packed").length}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-surface-800">
          <div className="text-xs font-semibold uppercase text-surface-400">In Transit</div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {shipments.filter(s => s.status === "Shipped").length}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-surface-800">
          <div className="text-xs font-semibold uppercase text-surface-400">Delivered</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {shipments.filter(s => s.status === "Delivered").length}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by tracking number, invoice no, customer, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900/70 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-900 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Ordered">Ordered</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Tracking No</th>
                <th className="px-6 py-4">Invoice No</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Delivery Address</th>
                <th className="px-6 py-4">Courier Partner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{s.date}</td>
                  <td className="px-6 py-4 font-mono font-bold text-white">{s.trackingNo}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-surface-800 text-brand-400 font-mono text-xs border border-surface-700">
                      {s.invoiceNo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{s.customer}</div>
                    <div className="text-xs text-surface-400 font-mono">{s.phone}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-xs text-surface-300">
                    {s.shippingAddress}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{s.courier}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <select
                        value={s.status}
                        onChange={(e) => handleUpdateStatus(s.id, e.target.value as any)}
                        className="bg-surface-900 border border-surface-700 text-xs text-surface-200 rounded px-2 py-1 focus:outline-none focus:border-brand-500"
                      >
                        <option value="Ordered">Ordered</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { playClick(); setViewingLabel(s) }}
                        className="h-7 w-7 text-brand-400 hover:text-white hover:bg-brand-500/20"
                        title="Print Shipping Label"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-surface-700 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-400" /> Create Dispatch Waybill
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Tracking No</label>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Invoice No</label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Courier Service</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="Pathao Parcel">Pathao Parcel</option>
                  <option value="Sundarban Courier">Sundarban Courier</option>
                  <option value="Shop Rider">Shop Direct Rider</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-surface-700 text-surface-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
                  Save Waybill
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipping Label Preview */}
      {viewingLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-surface-700 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-brand-400" /> Shipping Label Preview
              </h3>
              <button onClick={() => setViewingLabel(null)} className="text-surface-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white text-black p-4 rounded-lg space-y-3 text-xs font-mono shadow-inner border border-gray-400">
              <div className="flex justify-between border-b pb-2">
                <div>
                  <div className="font-extrabold text-sm uppercase">Rangpur Bike Parlour</div>
                  <div className="text-[10px]">Station Road, Rangpur</div>
                  <div className="text-[10px]">BL0001 &bull; 01700-000000</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs uppercase bg-black text-white px-1.5 py-0.5 rounded">
                    {viewingLabel.courier}
                  </div>
                </div>
              </div>

              <div className="py-2 border-b">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Deliver To:</div>
                <div className="text-sm font-bold">{viewingLabel.customer}</div>
                <div className="text-xs font-semibold">{viewingLabel.phone}</div>
                <div className="text-[11px] mt-1 text-gray-800">{viewingLabel.shippingAddress}</div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Tracking Ref:</div>
                  <div className="font-bold text-xs">{viewingLabel.trackingNo}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 uppercase">Invoice:</div>
                  <div className="font-bold text-xs">{viewingLabel.invoiceNo}</div>
                </div>
              </div>

              <div className="bg-gray-900 text-white text-center py-2 text-[10px] tracking-widest rounded">
                |||||||||| {viewingLabel.trackingNo} ||||||||||
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setViewingLabel(null)} className="border-surface-700 text-surface-300">
                Close
              </Button>
              <Button onClick={() => { playClick(); printCurrentWindow() }} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
                <Printer className="w-4 h-4 mr-1.5" /> Print Label
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
