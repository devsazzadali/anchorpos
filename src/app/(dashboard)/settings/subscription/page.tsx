"use client"

import { useState } from "react"
import { ShieldCheck, CheckCircle2, Sparkles, CreditCard, Calendar, Users, Building, Package, FileText, Download, RefreshCw, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

interface BillingRecord {
  id: string
  date: string
  plan: string
  period: string
  amount: string
  amountNum: number
  status: "Paid"
  invoiceNo: string
}

const INITIAL_BILLING: BillingRecord[] = [
  {
    id: "INV-SUB-02",
    date: "2026-01-01",
    plan: "DATABYTE Enterprise Unlimited (Annual)",
    period: "2026-01-01 to 2026-12-31",
    amount: "৳ 18,000.00",
    amountNum: 18000,
    status: "Paid",
    invoiceNo: "DATABYTE-SUB-2026-0042"
  },
  {
    id: "INV-SUB-01",
    date: "2025-01-01",
    plan: "DATABYTE Professional Edition",
    period: "2025-01-01 to 2025-12-31",
    amount: "৳ 12,000.00",
    amountNum: 12000,
    status: "Paid",
    invoiceNo: "DATABYTE-SUB-2025-0019"
  }
]

export default function SubscriptionPage() {
  const { toast } = useToast()
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>(INITIAL_BILLING)

  // Renew Modal
  const [isRenewOpen, setIsRenewOpen] = useState(false)
  const [renewPlan, setRenewPlan] = useState("annual")
  const [paymentMethod, setPaymentMethod] = useState("bKash")
  const [trxId, setTrxId] = useState("")

  const handleOpenRenew = () => {
    playClick()
    setTrxId(`BK${Date.now().toString().slice(-8)}`)
    setIsRenewOpen(true)
  }

  const handleConfirmRenew = () => {
    const newRecord: BillingRecord = {
      id: `INV-SUB-0${billingHistory.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      plan: renewPlan === "annual" ? "DATABYTE Enterprise Unlimited (1 Year Extension)" : "DATABYTE Enterprise 3-Year Extended",
      period: "2027-01-01 to 2027-12-31",
      amount: renewPlan === "annual" ? "৳ 18,000.00" : "৳ 45,000.00",
      amountNum: renewPlan === "annual" ? 18000 : 45000,
      status: "Paid",
      invoiceNo: `DATABYTE-SUB-2026-00${billingHistory.length + 43}`,
    }
    setBillingHistory([newRecord, ...billingHistory])
    setIsRenewOpen(false)
    playSuccess()
    toast({
      title: "Subscription Extended",
      description: "License validity for Rangpur Bike Parlour successfully extended.",
      className: "bg-surface-900 text-white border-emerald-500/50",
    })
  }

  const handleExportCsv = () => {
    playClick()
    const rows = billingHistory.map(b => ({
      "Payment Date": b.date,
      "Invoice No": b.invoiceNo,
      Plan: b.plan,
      "Coverage Period": b.period,
      Amount: b.amount,
      Status: b.status,
    }))
    exportToCsv("rangpur_bike_subscription_invoices.csv", rows)
    toast({
      title: "CSV Exported",
      description: "Billing history exported successfully.",
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Subscription &amp; Package</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Enterprise Active
            </span>
          </div>
          <p className="text-surface-400 mt-1">
            Account license, cloud synchronization quota, and billing status for Rangpur Bike Parlour
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleExportCsv}
            className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200"
          >
            <Download className="w-4 h-4 mr-2" /> Billing CSV
          </Button>
          <Button 
            onClick={handleOpenRenew}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Renew / Extend License
          </Button>
        </div>
      </div>

      {/* Current Plan Overview Banner */}
      <div className="glass-panel p-8 rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-950/40 via-surface-900/60 to-surface-950/80 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> Current Active Tier
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              DATABYTE Enterprise Edition
            </h3>
            <p className="text-surface-300 text-sm mt-1">
              Licensed to: <strong className="text-white">Rangpur Bike Parlour</strong> (Business ID: <span className="font-mono text-brand-400">BL0001</span>)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-surface-900/90 border border-surface-700 px-5 py-3 rounded-xl text-center shadow-lg">
              <div className="text-xs text-surface-400 font-medium">Valid Through</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">2027-12-31</div>
            </div>
          </div>
        </div>

        {/* Quota Usage Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-surface-800 relative z-10">
          <div className="bg-surface-900/60 border border-surface-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-surface-400">
              <span className="flex items-center gap-1.5 font-medium"><Building className="w-3.5 h-3.5 text-brand-400" /> Locations</span>
              <span className="font-bold text-white">1 / Unlimited</span>
            </div>
            <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
              <div className="w-1/12 h-full bg-brand-500 rounded-full" />
            </div>
            <div className="text-xs text-surface-400">Rangpur Main Branch</div>
          </div>

          <div className="bg-surface-900/60 border border-surface-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-surface-400">
              <span className="flex items-center gap-1.5 font-medium"><Users className="w-3.5 h-3.5 text-brand-400" /> Cashier Seats</span>
              <span className="font-bold text-white">3 / 10 Users</span>
            </div>
            <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
              <div className="w-3/10 h-full bg-brand-500 rounded-full" />
            </div>
            <div className="text-xs text-surface-400">Admin#1 + 2 Cashiers</div>
          </div>

          <div className="bg-surface-900/60 border border-surface-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-surface-400">
              <span className="flex items-center gap-1.5 font-medium"><Package className="w-3.5 h-3.5 text-brand-400" /> Catalog SKUs</span>
              <span className="font-bold text-white">250+ / Unlimited</span>
            </div>
            <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
              <div className="w-1/4 h-full bg-emerald-500 rounded-full" />
            </div>
            <div className="text-xs text-surface-400">Motorbike Spare Parts</div>
          </div>

          <div className="bg-surface-900/60 border border-surface-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-surface-400">
              <span className="flex items-center gap-1.5 font-medium"><FileText className="w-3.5 h-3.5 text-brand-400" /> Sales Invoices</span>
              <span className="font-bold text-white">5,000+ / Unlimited</span>
            </div>
            <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-emerald-500 rounded-full" />
            </div>
            <div className="text-xs text-surface-400">Offline &amp; Cloud Synced</div>
          </div>
        </div>
      </div>

      {/* Package Features List */}
      <div className="glass-panel p-6 rounded-xl border border-surface-800 space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Enterprise Features Included
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            "Offline-First SQLite / Dexie IndexedDB sync",
            "Multi-Level Motorbike Inventory & Expiry Tracking",
            "Thermal POS ESC/POS Direct Receipt Printing (80mm)",
            "Double-Entry Accounting & Trial Balance",
            "Dynamic Variation Matrix (Helmets, Visors, Oils)",
            "Unlimited Barcode Sticker & Label Generation",
            "Role-Based Access Control (Superadmin, Cashier, Manager)",
            "Automated Stock Adjustment & Discrepancy Auditing",
            "Daily Automatic Cloud Database Backups"
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-surface-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="glass-panel rounded-xl overflow-hidden border border-surface-800 space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-400" /> Subscription Renewal Invoices
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-900/80 text-surface-400 uppercase text-xs font-semibold tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-4 py-3">Payment Date</th>
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Plan Description</th>
                <th className="px-4 py-3">Coverage Period</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {billingHistory.map((b) => (
                <tr key={b.id} className="hover:bg-surface-800/30">
                  <td className="px-4 py-3 font-mono text-xs">{b.date}</td>
                  <td className="px-4 py-3 font-mono font-bold text-brand-400">{b.invoiceNo}</td>
                  <td className="px-4 py-3 font-medium text-white">{b.plan}</td>
                  <td className="px-4 py-3 text-xs text-surface-400">{b.period}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">{b.amount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { playClick(); window.print() }}
                      className="text-xs text-surface-400 hover:text-white h-7"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" /> Print
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renew Modal */}
      <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Renew DATABYTE POS License</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-surface-200">Extension Term</Label>
              <Select value={renewPlan} onValueChange={setRenewPlan}>
                <SelectTrigger className="bg-surface-800 border-surface-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-surface-800 border-surface-700 text-white">
                  <SelectItem value="annual">1 Year Enterprise — ৳ 18,000</SelectItem>
                  <SelectItem value="triennial">3 Years Enterprise (Save 15%) — ৳ 45,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-surface-200">Payment Gateway</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-surface-800 border-surface-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="bKash">bKash Merchant</SelectItem>
                    <SelectItem value="Nagad">Nagad Direct</SelectItem>
                    <SelectItem value="Bank">City Bank EFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Transaction ID</Label>
                <Input 
                  value={trxId} 
                  onChange={(e) => setTrxId(e.target.value)} 
                  className="bg-surface-800 border-surface-700 text-white font-mono" 
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-800/60 border border-surface-700 text-xs text-surface-300 space-y-1">
              <div className="text-white font-semibold">Immediate License Activation:</div>
              <p>Your license expiration will automatically roll forward to <strong>2027-12-31</strong> upon payment confirmation.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRenewOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button onClick={handleConfirmRenew} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Confirm &amp; Extend License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
