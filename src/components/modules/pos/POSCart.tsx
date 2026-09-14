"use client"

import { useState, useEffect } from "react"
import { 
  Trash2, UserPlus, CreditCard, Banknote, Smartphone, Clock, 
  ArrowRight, ShoppingCart, Percent, FileText, PauseCircle,
  PlayCircle, Sparkles, Check, ChevronDown, Plus, Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePOSStore } from "@/store/pos"
import { formatCurrency } from "@/lib/utils/currency"
import { playClick, playBeep } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { POSPaymentModal } from "./POSPaymentModal"
import { POSReceiptModal } from "./POSReceiptModal"

interface CustomerItem {
  id: string
  name: string
  phone: string
}

export default function POSCart() {
  const { toast } = useToast()
  const { 
    cart, grand_total, subtotal, total_tax, total_discount,
    customer_id, customer_name, order_notes, held_carts,
    removeItem, updateQuantity, clearCart, setCustomer, 
    setOrderNotes, setGlobalDiscount, holdCurrentCart, 
    restoreHeldCart, deleteHeldCart, setPayment, payment_method
  } = usePOSStore()

  const items = Array.from(cart.values())

  // Modal States
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [completedInvoice, setCompletedInvoice] = useState<any>(null)
  
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")

  const [isDiscountOpen, setIsDiscountOpen] = useState(false)
  const [discountVal, setDiscountVal] = useState<string>("0")
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed')

  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState("")

  const [isHeldOpen, setIsHeldOpen] = useState(false)

  // Live Customers State
  const [customers, setCustomers] = useState<CustomerItem[]>([
    { id: '1', name: 'Walk-In Customer', phone: 'N/A' }
  ])

  useEffect(() => {
    async function fetchCustomers() {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, mobile, type')
        // if type exists, we filter, else just bring all contacts for now
        // .eq('type', 'customer')

      if (data) {
        const liveCustomers = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.mobile || 'N/A'
        }))
        setCustomers([{ id: '1', name: 'Walk-In Customer', phone: 'N/A' }, ...liveCustomers])
      }
    }
    fetchCustomers()
  }, [])

  // Handlers
  const handleAddCustomer = () => {
    if (!newCustomerName.trim()) {
      toast({ title: "Name required", description: "Please enter customer name", variant: "destructive" })
      return
    }
    const newId = `CUST-${Date.now()}`
    setCustomer(newId, newCustomerName)
    playClick()
    toast({ title: "Customer Added", description: `${newCustomerName} selected.` })
    setNewCustomerName("")
    setNewCustomerPhone("")
    setIsAddCustomerOpen(false)
  }

  const handleApplyDiscount = () => {
    const val = Math.max(0, Number(discountVal))
    if (discountType === 'fixed') {
      setGlobalDiscount('fixed', val * 100) // to paise
    } else {
      setGlobalDiscount('percentage', val)
    }
    playClick()
    toast({ title: "Discount Applied", description: `Cart discount updated.` })
    setIsDiscountOpen(false)
  }

  const handleSaveNotes = () => {
    setOrderNotes(noteText)
    playClick()
    toast({ title: "Notes Saved", description: "Remarks attached to invoice." })
    setIsNoteOpen(false)
  }

  const handleQuickPaymentClick = (method: 'cash' | 'card' | 'mobile' | 'due') => {
    playClick()
    setPayment(grand_total, method)
    setIsPaymentOpen(true)
  }

  const handleSaleComplete = (invoiceData: any) => {
    setCompletedInvoice(invoiceData)
    setIsReceiptOpen(true)
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-white relative select-none z-10">
      {/* Customer Selection Bar */}
      <div className="p-3.5 border-b border-white/10 bg-surface-900/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          {/* Customer Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-surface-800/80 border border-surface-700 hover:border-brand-500/50 hover:bg-surface-800 transition-all text-xs font-medium text-left">
                <div className="truncate">
                  <span className="text-surface-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="text-white font-bold truncate block">{customer_name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-surface-400 shrink-0 ml-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-surface-900 border-surface-700 text-surface-200">
              {customers.map((cust) => (
                <DropdownMenuItem
                  key={cust.id}
                  onClick={() => {
                    playClick()
                    setCustomer(cust.id === '1' ? null : cust.id, cust.name)
                  }}
                  className="cursor-pointer hover:bg-surface-800 flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-semibold text-white text-xs">{cust.name}</p>
                    <p className="text-[10px] text-surface-400 font-mono">{cust.phone}</p>
                  </div>
                  {customer_name === cust.name && <Check className="w-4 h-4 text-brand-400" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Customer Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => { playClick(); setIsAddCustomerOpen(true) }}
            className="h-11 w-11 shrink-0 rounded-xl border-surface-700 bg-surface-800 hover:bg-brand-600 hover:text-white hover:border-brand-600 text-surface-300 transition-all"
            title="Add New Customer"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-surface-500 space-y-3 py-10">
            <div className="w-16 h-16 rounded-2xl border border-dashed border-surface-700 flex items-center justify-center bg-surface-900/50">
              <ShoppingCart className="h-8 w-8 text-surface-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-surface-300">Terminal Cart is Empty</p>
              <p className="text-xs text-surface-500 mt-0.5">Click products from catalog to add</p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col p-3 rounded-2xl glass-panel border border-white/5 hover:border-brand-500/40 hover:shadow-[0_0_15px_rgba(var(--brand-500),0.2)] transition-all group"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="font-medium text-xs text-surface-200 line-clamp-2 leading-snug">
                  {item.name}
                </span>
                <span className="font-mono text-xs text-brand-400 font-bold shrink-0">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                {/* Quantity Controls */}
                <div className="flex items-center bg-surface-950 rounded-lg border border-surface-700 p-0.5">
                  <button
                    onClick={() => { playClick(); updateQuantity(item.id, item.quantity - 1) }}
                    className="h-6 w-6 rounded flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-mono font-bold w-7 text-center text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => { playClick(); updateQuantity(item.id, item.quantity + 1) }}
                    className="h-6 w-6 rounded flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Unit Price & Delete */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-surface-400">
                    @ {formatCurrency(item.unit_price)}
                  </span>
                  <button
                    onClick={() => { playClick(); removeItem(item.id) }}
                    className="h-6 w-6 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded flex items-center justify-center transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Quick Utility Toolbar (Discount, Note, Hold, Clear) */}
      <div className="px-3.5 py-2 border-t border-white/5 bg-surface-900/20 backdrop-blur-sm flex items-center justify-between gap-1.5 shrink-0 text-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { playClick(); setIsDiscountOpen(true) }}
          className="h-8 px-2.5 text-surface-300 hover:text-brand-400 hover:bg-surface-800 text-[11px] gap-1"
        >
          <Percent className="w-3.5 h-3.5" />
          Discount
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { playClick(); setIsNoteOpen(true) }}
          className="h-8 px-2.5 text-surface-300 hover:text-brand-400 hover:bg-surface-800 text-[11px] gap-1"
        >
          <FileText className="w-3.5 h-3.5" />
          Notes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { playClick(); holdCurrentCart(); toast({ title: "Sale Suspended", description: "Cart held for later retrieval." }) }}
          disabled={items.length === 0}
          className="h-8 px-2.5 text-surface-300 hover:text-amber-400 hover:bg-surface-800 text-[11px] gap-1 disabled:opacity-40"
        >
          <PauseCircle className="w-3.5 h-3.5" />
          Hold ({held_carts.length})
        </Button>
        {held_carts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playClick(); setIsHeldOpen(true) }}
            className="h-8 px-2 text-amber-400 hover:bg-amber-500/10 text-[11px]"
          >
            Recall
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { playClick(); clearCart(); toast({ title: "Cart Cleared" }) }}
          disabled={items.length === 0}
          className="h-8 px-2 text-surface-400 hover:text-red-400 hover:bg-red-500/10 text-[11px] disabled:opacity-40 ml-auto"
        >
          Clear
        </Button>
      </div>

      {/* Totals & Quick Payment Footer */}
      <div className="p-5 bg-surface-900/40 backdrop-blur-xl border-t border-white/10 shadow-2xl shrink-0 z-10 space-y-4">
        {/* Financial Summary */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-surface-400">
            <span>Subtotal</span>
            <span className="font-mono text-white font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {total_discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Total Discount</span>
              <span className="font-mono">-{formatCurrency(total_discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-surface-400">
            <span>VAT / Tax</span>
            <span className="font-mono text-white font-medium">{formatCurrency(total_tax)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-surface-800">
            <span>Payable Total</span>
            <span className="font-mono text-brand-400 text-lg">{formatCurrency(grand_total)}</span>
          </div>
        </div>

        {/* Quick Payment Method Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            onClick={() => handleQuickPaymentClick('cash')}
            disabled={items.length === 0}
            className="h-12 flex-col gap-1 border-surface-700 bg-surface-800 hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40"
          >
            <Banknote className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-bold">Cash</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickPaymentClick('card')}
            disabled={items.length === 0}
            className="h-12 flex-col gap-1 border-surface-700 bg-surface-800 hover:bg-blue-500/20 hover:border-blue-500 hover:text-blue-400 disabled:opacity-40"
          >
            <CreditCard className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] font-bold">Card</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickPaymentClick('mobile')}
            disabled={items.length === 0}
            className="h-12 flex-col gap-1 border-surface-700 bg-surface-800 hover:bg-pink-500/20 hover:border-pink-500 hover:text-pink-400 disabled:opacity-40"
          >
            <Smartphone className="h-4 w-4 text-pink-400" />
            <span className="text-[10px] font-bold">bKash</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickPaymentClick('due')}
            disabled={items.length === 0}
            className="h-12 flex-col gap-1 border-surface-700 bg-surface-800 hover:bg-amber-500/20 hover:border-amber-500 hover:text-amber-400 disabled:opacity-40"
          >
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-bold">Credit</span>
          </Button>
        </div>

        {/* Primary Checkout Button */}
        <Button
          onClick={() => { playClick(); setIsPaymentOpen(true) }}
          disabled={items.length === 0}
          className="w-full h-14 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_20px_rgba(var(--brand-500),0.4)] hover:shadow-[0_0_30px_rgba(var(--brand-500),0.6)] disabled:opacity-50 disabled:shadow-none rounded-2xl transition-all"
        >
          <span>Confirm Sale (F10)</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Modal: Add Customer Inline */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-5 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display">Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs text-surface-300">Customer Name *</Label>
              <Input
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="e.g. Al-Amin Bike Rider"
                className="bg-surface-800 border-surface-700 text-white mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs text-surface-300">Mobile Number (Optional)</Label>
              <Input
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="bg-surface-800 border-surface-700 text-white mt-1"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)} className="border-surface-700 bg-surface-800 text-white">
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} className="bg-brand-600 hover:bg-brand-500 text-white">
              Save & Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cart Discount */}
      <Dialog open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-5 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display">Add Cart Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={discountType === 'fixed' ? 'default' : 'outline'}
                onClick={() => setDiscountType('fixed')}
                className={`flex-1 ${discountType === 'fixed' ? 'bg-brand-600' : 'border-surface-700 bg-surface-800 text-white'}`}
              >
                Fixed (৳ BDT)
              </Button>
              <Button
                type="button"
                variant={discountType === 'percentage' ? 'default' : 'outline'}
                onClick={() => setDiscountType('percentage')}
                className={`flex-1 ${discountType === 'percentage' ? 'bg-brand-600' : 'border-surface-700 bg-surface-800 text-white'}`}
              >
                Percentage (%)
              </Button>
            </div>
            <div>
              <Label className="text-xs text-surface-300">Discount Amount</Label>
              <Input
                type="number"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                placeholder="0"
                className="bg-surface-800 border-surface-700 text-white mt-1 font-mono text-lg font-bold"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDiscountOpen(false)} className="border-surface-700 bg-surface-800 text-white">
              Cancel
            </Button>
            <Button onClick={handleApplyDiscount} className="bg-brand-600 hover:bg-brand-500 text-white">
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Order Notes */}
      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-5 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display">Order Remarks / Notes</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Delivered with helmet bag, paid partial..."
              className="bg-surface-800 border-surface-700 text-white"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsNoteOpen(false)} className="border-surface-700 bg-surface-800 text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} className="bg-brand-600 hover:bg-brand-500 text-white">
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Suspended Held Carts Recall */}
      <Dialog open={isHeldOpen} onOpenChange={setIsHeldOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white p-5 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display flex items-center gap-2">
              <PauseCircle className="w-5 h-5 text-amber-400" />
              Held / Suspended Sales ({held_carts.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2.5 max-h-72 overflow-y-auto mt-2">
            {held_carts.map((h) => (
              <div key={h.id} className="p-3 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-xs">{h.customer_name}</p>
                  <p className="text-[11px] text-surface-400 font-mono">{h.items.length} items • {h.time}</p>
                  <p className="text-xs font-bold text-brand-400 font-mono mt-1">{formatCurrency(h.grand_total)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      playClick()
                      restoreHeldCart(h.id)
                      setIsHeldOpen(false)
                      toast({ title: "Cart Restored", description: `Resumed order for ${h.customer_name}` })
                    }}
                    className="bg-brand-600 hover:bg-brand-500 text-white text-xs h-8 px-3"
                  >
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { playClick(); deleteHeldCart(h.id) }}
                    className="h-8 w-8 text-surface-500 hover:text-red-400 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <POSPaymentModal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSaleComplete={handleSaleComplete}
      />

      {/* Receipt Modal */}
      <POSReceiptModal
        open={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoiceData={completedInvoice}
      />
    </div>
  )
}
