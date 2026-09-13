"use client"

import { Printer, CheckCircle, Download, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils/currency"
import { CartItem } from "@/store/pos"

interface POSReceiptModalProps {
  open: boolean
  onClose: () => void
  invoiceData: {
    invoiceNo: string
    date: string
    customerName: string
    items: CartItem[]
    subtotal: number
    tax: number
    discount: number
    grandTotal: number
    tendered: number
    change: number
    paymentMethod: string
  } | null
}

export function POSReceiptModal({ open, onClose, invoiceData }: POSReceiptModalProps) {
  if (!invoiceData) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-surface-950 border-surface-700 text-white p-6 shadow-2xl rounded-2xl">
        <DialogHeader className="no-print">
          <div className="flex items-center justify-between pb-2 border-b border-surface-800">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <DialogTitle className="text-lg font-display text-white">Sale Completed!</DialogTitle>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              PAID IN FULL
            </span>
          </div>
        </DialogHeader>

        {/* Thermal 80mm Receipt Card */}
        <div className="pos-receipt-print my-3 p-5 rounded-xl bg-white text-black font-mono text-xs shadow-inner space-y-3 select-text">
          {/* Business Header */}
          <div className="text-center space-y-1 border-b border-dashed border-neutral-400 pb-3">
            <h2 className="text-base font-black tracking-wide uppercase">RANGPUR BIKE PARLOUR</h2>
            <p className="text-[11px] text-neutral-600">Station Road, Rangpur, Bangladesh</p>
            <p className="text-[11px] text-neutral-600">Phone: +880 1700-000000 • VAT Reg: 18294029</p>
            <p className="text-[10px] text-neutral-500">Branch: BL0001 • Terminal: POS-01</p>
          </div>

          {/* Invoice Meta */}
          <div className="text-[11px] space-y-0.5 border-b border-dashed border-neutral-300 pb-2">
            <div className="flex justify-between">
              <span className="font-bold">INVOICE:</span>
              <span className="font-bold">{invoiceData.invoiceNo}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Date & Time:</span>
              <span>{invoiceData.date}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Customer:</span>
              <span className="font-medium text-black">{invoiceData.customerName}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Cashier:</span>
              <span>Admin (Superadmin)</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border-b border-dashed border-neutral-300 pb-2">
            <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-neutral-300">
              <span className="w-1/2">Item</span>
              <span className="w-1/6 text-center">Qty</span>
              <span className="w-1/3 text-right">Total</span>
            </div>
            <div className="divide-y divide-neutral-100 pt-1">
              {invoiceData.items.map((item, idx) => (
                <div key={idx} className="py-1 text-[11px]">
                  <div className="flex justify-between font-medium">
                    <span className="w-1/2 truncate">{item.name}</span>
                    <span className="w-1/6 text-center font-bold">x{item.quantity}</span>
                    <span className="w-1/3 text-right font-bold">{formatCurrency(item.subtotal)}</span>
                  </div>
                  <div className="text-[9px] text-neutral-500">
                    @ {formatCurrency(item.unit_price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Calculation */}
          <div className="space-y-1 text-[11px] pt-1 border-b border-dashed border-neutral-400 pb-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal:</span>
              <span>{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            {invoiceData.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{formatCurrency(invoiceData.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-600">VAT / Tax:</span>
              <span>{formatCurrency(invoiceData.tax)}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-1 border-t border-neutral-300">
              <span>NET TOTAL:</span>
              <span>{formatCurrency(invoiceData.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-700 pt-1">
              <span>Paid ({invoiceData.paymentMethod.toUpperCase()}):</span>
              <span className="font-bold">{formatCurrency(invoiceData.tendered)}</span>
            </div>
            {invoiceData.change > 0 && (
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Change Returned:</span>
                <span>{formatCurrency(invoiceData.change)}</span>
              </div>
            )}
          </div>

          {/* Barcode & Footer Greeting */}
          <div className="text-center pt-2 space-y-1.5">
            {/* Pseudo Barcode Visual */}
            <div className="flex justify-center items-center gap-1 h-8 opacity-80">
              {[4, 2, 6, 1, 3, 2, 5, 2, 4, 1, 3, 5, 2, 4, 6, 2, 3, 1, 5, 2, 4, 3, 5, 2, 6, 1, 4, 2].map((w, i) => (
                <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
              ))}
            </div>
            <p className="text-[10px] tracking-widest font-mono font-semibold">{invoiceData.invoiceNo}</p>
            <p className="text-[10px] text-neutral-600 font-sans italic pt-1">
              Thank you for choosing Rangpur Bike Parlour!
            </p>
            <p className="text-[9px] text-neutral-500">
              Goods once sold can be exchanged within 7 days with this receipt.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 no-print">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex-1 bg-surface-800 hover:bg-surface-700 text-white border-surface-700 h-11"
          >
            <Printer className="w-4 h-4 mr-2 text-brand-400" />
            Print Receipt
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-brand-600 hover:bg-brand-500 text-white shadow-glow h-11"
          >
            New Sale
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
