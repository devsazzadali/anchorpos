"use client"

import { useState } from "react"
import { Printer, Plus, CheckCircle2, RefreshCw, Trash2, Edit2, Wifi, Usb, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCsv } from "@/lib/utils/export"
import { playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

interface PrinterConfig {
  id: string
  name: string
  connectionType: "Network (ESC/POS)" | "USB Direct" | "Windows Driver"
  ipAddress?: string
  port?: number
  charPerLine: number
  paperWidth: "80mm" | "58mm"
  isDefault: boolean
  status: "Online" | "Offline"
}

const INITIAL_PRINTERS: PrinterConfig[] = [
  {
    id: "PRN-01",
    name: "Counter 1 Thermal Receipt Printer",
    connectionType: "Network (ESC/POS)",
    ipAddress: "192.168.1.120",
    port: 9100,
    charPerLine: 48,
    paperWidth: "80mm",
    isDefault: true,
    status: "Online"
  },
  {
    id: "PRN-02",
    name: "Office A4 Laser Printer (Invoices)",
    connectionType: "Windows Driver",
    charPerLine: 80,
    paperWidth: "80mm",
    isDefault: false,
    status: "Online"
  }
]

export default function ReceiptPrintersPage() {
  const { toast } = useToast()
  const [printers, setPrinters] = useState<PrinterConfig[]>(INITIAL_PRINTERS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [connType, setConnType] = useState<PrinterConfig["connectionType"]>("Network (ESC/POS)")
  const [ip, setIp] = useState("192.168.1.125")
  const [port, setPort] = useState(9100)
  const [paperWidth, setPaperWidth] = useState<"80mm" | "58mm">("80mm")

  const handleTestPrint = (printer: PrinterConfig) => {
    playClick()
    toast({
      title: "Test Print Sent",
      description: `Test print job successfully spooled to ${printer.name} (${printer.paperWidth}).`,
    })
  }

  const handleOpenAdd = () => {
    playClick()
    setEditingPrinter(null)
    setName("")
    setConnType("Network (ESC/POS)")
    setIp("192.168.1.125")
    setPort(9100)
    setPaperWidth("80mm")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: PrinterConfig) => {
    playClick()
    setEditingPrinter(p)
    setName(p.name)
    setConnType(p.connectionType)
    setIp(p.ipAddress || "192.168.1.125")
    setPort(p.port || 9100)
    setPaperWidth(p.paperWidth)
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    playClick()

    if (editingPrinter) {
      setPrinters(prev => prev.map(p => p.id === editingPrinter.id ? {
        ...p,
        name,
        connectionType: connType,
        ipAddress: connType.startsWith("Network") ? ip : undefined,
        port: connType.startsWith("Network") ? port : undefined,
        charPerLine: paperWidth === "80mm" ? 48 : 32,
        paperWidth,
      } : p))
      toast({
        title: "Printer Updated",
        description: `Hardware profile for "${name}" updated.`
      })
    } else {
      const newP: PrinterConfig = {
        id: `PRN-0${printers.length + 1}`,
        name,
        connectionType: connType,
        ipAddress: connType.startsWith("Network") ? ip : undefined,
        port: connType.startsWith("Network") ? port : undefined,
        charPerLine: paperWidth === "80mm" ? 48 : 32,
        paperWidth,
        isDefault: false,
        status: "Online"
      }
      setPrinters([...printers, newP])
      toast({
        title: "Printer Added",
        description: `"${name}" configured for POS workstation.`
      })
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    playClick()
    setPrinters(prev => prev.filter(p => p.id !== id))
    setDeletingId(null)
    toast({
      title: "Printer Removed",
      description: "Hardware configuration uninstalled.",
      variant: "destructive"
    })
  }

  const handleExportCSV = () => {
    playClick()
    exportToCsv("Receipt_Printers_Hardware_Specs", [
      { header: "Printer ID", key: "id" },
      { header: "Printer Name", key: "name" },
      { header: "Interface Type", key: "connectionType" },
      { header: "IP Address", key: "ipAddress" },
      { header: "Port", key: "port" },
      { header: "Chars Per Line", key: "charPerLine" },
      { header: "Paper Width", key: "paperWidth" },
      { header: "Default POS", key: "isDefault" },
      { header: "Hardware Status", key: "status" }
    ], printers)
    toast({
      title: "Hardware Specs Exported",
      description: "Receipt printer configurations downloaded as CSV."
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Receipt Printers</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              ESC/POS Hardware
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Configure thermal receipt printers, ESC/POS hardware, and network printers for Rangpur Bike Parlour
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

          <Button onClick={handleOpenAdd} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> Add Receipt Printer
          </Button>
        </div>
      </div>

      {/* Printers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {printers.map((p) => (
          <div key={p.id} className="glass-panel p-6 rounded-xl border border-surface-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{p.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-surface-400 mt-0.5">
                    {p.connectionType.startsWith("Network") ? (
                      <span className="flex items-center gap-1 text-brand-400">
                        <Wifi className="w-3 h-3" /> {p.ipAddress}:{p.port}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-surface-300">
                        <Usb className="w-3 h-3" /> {p.connectionType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                p.status === "Online"
                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                  : "bg-surface-800 text-surface-400 border border-surface-700"
              }`}>
                {p.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-surface-800/60">
              <div className="text-surface-400">Paper Width: <span className="text-white font-semibold">{p.paperWidth}</span></div>
              <div className="text-surface-400">Chars per line: <span className="text-white font-semibold">{p.charPerLine}</span></div>
              <div className="text-surface-400">Default POS Printer: <span className="text-white font-semibold">{p.isDefault ? "Yes" : "No"}</span></div>
              <div className="text-surface-400">Location: <span className="text-white font-semibold">BL0001 (RANGPUR)</span></div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-surface-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestPrint(p)}
                className="border-surface-700 bg-surface-900/40 hover:bg-surface-800 text-xs text-brand-400 hover:text-brand-300"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Test Print
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(p)}
                  className="h-8 w-8 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10"
                  title="Edit Printer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { playClick(); setDeletingId(p.id) }}
                  className="h-8 w-8 text-surface-400 hover:text-red-400 hover:bg-red-500/10"
                  title="Delete Printer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-surface-700 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-surface-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-400" />
                {editingPrinter ? "Edit Printer Hardware" : "Add Receipt Printer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Printer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Counter 2 Thermal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Connection Type</label>
                <select
                  value={connType}
                  onChange={(e) => setConnType(e.target.value as any)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="Network (ESC/POS)">Network IP (ESC/POS)</option>
                  <option value="USB Direct">USB Direct Cable</option>
                  <option value="Windows Driver">Windows Driver Spooler</option>
                </select>
              </div>

              {connType.startsWith("Network") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">IP Address</label>
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => setIp(e.target.value)}
                      className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Port</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(parseInt(e.target.value) || 9100)}
                      className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase font-semibold text-surface-400 mb-1">Paper Roll Width</label>
                <select
                  value={paperWidth}
                  onChange={(e) => setPaperWidth(e.target.value as any)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="80mm">80mm (Standard POS Thermal - 48 chars)</option>
                  <option value="58mm">58mm (Compact Mobile POS - 32 chars)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-surface-700 text-surface-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
                  {editingPrinter ? "Update Printer" : "Save Printer"}
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
            <h4 className="text-base font-bold text-white">Delete Printer Profile?</h4>
            <p className="text-xs text-surface-300">
              Are you sure you want to remove this printer? Workstations will no longer route thermal tickets to this IP address.
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
