"use client"

import { useState, useEffect } from "react"
import { 
  Banknote, CreditCard, Smartphone, Clock, CheckCircle2, 
  ArrowRight, X, ShieldCheck, QrCode, Sparkles 
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/currency"
import { usePOSStore } from "@/store/pos"
import { playSuccess, playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"
import { processCheckout } from "@/app/actions/checkout"
import { Loader2 } from "lucide-react"

interface POSPaymentModalProps {
  open: boolean
  onClose: () => void
  onSaleComplete: (invoiceData: any) => void
}

export function POSPaymentModal({ open, onClose, onSaleComplete }: POSPaymentModalProps) {
  const { toast } = useToast()
  const { 
    cart, grand_total, subtotal, total_tax, total_discount, 
    customer_id, customer_name, order_notes, clearCart 
  } = usePOSStore()

  const [isProcessing, setIsProcessing] = useState(false)

  const [activeTab, setActiveTab] = useState<'cash' | 'bkash' | 'nagad' | 'card' | 'due'>('cash')
  const [tenderedPaise, setTenderedPaise] = useState<number>(0)
  const [trxId, setTrxId] = useState<string>("")
  const [cardNumber, setCardNumber] = useState<string>("")

  // Initialize tendered amount when modal opens
  useEffect(() => {
    if (open) {
      setTenderedPaise(grand_total)
      setTrxId("")
      setCardNumber("")
    }
  }, [open, grand_total])

  const changePaise = Math.max(0, tenderedPaise - grand_total)
  const isDue = activeTab === 'due'
  const isCompleteDisabled = activeTab === 'cash' && tenderedPaise < grand_total

  const handleQuickAdd = (addTaka: number) => {
    playClick()
    setTenderedPaise(prev => prev + (addTaka * 100))
  }

  const handleExact = () => {
    playClick()
    setTenderedPaise(grand_total)
  }

  const handleComplete = async () => {
    setIsProcessing(true)

    const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const now = new Date()
    
    // Prepare data for receipt modal and server action
    const itemsArray = Array.from(cart.values())
    
    const invoiceData = {
      invoiceNo,
      date: now.toLocaleString("en-BD", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      customerName: customer_name || "Walk-In Customer",
      items: itemsArray,
      subtotal,
      tax: total_tax,
      discount: total_discount,
      grandTotal: grand_total,
      tendered: isDue ? 0 : tenderedPaise,
      change: isDue ? 0 : changePaise,
      paymentMethod: activeTab,
    }

    try {
      const response = await processCheckout({
        invoiceNo,
        customer_id,
        subtotal,
        tax: total_tax,
        discount: total_discount,
        grandTotal: grand_total,
        tendered: isDue ? 0 : tenderedPaise,
        change: isDue ? 0 : changePaise,
        paymentMethod: activeTab,
        items: itemsArray,
      })

      if (!response.success) {
        throw new Error(response.error)
      }

      playSuccess()
      toast({
        title: "Sale Confirmed!",
        description: `Invoice ${invoiceNo} created successfully.`,
        duration: 3000,
      })

      clearCart()
      onClose()
      onSaleComplete(invoiceData)

    } catch (err: any) {
      toast({
        title: "Transaction Failed",
        description: err.message || "An error occurred while saving the sale.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-surface-950 border-surface-700 text-white p-6 shadow-2xl rounded-2xl">
        <DialogHeader className="pb-3 border-b border-surface-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              Checkout & Payment
            </DialogTitle>
            <div className="text-right">
              <span className="text-xs text-surface-400">Total Payable:</span>
              <span className="ml-2 font-mono font-bold text-lg text-brand-400">
                {formatCurrency(grand_total)}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-5 gap-2 my-2">
          {[
            { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-emerald-400' },
            { id: 'bkash', label: 'bKash', icon: Smartphone, color: 'text-pink-400' },
            { id: 'nagad', label: 'Nagad', icon: Smartphone, color: 'text-orange-400' },
            { id: 'card', label: 'Card / POS', icon: CreditCard, color: 'text-blue-400' },
            { id: 'due', label: 'Credit (Due)', icon: Clock, color: 'text-amber-400' },
          ].map(tab => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { playClick(); setActiveTab(tab.id as any) }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow'
                    : 'bg-surface-900 border-surface-800 hover:bg-surface-800 text-surface-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${tab.color}`} />
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Payment Body */}
        <div className="bg-surface-900/60 p-4 rounded-xl border border-surface-800 space-y-4">
          {activeTab === 'cash' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-surface-400 block mb-1 font-medium">Tendered Cash (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-mono text-base">৳</span>
                    <Input
                      type="number"
                      value={tenderedPaise ? (tenderedPaise / 100) : ''}
                      onChange={(e) => setTenderedPaise(Math.max(0, Math.round(Number(e.target.value) * 100)))}
                      className="pl-8 text-xl font-bold font-mono bg-surface-950 border-surface-700 text-white h-12 focus-visible:ring-brand-500"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-surface-400 block mb-1 font-medium">Return Change</label>
                  <div className="h-12 flex items-center px-4 rounded-lg bg-surface-950 border border-surface-700 font-mono text-xl font-bold text-emerald-400">
                    {formatCurrency(changePaise)}
                  </div>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-surface-400 uppercase tracking-wider font-semibold">Quick Cash Add</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExact}
                    className="bg-surface-800 hover:bg-surface-700 text-brand-400 border-surface-700 text-xs font-mono"
                  >
                    Exact ({formatCurrency(grand_total)})
                  </Button>
                  {[50, 100, 500, 1000].map((taka) => (
                    <Button
                      key={taka}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd(taka)}
                      className="bg-surface-800 hover:bg-surface-700 text-white border-surface-700 text-xs font-mono"
                    >
                      +{taka}৳
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { playClick(); setTenderedPaise(50000) }}
                    className="bg-surface-800 hover:bg-surface-700 text-white border-surface-700 text-xs font-mono"
                  >
                    500৳ Note
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { playClick(); setTenderedPaise(100000) }}
                    className="bg-surface-800 hover:bg-surface-700 text-white border-surface-700 text-xs font-mono"
                  >
                    1000৳ Note
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'bkash' || activeTab === 'nagad') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-950 border border-surface-800">
                <div>
                  <p className="text-xs font-bold text-white uppercase">{activeTab} Merchant Number</p>
                  <p className="text-sm font-mono text-brand-400 font-bold mt-0.5">01712-345678 (Rangpur Bike Parlour)</p>
                </div>
                <div className="p-2 bg-surface-800 rounded-lg text-surface-400">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <div>
                <label className="text-xs text-surface-400 block mb-1">Transaction ID (TrxID) *</label>
                <Input
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="e.g. BKA8729X1Y"
                  className="bg-surface-950 border-surface-700 font-mono tracking-widest uppercase text-white h-11 focus-visible:ring-brand-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface-950 border border-surface-800 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">POS Card Terminal Ready</p>
                  <p className="text-xs text-surface-400">Insert, swipe or tap customer debit/credit card</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-surface-400 block mb-1">Card Last 4 Digits / Auth Code (Optional)</label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="e.g. 4242 or AUTH#9812"
                  className="bg-surface-950 border-surface-700 font-mono text-white h-11 focus-visible:ring-brand-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'due' && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-4 h-4" />
                Credit / Due Sale Warning
              </div>
              <p className="text-xs text-amber-200/80">
                This invoice for {formatCurrency(grand_total)} will be recorded as Outstanding Due under customer: <span className="font-bold text-white">{customer_name}</span>.
              </p>
            </div>
          )}
        </div>

        {/* Customer & Location Summary */}
        <div className="flex items-center justify-between text-xs text-surface-400 px-1">
          <div>
            Customer: <span className="font-semibold text-white">{customer_name}</span>
          </div>
          <div>
            Location: <span className="font-semibold text-white">RANGPUR BIKE PARLOUR</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-surface-800 hover:bg-surface-700 text-white border-surface-700 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isCompleteDisabled || isProcessing}
            className="flex-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-glow h-12 disabled:opacity-50 disabled:shadow-none"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <>
                Confirm & Print Receipt
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
